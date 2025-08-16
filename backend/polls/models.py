from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
import json


class Poll(models.Model):
    """Poll model with title, description, and metadata."""
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_polls')
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    allow_anonymous = models.BooleanField(default=True)
    
    def __str__(self):
        return self.title
    
    @property
    def is_expired(self):
        if self.expires_at:
            from django.utils import timezone
            return timezone.now() > self.expires_at
        return False


class Question(models.Model):
    """Question model with conditional logic support."""
    QUESTION_TYPES = [
        ('single_choice', 'Single Choice'),
        ('multiple_choice', 'Multiple Choice'),
        ('text', 'Text'),
    ]
    
    poll = models.ForeignKey(Poll, on_delete=models.CASCADE, related_name='questions')
    text = models.CharField(max_length=500)
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPES)
    order = models.PositiveIntegerField(default=0)
    is_required = models.BooleanField(default=True)
    
    # Conditional logic fields
    depends_on_question = models.ForeignKey(
        'self', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='dependent_questions'
    )
    condition_value = models.CharField(max_length=200, blank=True)
    condition_operator = models.CharField(
        max_length=10,
        choices=[
            ('equals', 'Equals'),
            ('not_equals', 'Not Equals'),
            ('contains', 'Contains'),
            ('not_contains', 'Not Contains'),
        ],
        default='equals'
    )
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"{self.poll.title} - {self.text}"
    
    def clean(self):
        """Validate conditional logic."""
        if self.depends_on_question and not self.condition_value:
            raise ValidationError("Condition value is required when question depends on another.")
        
        if self.depends_on_question and self.depends_on_question.poll != self.poll:
            raise ValidationError("Dependent question must belong to the same poll.")
    
    def should_show(self, previous_answers):
        """Determine if this question should be shown based on previous answers."""
        if not self.depends_on_question:
            return True
        
        if self.depends_on_question.id not in previous_answers:
            return False
        
        answer_value = previous_answers[self.depends_on_question.id]
        
        if self.condition_operator == 'equals':
            return str(answer_value) == self.condition_value
        elif self.condition_operator == 'not_equals':
            return str(answer_value) != self.condition_value
        elif self.condition_operator == 'contains':
            return self.condition_value in str(answer_value)
        elif self.condition_operator == 'not_contains':
            return self.condition_value not in str(answer_value)
        
        return True


class Choice(models.Model):
    """Choice model for multiple choice questions."""
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='choices')
    text = models.CharField(max_length=200)
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return self.text


class Answer(models.Model):
    """Answer model to store user responses."""
    poll = models.ForeignKey(Poll, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='answers')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    session_id = models.CharField(max_length=100, blank=True)  # For anonymous users
    
    # Store answer data as JSON to handle different question types
    answer_data = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        user_info = self.user.username if self.user else f"Anonymous ({self.session_id})"
        return f"{user_info} - {self.question.text}"
    
    def get_answer_value(self):
        """Extract the answer value from JSON data."""
        if self.question.question_type == 'single_choice':
            return self.answer_data.get('choice_id')
        elif self.question.question_type == 'multiple_choice':
            return self.answer_data.get('choice_ids', [])
        elif self.question.question_type == 'text':
            return self.answer_data.get('text', '')
        return None
    
    def set_answer_value(self, value):
        """Set the answer value in JSON data."""
        if self.question.question_type == 'single_choice':
            self.answer_data = {'choice_id': value}
        elif self.question.question_type == 'multiple_choice':
            self.answer_data = {'choice_ids': value if isinstance(value, list) else [value]}
        elif self.question.question_type == 'text':
            self.answer_data = {'text': value}
        else:
            self.answer_data = {'value': value}
    
    answer_value = property(get_answer_value, set_answer_value)
