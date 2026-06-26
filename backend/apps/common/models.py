import uuid
from django.db import models
        
from django.conf import settings

class TimeStampedModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        


class Feedback(models.Model):
    SUBJECT_CHOICES = (
        ('bug', 'Bug Report'),
        ('feature', 'Feature Request'),
        ('improvement', 'Improvement Suggestion'),
        ('question', 'Question'),
        ('other', 'Other'),
    )
    
    # User information (optional for logged-in users)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='feedbacks'
    )
    name = models.CharField(max_length=200)
    email = models.EmailField()
    
    # Feedback content
    rating = models.PositiveSmallIntegerField(choices=[(i, i) for i in range(1, 6)], default=5)
    subject = models.CharField(max_length=50, choices=SUBJECT_CHOICES)
    message = models.TextField()
    page_url = models.CharField(max_length=500, blank=True, null=True)
    
    # Timestamp
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Feedback'
        verbose_name_plural = 'Feedbacks'
    
    def __str__(self):
        return f"{self.name} - {self.get_subject_display()} - {self.rating}/5"
