from django.contrib import admin
from .models import Poll, Question, Choice, Answer


class ChoiceInline(admin.TabularInline):
    model = Choice
    extra = 3


class QuestionInline(admin.TabularInline):
    model = Question
    extra = 1
    fields = ['text', 'question_type', 'order', 'is_required', 'depends_on_question', 'condition_value', 'condition_operator']


@admin.register(Poll)
class PollAdmin(admin.ModelAdmin):
    list_display = ['title', 'creator', 'created_at', 'expires_at', 'is_active', 'is_expired']
    list_filter = ['is_active', 'created_at', 'expires_at']
    search_fields = ['title', 'description', 'creator__username']
    readonly_fields = ['created_at', 'is_expired']
    inlines = [QuestionInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'creator')
        }),
        ('Settings', {
            'fields': ('expires_at', 'is_active', 'allow_anonymous')
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ['text', 'poll', 'question_type', 'order', 'is_required', 'has_conditional_logic']
    list_filter = ['question_type', 'is_required', 'poll']
    search_fields = ['text', 'poll__title']
    ordering = ['poll', 'order']
    inlines = [ChoiceInline]
    
    def has_conditional_logic(self, obj):
        return bool(obj.depends_on_question)
    has_conditional_logic.boolean = True
    has_conditional_logic.short_description = 'Conditional Logic'


@admin.register(Choice)
class ChoiceAdmin(admin.ModelAdmin):
    list_display = ['text', 'question', 'order']
    list_filter = ['question__poll']
    search_fields = ['text', 'question__text']
    ordering = ['question', 'order']


@admin.register(Answer)
class AnswerAdmin(admin.ModelAdmin):
    list_display = ['poll', 'question', 'user_or_session', 'created_at']
    list_filter = ['poll', 'question__question_type', 'created_at']
    search_fields = ['poll__title', 'question__text', 'user__username']
    readonly_fields = ['created_at']
    
    def user_or_session(self, obj):
        return obj.user.username if obj.user else f"Anonymous ({obj.session_id})"
    user_or_session.short_description = 'User/Session'
