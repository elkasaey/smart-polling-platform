from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PollViewSet, AnswerViewSet, PollParticipationViewSet

router = DefaultRouter()
router.register(r'polls', PollViewSet)
router.register(r'answers', AnswerViewSet)
router.register(r'participation', PollParticipationViewSet, basename='participation')

urlpatterns = [
    path('', include(router.urls)),
]
