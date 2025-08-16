import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Poll


class PollConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.poll_id = self.scope['url_route']['kwargs']['poll_id']
        self.room_group_name = f'poll_{self.poll_id}'
        
        # Check if poll exists
        poll_exists = await self.poll_exists()
        if not poll_exists:
            await self.close()
            return
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
    
    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        """Handle incoming messages from WebSocket."""
        try:
            text_data_json = json.loads(text_data)
            message_type = text_data_json.get('type')
            
            if message_type == 'poll_update':
                # Broadcast poll update to all clients in the room
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'poll_update',
                        'message': text_data_json.get('message', 'Poll updated')
                    }
                )
        except json.JSONDecodeError:
            pass
    
    async def poll_update(self, event):
        """Send poll update to WebSocket."""
        await self.send(text_data=json.dumps({
            'type': 'poll_update',
            'message': event['message']
        }))
    
    @database_sync_to_async
    def poll_exists(self):
        """Check if the poll exists."""
        try:
            return Poll.objects.filter(id=self.poll_id, is_active=True).exists()
        except:
            return False
