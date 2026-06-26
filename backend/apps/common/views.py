from rest_framework import generics, permissions
from .models import Feedback
from .serializers import FeedbackSerializer, AdminFeedbackSerializer
from rest_framework.response import Response

class CreateFeedbackView(generics.CreateAPIView):
    """Create new feedback -任何人都可以提交"""
    serializer_class = FeedbackSerializer
    permission_classes = [permissions.AllowAny]

class AdminFeedbackListView(generics.ListAPIView):
    """Admin: View all feedback - 仅管理员可见"""
    serializer_class = AdminFeedbackSerializer
    permission_classes = [permissions.IsAdminUser]
    
    def get_queryset(self):
        queryset = Feedback.objects.all()
        
        # Optional filtering
        subject = self.request.query_params.get('subject')
        if subject:
            queryset = queryset.filter(subject=subject)
        
        min_rating = self.request.query_params.get('min_rating')
        if min_rating:
            queryset = queryset.filter(rating__gte=min_rating)
        
        return queryset

class AdminFeedbackDeleteView(generics.DestroyAPIView):
    """Admin: Delete feedback - 仅管理员可以删除"""
    permission_classes = [permissions.IsAdminUser]
    queryset = Feedback.objects.all()
    lookup_field = 'id'

class AdminFeedbackStatsView(generics.ListAPIView):
    """Admin: Get feedback statistics - 仅管理员可见"""
    permission_classes = [permissions.IsAdminUser]
    
    def get(self, request):
        from django.db.models import Avg, Count
        
        total = Feedback.objects.count()
        avg_rating = Feedback.objects.aggregate(avg=Avg('rating'))['avg'] or 0
        
        # Rating distribution
        rating_distribution = {}
        for i in range(1, 6):
            rating_distribution[f'{i}_star'] = Feedback.objects.filter(rating=i).count()
        
        # Subject distribution
        subject_distribution = dict(
            Feedback.objects.values('subject').annotate(count=Count('id'))
            .values_list('subject', 'count')
        )
        
        return Response({
            'total': total,
            'avg_rating': round(avg_rating, 1),
            'rating_distribution': rating_distribution,
            'subject_distribution': subject_distribution,
        })