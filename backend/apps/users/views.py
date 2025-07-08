from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework_simplejwt.tokens import TokenError
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.request import Request
from rest_framework.views import APIView

from django.contrib.auth.hashers import make_password

from apps.users.serializers import UserSerializer, LoginSerializer, RegisterSerializer, UpdateProfileSerializer
from apps.users.models import User, UserOtp, default_created_at

from dotenv import load_dotenv
from django.core.validators import EmailValidator
from django.core.exceptions import ValidationError
from bleach.sanitizer import Cleaner
from helpers.swagger.user import *
from helpers.services.emails import envoyer_email
from helpers.helper import generate_jwt_token, enc_dec, decode_jwt_token
import random, string
from datetime import timedelta, datetime
from django.utils import timezone

import os

load_dotenv()


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        tags=['Users'],
        security=[{'Bearer': []}], 
        responses={
            200: UserSerializer(),
            403: error_schema,
        },
        operation_description="Récupère le profil de l'utilisateur authentifié."
    )
    def get(self, request: Request):
        serializer = UserSerializer(request.user, context={'request': request})
        user = serializer.data
        if not user['is_active']:
            return Response(
                {'error': 'Accès refusé: votre compte doit être actif. Veuillez vous connecter pour continuer.'},
                status=403
            )
        return Response(user, status=200)

class ProfileUpdateView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    @swagger_auto_schema(
        tags=['Users'],
        security=[{'Bearer': []}],
        request_body=UpdateProfileSerializer,
        responses={
            200: UserSerializer(),
            400: "Requête invalide",
        },
        operation_description="Met à jour le profil de l'utilisateur."
    )
    def put(self, request):
        serializer = UpdateProfileSerializer(instance=request.user, data=request.data, partial=True)
        if serializer.is_valid():
            user = serializer.save()
            return Response(UserSerializer(user, context={'request': request}).data)
        return Response(serializer.errors, status=400)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        tags=['Users'],
        security=[{'Bearer': []}],
        responses={
            200: logout_response_schema,
            404: error_schema,
        },
        operation_description="Déconnecte l'utilisateur authentifié en désactivant son compte."
    )
    def put(self, request: Request):
        try:
            user = User.objects.get(id=request.user.id)
            user.is_active = False
            user.save()
            return Response({'message': 'Utilisateur déconnecté avec succès.'}, status=200)
        except User.DoesNotExist:
            return Response({'erreur': "Utilisateur non trouvé"}, status=404)

class LoginView(APIView):
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer

    @swagger_auto_schema(
        tags=['Users'],
        request_body=LoginSerializer,
        responses={
            200: login_response_schema,
            400: error_schema,
        },
        operation_description="Connecte un utilisateur et renvoie des tokens JWT."
    )
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            return Response({"erreur": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def check_if_user_exist(self, email):
        return User.objects.filter(email=email).exists()

    def validate_data(self, data):
        try:
            keys = ['name', 'email', 'password', 'birth_date']
            if any(key not in data.keys() for key in keys):
                return False
            return True
        except Exception:
            False

    def post(self, request):
        try:
            user_data = request.data
            if not self.validate_data(user_data):
                return Response({'erreur': 'Tous les attributs sont requis'}, status=status.HTTP_400_BAD_REQUEST)

            birth_date = request.data['birth_date'].replace('/', '-')
            user_data['birth_date'] = birth_date

            if self.check_if_user_exist(request.data['email']):
                return Response({'erreur': 'email existant'}, status=status.HTTP_400_BAD_REQUEST)

            if "profession_domaine" not in user_data:
                user_data["profession_domaine"] = "Inconu"
            if user_data.get('sexe', 'I').lower() not in ['masculin', 'feminin']:
                user_data['sexe'] = 'F'
            else:
                user_data['sexe'] = user_data['sexe'].strip()[0].upper()

            code_otp = ''.join(random.choices(string.digits, k=8))

            serializer = RegisterSerializer(data=user_data)
            if serializer.is_valid(raise_exception=True):
                user = User.objects.get(email=serializer.validated_data["email"])

                date_expiration = timezone.now() + timedelta(minutes=30)
                UserOtp.objects.create(code_otp=code_otp, user=user, expirer_le=date_expiration)

                data = {
                    'subject': 'Vérification de votre compte Sexual AI',
                    'prenom': user.name.split()[0],
                    'nom': ' '.join(user.name.split()[1:]) if len(user.name.split()) > 1 else '',
                    'code_otp': code_otp,
                    'user_email': 'tokynandrasana2611@gmail.com',
                    'type_utilisateur': 'user' if user.is_staff else 'client',
                }

                envoyer_email([user.email], 'envoie_code_otp', data)

                return Response({"email": serializer.validated_data["email"], 'message':f"Une code Otp de verification a été envoyé à {user.email}"}, status=status.HTTP_201_CREATED)
            else:
                return Response({'erreur': 'erreur de sérialisation'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            import traceback
            print(traceback.format_exc())
            return Response({"erreur": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class UserVerifyOtpView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_description="Vérifier le code OTP pour activer le compte utilisateur",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=["email", "code_otp"],
            properties={
                "email": openapi.Schema(type=openapi.TYPE_STRING, example="utilisateur@exemple.com"),
                "code_otp": openapi.Schema(type=openapi.TYPE_STRING, example="1234567890")
            }
        ),
        responses={
            200: openapi.Response(description="Vérification réussie", schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={"message": openapi.Schema(type=openapi.TYPE_STRING)}
            )),
            400: openapi.Response(description="Données invalides", schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={"erreur": openapi.Schema(type=openapi.TYPE_STRING)}
            )),
            404: openapi.Response(description="User ou OTP non trouvé", schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={"erreur": openapi.Schema(type=openapi.TYPE_STRING)}
            )),
            410: openapi.Response(description="OTP expiré", schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={"erreur": openapi.Schema(type=openapi.TYPE_STRING)}
            ))
        },
        tags=["Users"]
    )
    def post(self, request):
        try:
            email = request.data.get('email')
            code_otp = request.data.get('code_otp')
            
            if not email or not code_otp:
                return Response({"erreur": "Email et code OTP sont requis"}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return Response({"erreur": "User non trouvé"}, status=status.HTTP_404_NOT_FOUND)
            
            try:
                otp = UserOtp.objects.filter(user=user, code_otp=code_otp).last()
            except UserOtp.DoesNotExist:
                return Response({"erreur": "Code OTP invalide"}, status=status.HTTP_400_BAD_REQUEST)
            
            if otp.expirer_le < default_created_at():
                otp.delete()
                return Response({"erreur": "Code OTP expiré"}, status=status.HTTP_410_GONE)
            
            user.is_verified = True
            user.save()
            UserOtp.objects.filter(user=user).delete()
            
            refresh = RefreshToken.for_user(user)
                        
            return Response({"message": "Compte vérifié avec succès", "email":email, "refresh":str(refresh),"access":str(refresh.access_token)}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"erreur": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserMotDePasseOublieView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_description="Envoyer un email de réinitialisation du mot de passe user",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=["email"],
            properties={
                "email": openapi.Schema(type=openapi.TYPE_STRING, example="user@exemple.com")
            }
        ),
        responses={
            200: openapi.Response(description="Email envoyé", schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={"message": openapi.Schema(type=openapi.TYPE_STRING)}
            )),
            400: openapi.Response(description="Erreur", schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={"erreur": openapi.Schema(type=openapi.TYPE_STRING)}
            ))
        },
        tags=["Users"]
    )
    def post(self, request):
        try:
            email = request.data.get('email')
            if not email:
                return Response({"erreur": "Email requis"}, status=400)

            user = User.objects.filter(email=email).first()
            if not user:
                return Response({"erreur": "User introuvable"}, status=400)

            token = generate_jwt_token({enc_dec("user_id"): enc_dec(str(user.id))})
            lien = os.getenv('SITE_URL') + f"/user/reset-password?token={token}"

            envoyer_email([email], "reinitialiser_mot_de_passe", {
                "subject": "Réinitialisation de votre mot de passe",
                "nom_utilisateur": f"{user.nom.upper()} {user.prenom.capitalize()}",
                "lien_reinitialisation": lien
            })

            return Response({"message": "Email de réinitialisation envoyé"}, status=200)
        except Exception as e:
            return Response({"erreur": str(e)}, status=400)

class UserResetPasswordView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_description="Réinitialiser le mot de passe avec le token",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=["token", "nouveau_mot_de_passe"],
            properties={
                "token": openapi.Schema(type=openapi.TYPE_STRING),
                "nouveau_mot_de_passe": openapi.Schema(type=openapi.TYPE_STRING, example="nouveaumotdepasse123")
            }
        ),
        responses={
            200: openapi.Response(description="Mot de passe réinitialisé", schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={"message": openapi.Schema(type=openapi.TYPE_STRING)}
            )),
            400: openapi.Response(description="Erreur", schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={"erreur": openapi.Schema(type=openapi.TYPE_STRING)}
            )),
            404: openapi.Response(description="User introuvable", schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={"erreur": openapi.Schema(type=openapi.TYPE_STRING)}
            ))
        },
        tags=["Users"]
    )
    def post(self, request):
        try:
            token = request.data.get("token")
            nouveau_mot_de_passe = request.data.get("nouveau_mot_de_passe")
            payload = decode_jwt_token(token)
            user_id = int(enc_dec(payload.get(enc_dec("user_id","d")), 'd'))

            user = User.objects.get(id=user_id)
            user.password = make_password(nouveau_mot_de_passe)
            user.save()

            return Response({"message": "Mot de passe réinitialisé avec succès"}, status=200)

        except User.DoesNotExist:
            return Response({"erreur": "User introuvable"}, status=404)
        except Exception as e:
            return Response({"erreur": str(e)}, status=400)

class ContactSupportView(APIView):
    permission_classes = [AllowAny]

    def validate_data(self, data):
        required_keys = ['nom_complet', 'adresse_email', 'message']
        if not all(key in data for key in required_keys):
            return False, {'erreur': 'Tous les champs (nom_complet, adresse_email, message) sont requis'}
        
        validator = EmailValidator()
        try:
            validator(data['adresse_email'])
        except ValidationError:
            return False, {'erreur': 'Adresse email invalide'}

        if not data['nom_complet'].strip() or len(data['nom_complet']) > 100:
            return False, {'erreur': 'Le nom complet doit être non vide et inférieur à 100 caractères'}

        if not data['message'].strip() or len(data['message']) > 1000:
            return False, {'erreur': 'Le message doit être non vide et inférieur à 1000 caractères'}

        return True, None

    def sanitize_message(self, message):
        cleaner = Cleaner(
            tags=['p', 'br', 'strong', 'em'], 
            attributes={}, 
            strip=True
        )
        return cleaner.clean(message)

    @swagger_auto_schema(
        tags=['Support'],
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'nom_complet': openapi.Schema(type=openapi.TYPE_STRING, description='Nom complet de l\'utilisateur'),
                'adresse_email': openapi.Schema(type=openapi.TYPE_STRING, description='Adresse email de l\'utilisateur'),
                'message': openapi.Schema(type=openapi.TYPE_STRING, description='Message de l\'utilisateur'),
            },
            required=['nom_complet', 'adresse_email', 'message']
        ),
        responses={
            200: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'message': openapi.Schema(type=openapi.TYPE_STRING, description='Confirmation de l\'envoi')
                }
            ),
            400: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'erreur': openapi.Schema(type=openapi.TYPE_STRING, description='Message d\'erreur')
                }
            )
        },
        operation_description="Envoie un message au support de Sexual AI."
    )
    def post(self, request):
        try:
            data = request.data
            is_valid, error_response = self.validate_data(data)
            if not is_valid:
                return Response(error_response, status=status.HTTP_400_BAD_REQUEST)

            sanitized_message = self.sanitize_message(data['message'])

            email_data = {
                'subject': 'Nouveau message de contact - Sexual AI',
                'nom_complet': data['nom_complet'],
                'adresse_email': data['adresse_email'],
                'message': sanitized_message,
                'current_year': datetime.now().year,
            }

            support_email = os.getenv('SUPPORT_EMAIL')
            envoyer_email([support_email], 'support_message', email_data)

            return Response({'message': 'Votre message a été envoyé avec succès au support.'}, status=status.HTTP_200_OK)
        except Exception as e:
            import traceback
            print(traceback.format_exc())
            return Response({'erreur': f'Erreur lors de l\'envoi du message : {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
    
