from rest_framework import serializers
from helpers.ai_models.mistral import generer_texte
import threading

from apps.chatbot.models import Conversation, MessageChat

class MessageChatSerializer(serializers.ModelSerializer):
    class Meta:
        model = MessageChat
        fields = ['id_message_chat', 'contenu', 'conversation', 'from_user', 'created_at']


class ConversationSerializer(serializers.ModelSerializer):
    messages = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ['id_conversation', 'user', 'titre', 'created_at', 'messages']

    def get_messages(self, obj):
        messages = obj.messages.all() 
        return MessageChatSerializer(messages, many=True).data
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if instance.titre in ['','nouveau discussion'] and instance.messages.all().count()>=4:
            threading.Thread(target=self.change_titre, args=(instance,), daemon=True).start()
        return representation
    
    def change_titre(self, instance):
        message_four = ". ".join([("Question : "if m['from_user'] else "Reponse : ")+m['contenu'] for m in MessageChatSerializer(instance.messages.all(),many=True).data])
        texte = "Resumer ce paragraphe de discussion en une seule phrase très courte pour le titre de la dicussion:\n"+message_four
        instance.titre = generer_texte(texte)
        instance.save(update_fields=["titre"])
