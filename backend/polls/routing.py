from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/polls/(?P<poll_id>\w+)/$', consumers.PollConsumer.as_asgi()),
]
