from rest_framework import serializers
from .models import Poll, Question, Choice, Answer


class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ['id', 'text', 'order']


class QuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True, read_only=True)
    depends_on_question_id = serializers.IntegerField(
        source='depends_on_question.id', 
        read_only=True
    )
    condition_value = serializers.CharField(read_only=True)
    condition_operator = serializers.CharField(read_only=True)
    
    class Meta:
        model = Question
        fields = [
            'id', 'text', 'question_type', 'order', 'is_required',
            'choices', 'depends_on_question_id', 'condition_value', 'condition_operator'
        ]


class PollSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    creator_username = serializers.CharField(source='creator.username', read_only=True)
    is_expired = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Poll
        fields = [
            'id', 'title', 'description', 'creator_username', 'created_at',
            'expires_at', 'is_active', 'allow_anonymous', 'is_expired', 'questions'
        ]


class PollCreateSerializer(serializers.ModelSerializer):
    questions = serializers.ListField(
        child=serializers.DictField(),
        write_only=True
    )
    
    class Meta:
        model = Poll
        fields = ['title', 'description', 'expires_at', 'allow_anonymous', 'questions']
    
    def create(self, validated_data):
        questions_data = validated_data.pop('questions')
        validated_data['creator'] = self.context['request'].user
        
        poll = Poll.objects.create(**validated_data)
        
        for i, question_data in enumerate(questions_data):
            choices_data = question_data.pop('choices', [])
            depends_on = question_data.pop('depends_on', None)
            
            # Handle conditional logic
            if depends_on:
                question_data['depends_on_question_id'] = depends_on.get('question_id')
                question_data['condition_value'] = depends_on.get('value')
                question_data['condition_operator'] = depends_on.get('operator', 'equals')
            
            question_data['order'] = i
            question = Question.objects.create(poll=poll, **question_data)
            
            # Create choices for multiple choice questions
            for j, choice_data in enumerate(choices_data):
                Choice.objects.create(
                    question=question,
                    text=choice_data['text'],
                    order=j
                )
        
        return poll


class AnswerSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source='question.text', read_only=True)
    answer_value = serializers.SerializerMethodField()
    
    class Meta:
        model = Answer
        fields = ['id', 'question', 'question_text', 'answer_value', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_answer_value(self, obj):
        return obj.answer_value


class AnswerSubmitSerializer(serializers.ModelSerializer):
    answers = serializers.ListField(
        child=serializers.DictField(),
        write_only=True
    )
    
    class Meta:
        model = Answer
        fields = ['answers']
    
    def create(self, validated_data):
        answers_data = validated_data['answers']
        poll_id = self.context['poll_id']
        user = self.context.get('request').user if self.context.get('request') else None
        session_id = self.context.get('session_id', '')
        
        created_answers = []
        
        for answer_data in answers_data:
            question_id = answer_data['question_id']
            answer_value = answer_data['answer_value']
            
            # Get the question to determine the answer format
            try:
                question = Question.objects.get(id=question_id, poll_id=poll_id)
            except Question.DoesNotExist:
                raise serializers.ValidationError(f"Question {question_id} not found")
            
            # Create the answer
            answer = Answer.objects.create(
                poll_id=poll_id,
                question=question,
                user=user,
                session_id=session_id if not user else ''
            )
            
            # Set the answer value based on question type
            if question.question_type == 'single_choice':
                answer.answer_data = {'choice_id': answer_value}
            elif question.question_type == 'multiple_choice':
                answer.answer_data = {'choice_ids': answer_value if isinstance(answer_value, list) else [answer_value]}
            elif question.question_type == 'text':
                answer.answer_data = {'text': answer_value}
            else:
                answer.answer_data = {'value': answer_value}
            
            answer.save()
            created_answers.append(answer)
        
        return created_answers[0] if created_answers else None


class PollResultsSerializer(serializers.Serializer):
    question_id = serializers.IntegerField()
    question_text = serializers.CharField()
    question_type = serializers.CharField()
    results = serializers.DictField()
    total_responses = serializers.IntegerField()
