from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from apps.chatbot.models import Conversation, MessageChat
from apps.chatbot.serializers import ConversationSerializer, MessageChatSerializer
from apps.users.authentication import AnonymousOrAuthenticated

from helpers.ai_models.gemini import simple_chat
from helpers.helper import LOGGER
from helpers.swagger.chatbot import bot_response_schema, message_request_schema, error_schema, conversation_request_schema
import random
import traceback

class ConversationModifierTitreView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        tags=['Conversations'],
        security=[{'Bearer': []}],
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'titre': openapi.Schema(type=openapi.TYPE_STRING, description='Nouveau titre de la conversation'),
            }
        ),
        responses={
            200: ConversationSerializer(),
            400: error_schema,
            401: "Non autorisé",
            404: "Conversation introuvable"
        },
        operation_description="Modifie le titre d'une conversation spécifique."
    )
    def put(self, request, conversation_id):
        try:
            conversation = Conversation.objects.get(id_conversation=conversation_id, user=request.user)
            titre = request.data.get('titre')
            if titre:
                conversation.titre = titre
                conversation.save()
                serializer = ConversationSerializer(conversation)
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response({'error': 'Le titre est requis'}, status=status.HTTP_400_BAD_REQUEST)
        except Conversation.DoesNotExist:
            return Response({'error': 'Conversation introuvable ou non autorisée'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class ConversationSupprimerView(APIView):
    permission_classes = [IsAuthenticated]
    @swagger_auto_schema(
        tags=['Conversations'],
        security=[{'Bearer': []}],
        responses={
            204: "Conversation supprimée avec succès",
            401: "Non autorisé",
            404: "Conversation introuvable"
        },
        operation_description="Supprime une conversation spécifique et tous ses messages associés."
    )
    def delete(self, request, conversation_id):
        try:
            conversation = Conversation.objects.get(id_conversation=conversation_id, user=request.user)
            conversation.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Conversation.DoesNotExist:
            return Response({'error': 'Conversation introuvable ou non autorisée'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

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
            conversations = Conversation.objects.filter(user=request.user).order_by("-created_at")
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
    authentication_classes = [AnonymousOrAuthenticated]

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
            if Conversation.objects.filter(user=request.user).exists():
                conversation_last = Conversation.objects.filter(user=request.user).last()
                if conversation_last.messages.all().count() > 0:
                    conversation_new = Conversation.objects.create(user=request.user)
                    return Response(ConversationSerializer(conversation_new).data, status=status.HTTP_201_CREATED)
                else:
                    return Response(ConversationSerializer(conversation_last).data, status=status.HTTP_201_CREATED)
            conversation_new = Conversation.objects.create(user=request.user)
            return Response(ConversationSerializer(conversation_new).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            print(e)
            LOGGER.error(traceback.format_exc())
            return Response({'error':str(e)},status=400)

class MessageChatNewView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [AnonymousOrAuthenticated]

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
            print(data)
            contenu = data.get('contenu')
            print(data)
            conversation_id = data.get('conversation',None)

            if conversation_id is not None and str(conversation_id).strip()!='':
                try:
                    conversation_last = Conversation.objects.filter(user=request.user).last()
                    if conversation_last.messages.all().count() > 0:
                        conversation = Conversation.objects.create(user=request.user)
                    else:
                        conversation = conversation_last
                except Conversation.DoesNotExist:
                    return Response(
                        {"error": "Conversation introuvable ou non autorisée."},
                        status=status.HTTP_404_NOT_FOUND
                    )
            else:
                conversation, created = Conversation.objects.create(
                    user=request.user,
                    titre= 'Nouvelle discussion'
                )

            messageChat_response = simple_chat(contenu, lang=request.data.get("lang","fr"))
            
            message_data = {
                "conversation": conversation.id_conversation, 
                "contenu": contenu,
                "from_user": True
            }
            serializer = MessageChatSerializer(data=message_data)
            if serializer.is_valid():
                serializer.save()
                MessageChat.objects.create(conversation=conversation, contenu=messageChat_response, from_user=False)
                return Response({"bot_response": messageChat_response}, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            LOGGER.error(traceback.format_exc())
            return Response({'error': str(e)}, status=400)