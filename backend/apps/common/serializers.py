from rest_framework import serializers
from .models import Feedback

class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = ['id', 'name', 'email', 'rating', 'subject', 'message', 'page_url', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def create(self, validated_data):
        request = self.context.get('request')
        # If user is logged in, associate feedback with user and auto-fill name/email
        if request and request.user.is_authenticated:
            validated_data['user'] = request.user
            if not validated_data.get('name'):
                validated_data['name'] = request.user.get_full_name() or request.user.username
            if not validated_data.get('email'):
                validated_data['email'] = request.user.email
        return super().create(validated_data)

class AdminFeedbackSerializer(serializers.ModelSerializer):
    user_info = serializers.SerializerMethodField()
    
    class Meta:
        model = Feedback
        fields = ['id', 'name', 'email', 'rating', 'subject', 'message', 'page_url', 'created_at', 'user_info']
    
    def get_user_info(self, obj):
        if obj.user:
            return {
                'id': obj.user.id,
                'username': obj.user.username,
                'email': obj.user.email
            }
        return None