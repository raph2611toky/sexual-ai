from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from apps.chatbot.models import Conversation, MessageChat
from apps.chatbot.serializers import ConversationSerializer, MessageChatSerializer

from helpers.ai_models.mistral import generer_texte
from helpers.swagger.chatbot import bot_response_schema, message_request_schema, error_schema, conversation_request_schema
import random
import traceback


class ConversationFilterView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        tags=['Conversations'],
        security=[{'Bearer': []}],
        responses={
            200: ConversationSerializer(many=True),
            400: "Erreur dans la requête"
        },
        operation_description="Récupère la liste des conversations de l'utilisateur authentifié."
    )
    def get(self, request):
        try:
            conversations = Conversation.objects.filter(user=request.user)
            serializer = ConversationSerializer(conversations, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error':str(e)}, status=400)
        
class ConversationProfileView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        tags=['Conversations'],
        security=[{'Bearer': []}],
        responses={
            200: ConversationSerializer(),
            400: "Erreur dans la requête",
            401: "Non autorisé"
        },
        operation_description="Récupère les détails d'une conversation spécifique par son ID."
    )
    def get(self, request, conversation_id):
        try:
            conversation = Conversation.objects.get(id_conversation=conversation_id)
            if conversation.user.id != request.user.id:
                return Response({'erreur':'Vous n\'avez pas la permission de faire cette opération'},status=401)
            serializer = ConversationSerializer(conversation)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error':str(e)}, status=400)
        
class ConversationNewView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        tags=['Conversations'],
        security=[{'Bearer': []}],
        request_body=conversation_request_schema,
        responses={
            201: ConversationSerializer(), 
            400: error_schema,
        },
        operation_description="Crée une nouvelle conversation pour l'utilisateur authentifié."
    )
    def post(self, request):
        try:
            data = request.data

            data['user'] = request.user.id

            serializer = ConversationSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error':str(e)},status=400)

class MessageChatNewView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        tags=['Messages Bot'],
        security=[{'Bearer': []}],
        request_body=message_request_schema,
        responses={
            201: bot_response_schema,
            400: error_schema, 
            404: error_schema,
        },
        operation_description="Crée un nouveau message dans une conversation et génère une réponse du bot."
    )
    def post(self, request):
        try:
            data = request.data
            conversation_id = int(data.get('conversation'))
            contenu = data.get('contenu')
            from_user = data.get('from_user', True)

            try:
                conversation = Conversation.objects.get(id_conversation=conversation_id, user=request.user)
            except Conversation.DoesNotExist:
                return Response(
                    {"error": "Conversation introuvable ou non autorisée."},
                    status=status.HTTP_404_NOT_FOUND
                )

            messageChat_response = generer_texte(contenu)
            
            message_data = {
                "conversation": conversation.id_conversation, 
                "contenu": contenu,
                "from_user": from_user
            }
            serializer = MessageChatSerializer(data=message_data)
            if serializer.is_valid():
                serializer.save()
                MessageChat.objects.create(conversation=conversation, contenu=messageChat_response, from_user=False)
                return Response({"bot_response": messageChat_response}, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(traceback.format_exc())
            return Response({'error': str(e)}, status=400)