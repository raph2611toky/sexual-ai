from rest_framework.views import APIView
from rest_framework.mixins import UpdateModelMixin, DestroyModelMixin
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from apps.users.serializers import UserSerializer
from apps.forum.serializers import DiscussionForumSerializer, MessageDFSerializer
from apps.forum.models import DiscussionForum,MessageDF
from apps.users.models import User
from rest_framework.parsers import MultiPartParser, FormParser
from datetime import datetime

class DiscussionForumListView(APIView):
    
    def get(self,request):
        discussionObj = DiscussionForum.objects.all()
        discussionSer = DiscussionForumSerializer(discussionObj, many=True, context={'detail': True})
        return Response(discussionSer.data,status=200)

class DiscussionForumFilterView(APIView):
    permission_classes=[IsAuthenticated]
    
    def get(self,request):
        discussionObj = request.user.discussionsF
        discussionSer = DiscussionForumSerializer(discussionObj, many=True, context={'detail': True})
        return Response(discussionSer.data,status=200)
        
class MessageDFNewView(APIView):
    permission_classes=[IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        #request.data.keys = ['contenu','is_anonymous']
        #request.FILES = ['images','files']
        sender = request.user
        sender_id = request.user.id
        contenu = request.data.get('contenu')
        
        discussionForum_created = DiscussionForum.objects.create()
        discussionForum_created.membres.add(sender)
        discussion_id=discussionForum_created.id_discussion_forum

        try:
            discussion = DiscussionForum.objects.get(id_discussion_forum=discussion_id)
        except (User.DoesNotExist, DiscussionForum.DoesNotExist):
            return Response({"Erreur": "L'utilisateur ou la discussion n'existe pas."}, status=400)

        message_data = {
            'sender': sender_id,
            'discussionF': discussion.id_discussion_forum,
            'contenu': contenu,
            'is_anonymous':request.data.get('is_anonymous',False)
        }
        files_data = request.FILES.getlist('files')
        images_data = request.FILES.getlist('images')
        message_serializer = MessageDFSerializer(
            data=message_data,
            context={'sender': sender, 'files_data': files_data, 'images_data': images_data}
        )
        if message_serializer.is_valid():
            message_serializer.save()
            return Response({"Message": "Le message a été créé avec succès."}, status=201)
        else:
            return Response({"Erreur": "Les données du message ne sont pas valides."}, status=400)
        
class MessageDFResponseView(APIView):
    permission_classes=[IsAuthenticated]

    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        #request.data.keys = ['discussion','contenu']
        #request.FILES = ['images','files']
        if any(key not in request.data.keys()for key in ['discussion','contenu']):
            return Response({'error':'Tous les attributs sont recquis'},status=400)
        sender = request.user
        sender_id = request.user.id
        discussion_id = request.data.get('discussion')
        contenu = request.data.get('contenu')

        try:
            discussion = DiscussionForum.objects.get(id_discussion_forum=discussion_id)
        except (User.DoesNotExist, DiscussionForum.DoesNotExist):
            return Response({"Erreur": "L'utilisateur ou la discussion n'existe pas."}, status=400)

        message_data = {
            'sender': sender_id,
            'discussionF': discussion.id_discussion_forum,
            'contenu': contenu
        }
        files_data = request.FILES.getlist('files')
        images_data = request.FILES.getlist('images')
        print(message_data)
        message_serializer = MessageDFSerializer(
            data=message_data,
            context={'sender': sender, 'files_data': files_data, 'images_data': images_data}
        )
        if message_serializer.is_valid():
            message_serializer.save()
            return Response({"Message": "Le message a été créé avec succès."}, status=201)
        else:
            return Response({"Erreur": "Les données du message ne sont pas valides."}, status=400)

class MessageDFProfileView(APIView):
    permission_classes=[IsAuthenticated]
    
    def delete(self, request, id_messageDF):
        try:
            messageObj = MessageDF.objects.get(id_messageDF=id_messageDF)
            if messageObj.sender!=request.user:
                return Response({'error':'Vous n\'avez pas la permission d\'effectuer cette operation'})
            messageObj.delete()
            return Response({"message":"message a été supprimé avec succès"},status=201)
        except MessageDF.DoesNotExist:
            return Response({"erreur": f"Message avec id {id_messageDF} est inexistant"},status=404)

class LikeMessageDFView(APIView):
    permission_classes=[IsAuthenticated]

    def put(self, request, message_id):
        try:
            sender = request.user
            message = MessageDF.objects.get(id_messageDF=message_id)
            if sender in message.likes.all():
                message.likes.pop(sender)
                return Response({"message": "Utilisateur retiré des likes avec succès."}, status=200)
            else:
                message.likes.add(sender)
                return Response({"message": "Utilisateur ajouté aux likes avec succès."}, status=200)
        except MessageDF.DoesNotExist:
            return Response({'error': 'Message non trouvé'}, status=404)
        except User.DoesNotExist:
            return Response({'error': 'Utilisateur non trouvé'}, status=404)
        except Exception as e:
            return Response({'erreur': str(e)}, status=400)

class DislikeMessageDFView(APIView):
    permission_classes=[IsAuthenticated]

    def put(self, request, message_id):
        try:
            sender = request.user
            message = MessageDF.objects.get(id_messageDF=message_id)
            if sender in message.dislikes.all():
                message.dislikes.pop(sender)
                return Response({"message": "Utilisateur retiré des likes avec succès."}, status=200)
            else:
                message.dislikes.add(sender)
                return Response({"message": "Utilisateur ajouté aux likes avec succès."}, status=200)
        except MessageDF.DoesNotExist:
            return Response({'error': 'Message non trouvé'}, status=404)
        except User.DoesNotExist:
            return Response({'error': 'Utilisateur non trouvé'}, status=404)
        except Exception as e:
            return Response({'erreur': str(e)}, status=400)
