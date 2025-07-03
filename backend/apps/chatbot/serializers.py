from rest_framework import serializers
from helpers.ai_models.gemini import simple_chat
# import threading

from apps.chatbot.models import Conversation, MessageChat

class MessageChatSerializer(serializers.ModelSerializer):
    class Meta:
        model = MessageChat
        fields = ['id_message_chat', 'contenu', 'conversation', 'from_user', 'created_at']


class ConversationSerializer(serializers.ModelSerializer):
    messages = serializers.SerializerMethodField()
    titre = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ['id_conversation', 'user', 'titre', 'created_at', 'messages']

    def get_messages(self, obj):
        messages = obj.messages.all() 
        return MessageChatSerializer(messages, many=True).data
    
    def get_titre(self, obj):
        messages = obj.messages.all()
        if obj.titre is None:
            if messages.count() == 1 and len(messages.first().contenu.split())>10:
                texte_a_envoye = f"Resumer ceci et donne moi en une phrase courte pour un titre ce que ca resume, et retourner directement le titre sans bold ni apostrophe, directement un titre brute :  {messages.first().contenu}"
                nouveau_titre = simple_chat(texte_a_envoye)
                obj.titre = nouveau_titre
                obj.save()
                return obj.titre
            elif messages.count() > 1 :
                m = []
                for message in messages.filter(from_user=True).order_by("-created_at"):
                    if len(m)>2:
                        break
                    m.append(message.contenu)
                texte_a_envoye = f"Resumer ceci et donne moi en une phrase courte pour un titre ce que ca resume,  et retourner directement le titre sans bold ni apostrophe, directement un titre brute :  {'\n\n'.join(m)}"
                nouveau_titre = simple_chat(texte_a_envoye)
                obj.titre = nouveau_titre
                obj.save()
            return "Nouvelle discussion"
        return obj.titre