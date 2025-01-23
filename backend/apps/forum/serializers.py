from rest_framework import serializers

from django.conf import settings
from django.utils import timezone

from apps.users.models import User
from apps.users.serializers import UserSerializer
from apps.forum.models import DiscussionForum,MessageDF,FileDF,ImageDF

from datetime import timedelta,datetime
import calendar


class DiscussionForumSerializer(serializers.ModelSerializer):
    membres = UserSerializer(many=True,read_only=True)
    messagesDF = serializers.SerializerMethodField()
    profile_url = serializers.SerializerMethodField()
    class Meta:
        model = DiscussionForum
        fields = ['id_discussion_forum','membres','profile_url','messagesDF','created_at']

    def get_messagesDF(self, obj):
        messages = obj.messages
        return MessageDFSerializer(messages, many=True).data

    def get_profile_url(self, obj):
        return f"{settings.BASE_URL}api/forum/media/{obj.profile.url}" if obj.profile else None
    
    def to_representation(self, instance):
        detail = self.context.get('detail', False)
        displayMessage = self.context.get('messages', True)
        representation = super().to_representation(instance)
        if not detail:
            representation.pop('membres', None)
        if not displayMessage:
            representation.pop('messages')
        return representation

class FileDFSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    type = serializers.SerializerMethodField()

    class Meta:
        model = FileDF
        fields = ['url', 'name', 'type']

    def get_url(self, obj):
        return f"{settings.BASE_URL}api{obj.file.url}" if obj.file else None
    
    def get_name(self, obj):
        return obj.file.name.split('/')[-1] if obj.file else None
    
    def get_type(self, obj):
        return obj.file.name.split('.')[-1] if obj.file else None
    
class ImageDFSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    type = serializers.SerializerMethodField()

    class Meta:
        model = ImageDF  # Remplacez par le modèle correct pour les images
        fields = ['url', 'name', 'type']

    def get_url(self, obj):
        return f"{settings.BASE_URL}api{obj.image.url}" if obj.image else None
    
    def get_name(self, obj):
        return obj.image.name.split('/')[-1] if obj.image else None
    
    def get_type(self, obj):
        return obj.image.name.split('.')[-1] if obj.image else None

class MessageDFSerializer(serializers.ModelSerializer):
    sender = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    images = ImageDFSerializer(many=True, read_only=True)
    files = FileDFSerializer(many=True, read_only=True)
    sender = UserSerializer(read_only=True)
    time_elapsed = serializers.SerializerMethodField()
    likes = serializers.SerializerMethodField()
    likes_number = serializers.SerializerMethodField()
    dislikes = serializers.SerializerMethodField()
    dislikes_number = serializers.SerializerMethodField()

    class Meta:
        model = MessageDF
        fields = ['id_messageDF','discussionF','contenu','sender','images','files','likes_number','is_anonymous','likes','dislikes_number','dislikes','time_elapsed','created_at']
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['profile_sender'] = representation['sender']['profile_url']
        if representation['is_anonymous']:
            representation.pop('sender',None)
            representation['profile_sender'] = f'{settings.BASE_URL}api/media/users/profiles/anonymous.png'
        return representation

    def get_time_elapsed(self, obj):
        current_time = timezone.localtime(timezone.now())
        time_difference = current_time - obj.created_at
        current_year = current_time.year
        current_month = current_time.month
        days_in_month = calendar.monthrange(current_year, current_month)[1]

        if time_difference < timedelta(minutes=1):
            return "à l'instant"
        elif time_difference < timedelta(hours=1):
            minutes = int(time_difference.total_seconds() / 60)
            return f"{minutes} min"
        elif time_difference < timedelta(days=1):
            hours = int(time_difference.total_seconds() / 3600)
            return f"{hours} h"
        elif time_difference < timedelta(days=days_in_month):
            days = int(time_difference.total_seconds() / 86400)
            return f"{days} j"
        elif time_difference < timedelta(days=365):
            months = int(time_difference.total_seconds() / 2592000)
            return f"{months} mois"
        else:
            years = int(time_difference.total_seconds() / 31536000)
            return f"{years} ans"

    def get_likes(self, obj):
        return UserSerializer(obj.likes.all(),many=True).data
    
    def get_likes_number(self,obj):
        return obj.likes.all().count()
    
    def get_dislikes(self, obj):
        return UserSerializer(obj.dislikes.all(),many=True).data
    
    def get_dislikes_number(self,obj):
        return obj.dislikes.all().count()
    
    def create(self, validated_data):
        if 'sender' in self.context:
            validated_data['sender'] = self.context.get('sender')
        files_data = self.context.get('files_data', [])
        images_data = self.context.get('images_data', [])
        messageDF = MessageDF.objects.create(**validated_data)
        for image_data in images_data:
            ImageDF.objects.create(image=image_data,messageDF=messageDF)
            print('images created .........')

        for file_data in files_data:
            FileDF.objects.create(file=file_data,messageDF=messageDF)
            print('file created.......')
            
        return messageDF
