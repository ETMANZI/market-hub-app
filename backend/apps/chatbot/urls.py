from django.urls import path
from .views import ChatbotView, ChatHistoryView, ClearChatView

urlpatterns = [
    path('chat/', ChatbotView.as_view(), name='chatbot'),
    path('chat/history/', ChatHistoryView.as_view(), name='chat-history'),
    path('chat/clear/', ClearChatView.as_view(), name='clear-chat'),
]