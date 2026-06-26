from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from .models import ChatSession, ChatMessage
from .intents import get_intent, get_response
import uuid
import logging

# Set up logging
logger = logging.getLogger(__name__)

class ChatbotView(APIView):
    permission_classes = [AllowAny]
    
    def get_or_create_session(self, request, language='en'):
        session_id = request.headers.get('X-Session-ID')
        
        if not session_id:
            session_id = str(uuid.uuid4())
        
        print(f"🔍 [SESSION] Getting/Creating session: {session_id} with language: {language}")
        
        session, created = ChatSession.objects.get_or_create(
            session_id=session_id,
            defaults={
                'user': request.user if request.user.is_authenticated else None,
                'language': language
            }
        )
        
        if created:
            print(f"🔍 [SESSION] Created new session with language: {language}")
        else:
            print(f"🔍 [SESSION] Existing session found. Current language: {session.language}")
        
        if not created and session.language != language:
            print(f"🔍 [SESSION] Updating language from {session.language} to {language}")
            session.language = language
            session.save()
        
        if not created and request.user.is_authenticated and not session.user:
            session.user = request.user
            session.save()
        
        return session
    
    def post(self, request):
        message = request.data.get('message', '').strip()
        language = request.data.get('language', 'en')
        
        print(f"🔍 [REQUEST] ====================")
        print(f"🔍 [REQUEST] Message: '{message}'")
        print(f"🔍 [REQUEST] Language from frontend: '{language}'")
        print(f"🔍 [REQUEST] Full request data: {request.data}")
        print(f"🔍 [REQUEST] Headers: {dict(request.headers)}")
        print(f"🔍 [REQUEST] ====================")
        
        if not message:
            return Response({'error': 'Message is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        session = self.get_or_create_session(request, language=language)
        
        print(f"🔍 [SESSION] Final session language: {session.language}")
        
        ChatMessage.objects.create(
            session=session,
            role='user',
            content=message
        )
        
        print(f"🔍 [INTENT] Calling get_intent with language={language}")
        intent = get_intent(message, language=language)
        print(f"🔍 [INTENT] Result: {intent}")
        
        print(f"🔍 [RESPONSE] Calling get_response with intent={intent}, language={language}")
        response_text = get_response(intent, language=language)
        print(f"🔍 [RESPONSE] Response preview: {response_text[:100]}...")
        
        ChatMessage.objects.create(
            session=session,
            role='assistant',
            content=response_text,
            intent=intent
        )
        
        history = ChatMessage.objects.filter(session=session).order_by('-created_at')[:10]
        
        return Response({
            'response': response_text,
            'intent': intent,
            'session_id': session.session_id,
            'language': session.language,
            'history': [
                {'role': msg.role, 'content': msg.content, 'created_at': msg.created_at}
                for msg in reversed(history)
            ]
        })

class ChatHistoryView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        sessions = ChatSession.objects.filter(user=request.user, is_active=True)
        data = []
        
        for session in sessions:
            messages = ChatMessage.objects.filter(session=session)[:20]
            data.append({
                'session_id': session.session_id,
                'created_at': session.created_at,
                'message_count': messages.count(),
                'messages': [
                    {'role': msg.role, 'content': msg.content, 'created_at': msg.created_at}
                    for msg in messages
                ]
            })
        
        return Response(data)

class ClearChatView(APIView):
    permission_classes = [AllowAny]
    
    def delete(self, request):
        session_id = request.headers.get('X-Session-ID')
        
        if session_id:
            ChatSession.objects.filter(session_id=session_id).delete()
        
        return Response({'message': 'Chat cleared successfully'})