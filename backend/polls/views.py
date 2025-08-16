from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.db.models import Count, Q
from django.utils import timezone
import uuid

from .models import Poll, Question, Choice, Answer
from .serializers import (
    PollSerializer, PollCreateSerializer, AnswerSerializer,
    AnswerSubmitSerializer, PollResultsSerializer
)


class PollViewSet(viewsets.ModelViewSet):
    """ViewSet for Poll operations."""
    queryset = Poll.objects.all()
    serializer_class = PollSerializer
    permission_classes = [AllowAny]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return PollCreateSerializer
        return PollSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated()]
        return [AllowAny()]
    
    def create(self, request, *args, **kwargs):
        """Create a new poll with questions and conditional logic."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        poll = serializer.save()
        
        # Return the created poll with full details
        full_serializer = PollSerializer(poll)
        return Response(full_serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'])
    def results(self, request, pk=None):
        """Get aggregated results for a poll."""
        poll = self.get_object()
        
        if not poll.is_active or poll.is_expired:
            return Response(
                {"error": "Poll is not active or has expired"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        results = []
        questions = poll.questions.all()
        
        for question in questions:
            question_results = self._get_question_results(question)
            results.append(question_results)
        
        return Response(results)
    
    def _get_question_results(self, question):
        """Calculate results for a specific question."""
        answers = question.answers.all()
        total_responses = answers.count()
        
        if question.question_type == 'single_choice':
            results = {}
            for choice in question.choices.all():
                count = answers.filter(answer_data__choice_id=choice.id).count()
                results[choice.text] = count
            return PollResultsSerializer({
                'question_id': question.id,
                'question_text': question.text,
                'question_type': question.question_type,
                'results': results,
                'total_responses': total_responses
            }).data
        
        elif question.question_type == 'multiple_choice':
            results = {}
            for choice in question.choices.all():
                count = answers.filter(answer_data__choice_ids__contains=choice.id).count()
                results[choice.text] = count
            return PollResultsSerializer({
                'question_id': question.id,
                'question_text': question.text,
                'question_type': question.question_type,
                'results': results,
                'total_responses': total_responses
            }).data
        
        elif question.question_type == 'text':
            # For text questions, return sample responses
            text_answers = answers.values_list('answer_data__text', flat=True)[:10]
            return PollResultsSerializer({
                'question_id': question.id,
                'question_text': question.text,
                'question_type': question.question_type,
                'results': {'sample_responses': list(text_answers)},
                'total_responses': total_responses
            }).data
        
        return PollResultsSerializer({
            'question_id': question.id,
            'question_text': question.text,
            'question_type': question.question_type,
            'results': {},
            'total_responses': total_responses
        }).data


class AnswerViewSet(viewsets.ModelViewSet):
    """ViewSet for Answer operations."""
    queryset = Answer.objects.all()
    serializer_class = AnswerSerializer
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['post'], url_path='submit/(?P<poll_id>[^/.]+)')
    def submit_answers(self, request, poll_id=None):
        """Submit answers for a poll with conditional logic support."""
        poll = get_object_or_404(Poll, id=poll_id)
        
        if not poll.is_active or poll.is_expired:
            return Response(
                {"error": "Poll is not active or has expired"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Generate session ID for anonymous users
        session_id = str(uuid.uuid4()) if not request.user.is_authenticated else ''
        
        serializer = AnswerSubmitSerializer(
            data=request.data,
            context={'poll_id': poll_id, 'request': request, 'session_id': session_id}
        )
        serializer.is_valid(raise_exception=True)
        
        # Validate conditional logic
        answers_data = request.data.get('answers', [])
        if not self._validate_conditional_logic(poll, answers_data):
            return Response(
                {"error": "Invalid conditional logic in answers"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer.save()
        
        return Response(
            {"message": "Answers submitted successfully", "session_id": session_id},
            status=status.HTTP_201_CREATED
        )
    
    def _validate_conditional_logic(self, poll, answers_data):
        """Validate that conditional logic is respected in the submitted answers."""
        questions = poll.questions.all()
        previous_answers = {}
        
        for question in questions:
            # Find the answer for this question
            answer_data = next(
                (a for a in answers_data if a['question_id'] == question.id), 
                None
            )
            
            if answer_data:
                # Check if this question should be shown based on previous answers
                if not question.should_show(previous_answers):
                    return False
                
                # Store the answer for future conditional checks
                previous_answers[question.id] = answer_data['answer_value']
            elif question.is_required and question.should_show(previous_answers):
                # Required question that should be shown but wasn't answered
                return False
        
        return True


class PollParticipationViewSet(viewsets.ViewSet):
    """ViewSet for poll participation (getting questions with conditional logic)."""
    permission_classes = [AllowAny]
    
    @action(detail=True, methods=['get'], url_path='questions')
    def get_questions(self, request, pk=None):
        """Get questions for a poll, respecting conditional logic based on previous answers."""
        poll = get_object_or_404(Poll, id=pk)
        
        if not poll.is_active or poll.is_expired:
            return Response(
                {"error": "Poll is not active or has expired"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get previous answers from session or user
        session_id = request.query_params.get('session_id', '')
        user = request.user if request.user.is_authenticated else None
        
        previous_answers = self._get_previous_answers(poll, user, session_id)
        
        # Filter questions based on conditional logic
        visible_questions = []
        for question in poll.questions.all():
            if question.should_show(previous_answers):
                question_data = {
                    'id': question.id,
                    'text': question.text,
                    'question_type': question.question_type,
                    'is_required': question.is_required,
                    'choices': [
                        {'id': choice.id, 'text': choice.text}
                        for choice in question.choices.all()
                    ]
                }
                visible_questions.append(question_data)
        
        return Response({
            'poll_id': poll.id,
            'poll_title': poll.title,
            'questions': visible_questions
        })
    
    def _get_previous_answers(self, poll, user, session_id):
        """Get previous answers for conditional logic evaluation."""
        previous_answers = {}
        
        if user:
            answers = Answer.objects.filter(poll=poll, user=user)
        elif session_id:
            answers = Answer.objects.filter(poll=poll, session_id=session_id)
        else:
            return previous_answers
        
        for answer in answers:
            previous_answers[answer.question.id] = answer.answer_value
        
        return previous_answers
