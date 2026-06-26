from django.db import models
from django.conf import settings

class ChatSession(models.Model):
    LANGUAGE_CHOICES = (
        ('en', 'English'),
        ('rw', 'Kinyarwanda'),
    )
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='chat_sessions'
    )
    session_id = models.CharField(max_length=100, unique=True)
    language = models.CharField(
        max_length=2, 
        choices=LANGUAGE_CHOICES, 
        default='en'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        lang_display = dict(self.LANGUAGE_CHOICES).get(self.language, 'English')
        return f"Session {self.session_id} - {self.user or 'Anonymous'} ({lang_display})"

class ChatMessage(models.Model):
    ROLE_CHOICES = (
        ('user', 'User'),
        ('assistant', 'Assistant'),
        ('system', 'System'),
    )
    
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')
    content = models.TextField()
    intent = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.role}: {self.content[:50]}"