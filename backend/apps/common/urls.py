from django.urls import path
from .views import (
    CreateFeedbackView,
    AdminFeedbackListView,
    AdminFeedbackDeleteView,
    AdminFeedbackStatsView,
)

urlpatterns = [
    # Public - anyone can submit feedback
    path('feedback/', CreateFeedbackView.as_view(), name='create-feedback'),
    
    # Admin only
    path('admin/feedbacks/', AdminFeedbackListView.as_view(), name='admin-feedbacks'),
    path('admin/feedbacks/stats/', AdminFeedbackStatsView.as_view(), name='admin-feedback-stats'),
    path('admin/feedbacks/<int:id>/delete/', AdminFeedbackDeleteView.as_view(), name='admin-feedback-delete'),
]