from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework.exceptions import ValidationError
from apps.menstruation.models import Woman, Menstruation, Ovulation, Symptom, Notification
from apps.menstruation.serializers import WomanSerializer, MenstruationSerializer, OvulationSerializer, SymptomSerializer
from apps.menstruation.permissions import IsAuthenticatedWoman
from datetime import timedelta, datetime
from helpers.services.sms import send_sms
from django.utils import timezone
import traceback
import os
import random

class WomanLastInfoView(APIView):
    permission_classes = [IsAuthenticatedWoman]
    
    @swagger_auto_schema(
        operation_description="Retrieve the last menstruation and ovulation information for the authenticated woman.",
        responses={
            200: WomanSerializer,
            400: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'error': openapi.Schema(type=openapi.TYPE_STRING, description="Error message")
                }
            ),
            401: openapi.Schema(
                                type=openapi.TYPE_OBJECT,
                                properties={
                                    'detail': openapi.Schema(type=openapi.TYPE_STRING, description="Authentication error")
                                }
                            )
                        }
                    )
    def get(self, request):
        try:
            woman = request.woman
            serializer = WomanSerializer(woman, context={'last_info': True})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except ValidationError as ve:
            return Response({'error': f"Serialization error: {str(ve)}"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(traceback.format_exc())
            return Response({'error': f"Unexpected error: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

class WomanInfoView(APIView):
    permission_classes = [IsAuthenticatedWoman]

    @swagger_auto_schema(
        operation_description="Retrieve detailed information for the authenticated woman.",
        responses={
            200: WomanSerializer,
            404: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'detail': openapi.Schema(type=openapi.TYPE_STRING, description="Menstruation records not found")
                }
            ),
            400: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'error': openapi.Schema(type=openapi.TYPE_STRING, description="Error message")
                }
            ),
            401: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'detail': openapi.Schema(type=openapi.TYPE_STRING, description="Authentication error")
                }
            )
        }
    )
    def get(self, request):
        try:
            serializer = WomanSerializer(request.woman)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Menstruation.DoesNotExist:
            return Response({'detail': 'Menstruation records not found'}, status=status.HTTP_404_NOT_FOUND)
        except ValidationError as ve:
            return Response({'error': f"Serialization error: {str(ve)}"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(traceback.format_exc())
            return Response({'error': f"Unexpected error: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

class MenstruationListView(APIView):
    permission_classes = [IsAuthenticatedWoman]

    @swagger_auto_schema(
        operation_description="Retrieve all menstruation records for the authenticated woman.",
        responses={
            200: WomanSerializer,
            404: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'detail': openapi.Schema(type=openapi.TYPE_STRING, description="Menstruation records not found")
                }
            ),
            400: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'error': openapi.Schema(type=openapi.TYPE_STRING, description="Error message")
                }
            ),
            401: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'detail': openapi.Schema(type=openapi.TYPE_STRING, description="Authentication error")
                }
            )
        }
    )
    def get(self, request):
        try:
            serializer = WomanSerializer(request.woman, context={'only_menstruations': True})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Menstruation.DoesNotExist:
            return Response({'detail': 'Menstruation records not found'}, status=status.HTTP_404_NOT_FOUND)
        except ValidationError as ve:
            return Response({'error': f"Serialization error: {str(ve)}"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(traceback.format_exc())
            return Response({'error': f"Unexpected error: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

class MenstruationNew(APIView):
    permission_classes = [IsAuthenticatedWoman]
    
    def validate(self, data):
        try:
            keys = ['start_date', 'duration']
            if any(key not in data.keys() for key in keys):
                return False
            start_date = datetime.strptime(data['start_date'], '%Y-%m-%d')
            if start_date > datetime.now():
                return False
            return True
        except ValueError:
            return False
        except Exception:
            return False

    @swagger_auto_schema(
        operation_description="Create a new menstruation record for the authenticated woman.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['start_date', 'duration'],
            properties={
                'start_date': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_DATE, description="Start date of menstruation (YYYY-MM-DD)"),
                'duration': openapi.Schema(type=openapi.TYPE_INTEGER, description="Duration of menstruation in days")
            }
        ),
        responses={
            201: MenstruationSerializer,
            400: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'error': openapi.Schema(type=openapi.TYPE_STRING, description="Error message")
                }
            ),
            401: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'detail': openapi.Schema(type=openapi.TYPE_STRING, description="Authentication error")
                }
            )
        }
    )
    def post(self, request):
        try:
            if not self.validate(request.data):
                return Response({'error': 'Veuillez vérifier vos données'}, status=status.HTTP_400_BAD_REQUEST)
            
            woman = request.woman
            start_date = datetime.strptime(request.data['start_date'], '%Y-%m-%d').date()
            last_menstruation = woman.menstruations.last()

            if last_menstruation:
                last_menstruation.cycle_length = (start_date - last_menstruation.start_date).days
                last_menstruation.save()

            duration = request.data.get('duration', woman.average_menstruation_duration)
            end_date = start_date + timedelta(days=int(duration)) if duration is not None else start_date + timedelta(days=woman.average_menstruation_duration)
            data = {
                'start_date': start_date,
                'end_date': end_date
            }

            serializer = MenstruationSerializer(data=data)
            if serializer.is_valid():
                menstruation = serializer.save(woman=woman)
                woman.last_period_date = start_date
                if end_date is not None:
                    woman.average_menstruation_duration = (end_date - start_date).days
                woman.save()
                woman.update_average_cycle_length()
                
                predicted_ovulation_date = start_date + timedelta(days=woman.average_cycle_length - 14)
                fertility_window_start = predicted_ovulation_date - timedelta(days=5)
                fertility_window_end = predicted_ovulation_date + timedelta(days=1)
                
                Ovulation.objects.create(
                    woman=woman,
                    predicted_ovulation_date=predicted_ovulation_date,
                    fertility_window_start=fertility_window_start,
                    fertility_window_end=fertility_window_end
                )
                Notification.objects.create(
                    woman=woman,
                    message=f"Une nouvelle menstruation a été ajoutée pour la période du {menstruation.start_date} au {menstruation.end_date}."
                )
                    
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            
            return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        except ValueError as ve:
            return Response({'error': f"Erreur de format de date: {str(ve)}"}, status=status.HTTP_400_BAD_REQUEST)
        except ValidationError as ve:
            return Response({'error': f"Erreur de validation: {str(ve)}"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(traceback.format_exc())
            return Response({'error': f"Erreur inattendue: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

class MenstruationPredictView(APIView):
    permission_classes = [IsAuthenticatedWoman]

    @swagger_auto_schema(
        operation_description="Predict the next menstruation period for the authenticated woman.",
        responses={
            200: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'predicted_start_date': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_DATE, description="Predicted start date"),
                    'predicted_end_date_duration': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_DATE, description="Predicted end date")
                }
            ),
            404: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'detail': openapi.Schema(type=openapi.TYPE_STRING, description="No menstruation data available")
                }
            ),
            400: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'error': openapi.Schema(type=openapi.TYPE_STRING, description="Error message")
                }
            ),
            401: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'detail': openapi.Schema(type=openapi.TYPE_STRING, description="Authentication error")
                }
            )
        }
    )
    def get(self, request):
        try:
            last_menstruation = request.woman.menstruations.last()
            if not last_menstruation:
                return Response({'detail': 'No menstruation data available for prediction'}, status=status.HTTP_404_NOT_FOUND)
            
            predicted_start = last_menstruation.start_date + timedelta(days=request.woman.average_cycle_length)
            predicted_end_date_duration = predicted_start + timedelta(days=int(request.woman.average_menstruation_duration))
            return Response({
                'predicted_start_date': predicted_start,
                'predicted_end_date_duration': predicted_end_date_duration
            }, status=status.HTTP_200_OK)
        except Exception as e:
            print(traceback.format_exc())
            return Response({'error': f"Unexpected error: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

class OvulationPredictView(APIView):
    permission_classes = [IsAuthenticatedWoman]

    @swagger_auto_schema(
        operation_description="Predict the next ovulation period for the authenticated woman.",
        responses={
            200: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'predicted_ovulation_date': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_DATE, description="Predicted ovulation date"),
                    'fertility_window_start': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_DATE, description="Fertility window start"),
                    'fertility_window_end': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_DATE, description="Fertility window end")
                }
            ),
            404: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'detail': openapi.Schema(type=openapi.TYPE_STRING, description="Last period date not available")
                }
            ),
            400: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'error': openapi.Schema(type=openapi.TYPE_STRING, description="Error message")
                }
            ),
            401: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'detail': openapi.Schema(type=openapi.TYPE_STRING, description="Authentication error")
                }
            )
        }
    )
    def get(self, request):
        try:
            last_period = request.woman.last_period_date
            if not last_period:
                return Response({'detail': 'Last period date not available'}, status=status.HTTP_404_NOT_FOUND)
            
            predicted_ovulation_date = last_period + timedelta(days=request.woman.average_cycle_length - 14)
            fertility_window_start = predicted_ovulation_date - timedelta(days=5)
            fertility_window_end = predicted_ovulation_date + timedelta(days=1)
            return Response({
                'predicted_ovulation_date': predicted_ovulation_date,
                'fertility_window_start': fertility_window_start,
                'fertility_window_end': fertility_window_end
            }, status=status.HTTP_200_OK)
        except Exception as e:
            print(traceback.format_exc())
            return Response({'error': f"Unexpected error: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

class PredictionView(APIView):
    permission_classes = [IsAuthenticatedWoman]
    
    MENSTRUATION_MESSAGES = [
        "Prenez soin de vous et reposez-vous davantage.",
        "Hydratez-vous bien et évitez les efforts intenses.",
        "Utilisez une bouillotte pour soulager les douleurs.",
        "Mangez des aliments riches en fer pour compenser les pertes.",
        "Pratiquez des exercices doux comme le yoga.",
        "N'hésitez pas à demander de l'aide si nécessaire."
    ]

    PRE_OVULATION_MESSAGES = [
        "Profitez de cette période pour planifier vos activités.",
        "Faites le plein d'énergie en mangeant équilibré.",
        "Pratiquez des activités sportives pour rester en forme.",
        "Gardez une attitude positive et détendue.",
        "Buvez des tisanes pour maintenir un bon équilibre hormonal.",
        "Notez vos objectifs et préparez-vous pour les prochaines étapes."
    ]

    FERTILITY_MESSAGES = [
        "C'est une période propice à la conception.",
        "Soyez attentive aux signes de votre corps.",
        "Privilégiez des aliments riches en vitamines.",
        "Essayez de réduire le stress autant que possible.",
        "Communiquez avec votre partenaire pour un meilleur soutien.",
        "Gardez un rythme de vie sain pour optimiser vos chances."
    ]

    POST_OVULATION_MESSAGES = [
        "Prenez du temps pour vous détendre.",
        "Maintenez une alimentation riche en nutriments.",
        "Évitez le stress pour favoriser un cycle régulier.",
        "Surveillez vos symptômes et prenez note pour le médecin.",
        "Pratiquez des activités relaxantes comme la méditation.",
        "Préparez-vous mentalement pour la prochaine phase."
    ]
    
    @swagger_auto_schema(
        operation_description="Provide current cycle phase, advice, and predictions for menstruation and ovulation.",
        responses={
            200: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'current_phase': openapi.Schema(type=openapi.TYPE_STRING, description="Current cycle phase"),
                    'advice': openapi.Schema(type=openapi.TYPE_STRING, description="Advice for the current phase"),
                    'ovulation': openapi.Schema(
                        type=openapi.TYPE_OBJECT,
                        properties={
                            'predicted_ovulation_date': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_DATE),
                            'fertility_window_start': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_DATE),
                            'fertility_window_end': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_DATE)
                        }
                    ),
                    'menstruation': openapi.Schema(
                        type=openapi.TYPE_OBJECT,
                        properties={
                            'predicted_start_date': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_DATE),
                            'predicted_end_date_duration': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_DATE)
                        }
                    )
                }
            ),
            404: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'detail': openapi.Schema(type=openapi.TYPE_STRING, description="Data not available")
                }
            ),
            400: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'error': openapi.Schema(type=openapi.TYPE_STRING, description="Error message")
                }
            ),
            401: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'detail': openapi.Schema(type=openapi.TYPE_STRING, description="Authentication error")
                }
            )
        }
    )
    def get(self, request):
        try:
            last_period = request.woman.last_period_date
            if not last_period:
                return Response({'detail': 'Last period date not available'}, status=status.HTTP_404_NOT_FOUND)
            
            predicted_ovulation_date = last_period + timedelta(days=request.woman.average_cycle_length - 14)
            fertility_window_start = predicted_ovulation_date - timedelta(days=5)
            fertility_window_end = predicted_ovulation_date + timedelta(days=1)
            
            last_menstruation = request.woman.menstruations.last()
            if not last_menstruation:
                return Response({'detail': 'No menstruation data available for prediction'}, status=status.HTTP_404_NOT_FOUND)
            
            predicted_start = last_menstruation.start_date + timedelta(days=request.woman.average_cycle_length)
            predicted_end_date_duration = predicted_start + timedelta(days=int(request.woman.average_menstruation_duration))
            
            today = datetime.now().date()
            if last_menstruation.start_date <= today <= last_menstruation.end_date:
                current_phase = "menstruation"
                advice = random.choice(self.MENSTRUATION_MESSAGES)
            elif last_menstruation.end_date < today < fertility_window_start:
                current_phase = "pre_ovulation"
                advice = random.choice(self.PRE_OVULATION_MESSAGES)
            elif fertility_window_start <= today <= fertility_window_end:
                current_phase = "fertility"
                advice = random.choice(self.FERTILITY_MESSAGES)
            else:
                current_phase = "post_ovulation"
                advice = random.choice(self.POST_OVULATION_MESSAGES)

            data = {
                'current_phase': current_phase,
                'advice': advice,
                'ovulation': {
                    'predicted_ovulation_date': predicted_ovulation_date,
                    'fertility_window_start': fertility_window_start,
                    'fertility_window_end': fertility_window_end
                },
                'menstruation': {
                    'predicted_start_date': predicted_start,
                    'predicted_end_date_duration': predicted_end_date_duration
                }
            }
            return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            print(traceback.format_exc())
            return Response({'error': f"Unexpected error: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

class WomanLinkSymptomView(APIView):
    permission_classes = [IsAuthenticatedWoman]
    
    @swagger_auto_schema(
        operation_description="Link an existing symptom to the authenticated woman and her latest ovulation.",
        manual_parameters=[
            openapi.Parameter('id_symptom', openapi.IN_PATH, type=openapi.TYPE_INTEGER, description="ID of the symptom to link")
        ],
        responses={
            201: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'message': openapi.Schema(type=openapi.TYPE_STRING, description="Success message")
                }
            ),
            400: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'error': openapi.Schema(type=openapi.TYPE_STRING, description="Error message")
                }
            ),
            401: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'detail': openapi.Schema(type=openapi.TYPE_STRING, description="Authentication error")
                }
            ),
            404: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'error': openapi.Schema(type=openapi.TYPE_STRING, description="Symptom not found")
                }
            )
        }
    )
    def put(self, request, id_symptom):
        try:
            symptom = Symptom.objects.get(id_symptom=id_symptom)
            woman = request.woman
            woman.symptoms.add(symptom)
            woman.save()
            if woman.ovulations.all().count() > 0:
                ovulation_last = woman.ovulations.last()
                ovulation_last.symptoms.add(symptom)
                ovulation_last.save()
            return Response({'message': 'Symptom soumis avec succès'}, status=status.HTTP_201_CREATED)
        except Symptom.DoesNotExist:
            return Response({'error': f"Symptom with id {id_symptom} not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print(traceback.format_exc())
            return Response({'error': f"Unexpected error: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

class WomanSymptomsNewView(APIView):
    permission_classes = [IsAuthenticatedWoman]
    
    def validate_data(self, data):
        try:
            keys = ['date', 'description', 'title']
            if any(key not in data.keys() for key in keys):
                return False
            return True
        except Exception:
            return False

    @swagger_auto_schema(
        operation_description="Create and link a new symptom to the authenticated woman and her latest ovulation.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['date', 'description', 'title'],
            properties={
                'date': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_DATE, description="Date of symptom (YYYY-MM-DD)"),
                'description': openapi.Schema(type=openapi.TYPE_STRING, description="Description of the symptom"),
                'title': openapi.Schema(type=openapi.TYPE_STRING, description="Title of the symptom")
            }
        ),
        responses={
            201: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'message': openapi.Schema(type=openapi.TYPE_STRING, description="Success message")
                }
            ),
            400: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'error': openapi.Schema(type=openapi.TYPE_STRING, description="Error message")
                }
            ),
            401: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'detail': openapi.Schema(type=openapi.TYPE_STRING, description="Authentication error")
                }
            )
        }
    )
    def post(self, request):
        try:
            if not self.validate_data(request.data):
                return Response({'error': 'Tous les champs sont requis'}, status=status.HTTP_400_BAD_REQUEST)
            symptom_data = request.data
            woman = request.woman
            symptom_data['date'] = datetime.strptime(request.data['date'], "%Y-%m-%d").date()
            serializer = SymptomSerializer(data=symptom_data, context=symptom_data)
            if serializer.is_valid():
                serializer_saved = serializer.save()
                symptom = Symptom.objects.get(id_symptom=serializer_saved.id_symptom)
                woman.symptoms.add(symptom)
                woman.save()
                if woman.ovulations.all().count() > 0:
                    ovulation_last = woman.ovulations.last()
                    ovulation_last.symptoms.add(symptom)
                    ovulation_last.save()
                
                return Response({'message': 'Symptom soumis avec succès'}, status=status.HTTP_201_CREATED)
            return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        except ValueError as ve:
            return Response({'error': f"Erreur de format de date: {str(ve)}"}, status=status.HTTP_400_BAD_REQUEST)
        except ValidationError as ve:
            return Response({'error': f"Erreur de validation: {str(ve)}"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(traceback.format_exc())
            return Response({'error': f"Unexpected error: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

class WomanSymptomListView(APIView):
    permission_classes = [IsAuthenticatedWoman]

    @swagger_auto_schema(
        operation_description="Retrieve all symptoms linked to the authenticated woman.",
        responses={
            200: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                        'physiques': openapi.Schema(type=openapi.TYPE_OBJECT,properties={
                            'id_symptom': openapi.Schema(type=openapi.TYPE_INTEGER, description="Identifiant du symptom"),
                            'date': openapi.Schema(type=openapi.TYPE_STRING, description="Date du symptom creation"),
                            'title': openapi.Schema(type=openapi.TYPE_STRING, description="titre du symptom"),
                            'category': openapi.Schema(type=openapi.TYPE_STRING, description="catecorie du symptom"),
                            'description': openapi.Schema(type=openapi.TYPE_STRING, description="description du symptom"),
                            'symptom_type': openapi.Schema(type=openapi.TYPE_STRING, description="type du symptom"),
                        }),
                        'emotions': openapi.Schema(type=openapi.TYPE_OBJECT,properties={
                            'id_symptom': openapi.Schema(type=openapi.TYPE_INTEGER, description="Identifiant du symptom"),
                            'date': openapi.Schema(type=openapi.TYPE_STRING, description="Date du symptom creation"),
                            'title': openapi.Schema(type=openapi.TYPE_STRING, description="titre du symptom"),
                            'category': openapi.Schema(type=openapi.TYPE_STRING, description="catecorie du symptom"),
                            'description': openapi.Schema(type=openapi.TYPE_STRING, description="description du symptom"),
                            'symptom_type': openapi.Schema(type=openapi.TYPE_STRING, description="type du symptom"),
                        }),
                    }
                ),
            400: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'error': openapi.Schema(type=openapi.TYPE_STRING, description="Error message")
                }
            ),
            401: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'detail': openapi.Schema(type=openapi.TYPE_STRING, description="Authentication error")
                }
            )
        }
    )
    def get(self, request):
        try:
            s_physiques = SymptomSerializer(Symptom.objects.filter(category="physique"), many=True).data
            s_emotionnel = SymptomSerializer(Symptom.objects.filter(category="emotion"), many=True).data
            data = {"physiques":s_physiques,"emotions":s_emotionnel}
            return Response(data, status=status.HTTP_200_OK)
        except ValidationError as ve:
            return Response({'error': f"Serialization error: {str(ve)}"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(traceback.format_exc())
            return Response({'error': f"Unexpected error: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

class WomanSymptomFilterView(APIView):
    permission_classes = [IsAuthenticatedWoman]

    @swagger_auto_schema(
        operation_description="Retrieve symptoms filtered by category for the authenticated woman.",
        manual_parameters=[
            openapi.Parameter('category', openapi.IN_PATH, type=openapi.TYPE_STRING, description="Category to filter symptoms")
        ],
        responses={
            200: SymptomSerializer(many=True),
            400: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'error': openapi.Schema(type=openapi.TYPE_STRING, description="Error message")
                }
            ),
            401: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'detail': openapi.Schema(type=openapi.TYPE_STRING, description="Authentication error")
                }
            )
        }
    )
    def get(self, request, category):
        try:
            symptoms = request.woman.symptoms.all().filter(category=category)
            serializer = SymptomSerializer(symptoms, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except ValidationError as ve:
            return Response({'error': f"Serialization error: {str(ve)}"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(traceback.format_exc())
            return Response({'error': f"Unexpected error: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

class MenstruationNewFull(APIView):
    permission_classes = [IsAuthenticatedWoman]
    
    def validate(self, data):
        try:
            keys = ['start_date', 'cycle_duration', 'symptoms']
            if any(key not in data.keys() for key in keys):
                return False
            start_date = datetime.strptime(data['start_date'], '%Y-%m-%d')
            if start_date > datetime.now():
                return False
            symptoms = data['symptoms']
            for symptom_id in symptoms:
                if not Symptom.objects.filter(id_symptom=symptom_id).exists():
                    return False
            return True
        except ValueError:
            return False
        except Exception:
            return False

    @swagger_auto_schema(
        operation_description="Create a new menstruation record with cycle duration and associated symptoms.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['start_date', 'cycle_duration', 'symptoms'],
            properties={
                'start_date': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_DATE, description="Start date of menstruation (YYYY-MM-DD)"),
                'cycle_duration': openapi.Schema(type=openapi.TYPE_INTEGER, description="Cycle duration in days"),
                'symptoms': openapi.Schema(type=openapi.TYPE_ARRAY, items=openapi.Items(type=openapi.TYPE_INTEGER), description="List of symptom IDs"),
                'duration': openapi.Schema(type=openapi.TYPE_INTEGER, description="Duration of menstruation in days (optional)")
            }
        ),
        responses={
            201: MenstruationSerializer,
            400: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'error': openapi.Schema(type=openapi.TYPE_STRING, description="Error message")
                }
            ),
            401: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'detail': openapi.Schema(type=openapi.TYPE_STRING, description="Authentication error")
                }
            ),
            404: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'error': openapi.Schema(type=openapi.TYPE_STRING, description="Symptom not found")
                }
            )
        }
    )
    def post(self, request):
        try:
            if not self.validate(request.data):
                return Response({'error': 'Veuillez vérifier vos données'}, status=status.HTTP_400_BAD_REQUEST)
            woman = request.woman
            start_date = datetime.strptime(request.data['start_date'], '%Y-%m-%d').date()
            
            last_menstruation = woman.menstruations.last()

            if last_menstruation and (start_date - last_menstruation.start_date).days < int(os.getenv('MAXIMALE_CYCLE', 35)):
                last_menstruation.cycle_length = (start_date - last_menstruation.start_date).days
                last_menstruation.save()

            duration = request.data.get('duration', woman.average_menstruation_duration)
            end_date = start_date + timedelta(days=int(duration)) if duration is not None else start_date + timedelta(days=woman.average_menstruation_duration)
            data = {
                'start_date': start_date,
                'end_date': end_date
            }
            today = timezone.now().date()

            if start_date <= today <= end_date:
                phase = "menstruation"
            elif fertility_window_start <= today <= fertility_window_end:
                phase = "fertilité"
            elif today == predicted_ovulation_date:
                phase = "ovulation"
            elif today < predicted_ovulation_date:
                phase = "pré-ovulation"
            elif today > end_date:
                phase = "phase luteale"
            else:
                phase = "inconnue"
            conseils_cycle = {
                "menstruation": "Repose-toi et bois beaucoup d'eau. C'est normal de se sentir fatiguée.",
                "pré-ovulation": "C’est une bonne période pour être active et commencer de nouveaux projets.",
                "fertilité": "Si tu envisages une grossesse, c’est le bon moment. Sinon, utilise une protection.",
                "ovulation": "Ton corps est à son pic de fertilité aujourd’hui. Écoute ton corps.",
                "phase luteale": "Tu pourrais te sentir un peu sensible. Mange équilibré et repose-toi bien.",
                "inconnue": "Reste à l’écoute de ton corps et contacte un professionnel si besoin."
            }
            conseil = conseils_cycle.get(phase, conseils_cycle["inconnue"])
            send_sms(f"Conseil du jour ({phase}): {conseil}", os.getenv('DEFAULT_PHONE_NUMBER'))

            serializer = MenstruationSerializer(data=data)
            if serializer.is_valid():
                next_start_date = start_date + timedelta(int(request.data['cycle_duration']))
                next_end_date = next_start_date + timedelta(days=woman.average_menstruation_duration)
                Menstruation.objects.create(start_date=next_start_date, end_date=next_end_date, woman=woman)
                
                menstruation = serializer.save(woman=woman)
                woman.last_period_date = start_date
                if end_date is not None:
                    woman.average_menstruation_duration = (end_date - start_date).days
                woman.save()
                woman.update_average_cycle_length()
                
                predicted_ovulation_date = start_date + timedelta(days=woman.average_cycle_length - 14)
                fertility_window_start = predicted_ovulation_date - timedelta(days=5)
                fertility_window_end = predicted_ovulation_date + timedelta(days=1)
                
                Ovulation.objects.create(
                    woman=woman,
                    predicted_ovulation_date=predicted_ovulation_date,
                    fertility_window_start=fertility_window_start,
                    fertility_window_end=fertility_window_end
                )
                for symptom_id in request.data['symptoms']:
                    symptom = Symptom.objects.get(id_symptom=int(symptom_id))
                    woman.symptoms.add(symptom)
                    woman.save()
                    if woman.ovulations.all().count() > 0:
                        ovulation_last = woman.ovulations.last()
                        ovulation_last.symptoms.add(symptom)
                        ovulation_last.save()
                
                Notification.objects.create(
                    woman=woman,
                    message=f"Une nouvelle menstruation a été ajoutée pour la période du {menstruation.start_date} au {menstruation.end_date}."
                )
                    
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        except ValueError as ve:
            return Response({'error': f"Erreur de format de date ou données: {str(ve)}"}, status=status.HTTP_400_BAD_REQUEST)
        except ValidationError as ve:
            return Response({'error': f"Erreur de validation: {str(ve)}"}, status=status.HTTP_400_BAD_REQUEST)
        except Symptom.DoesNotExist:
            return Response({'error': 'Un ou plusieurs symptômes n\'existent pas'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print(traceback.format_exc())
            return Response({'error': f"Erreur inattendue: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)