from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from apps.menstruation.models import Woman, Menstruation, Ovulation, Symptom, Notification
from apps.menstruation.serializers import WomanSerializer, MenstruationSerializer, OvulationSerializer, SymptomSerializer
from apps.menstruation.permissions import IsAuthenticatedWoman
from django.contrib.auth.models import AnonymousUser

from datetime import timedelta, datetime
import traceback
import os
import random


class WomanLastInfoView(APIView):
    permission_classes = [IsAuthenticatedWoman]
    
    def get(self, request):
        try:
            woman = request.woman
            woman = WomanSerializer(woman, context={'last_info':True}).data
            return Response(woman, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'erreur':str(e)}, status=status.HTTP_400_BAD_REQUEST)

class WomanInfoView(APIView):
    permission_classes = [IsAuthenticatedWoman]

    def get(self, request):
        try:
            woman = WomanSerializer(request.woman).data
            return Response(woman, status=status.HTTP_200_OK)
        except Menstruation.DoesNotExist:
            return Response({'detail': 'Menstruation records not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class MenstruationListView(APIView):
    permission_classes = [IsAuthenticatedWoman]

    def get(self, request):
        try:
            woman = WomanSerializer(request.woman, context={'only_menstruations':True}).data
            return Response(woman, status=status.HTTP_200_OK)
        except Menstruation.DoesNotExist:
            return Response({'detail': 'Menstruation records not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
class MenstruationNew(APIView):
    permission_classes = [IsAuthenticatedWoman]
    
    def validate(self, data):
        try:
            keys=['start_date','duration']
            if any(key not in data.keys()for key in keys):
                return False
            start_date = datetime.strptime(data['start_date'],'%Y-%m-%d')
            if start_date>datetime.now():
                return False
            return True
        except Exception:
            return False

    # request.data.keys = ['start_date', 'duration']
    def post(self, request):
        try:
            if not self.validate(request.data):
                return Response({'error':'veuillez verifier votre donné'},status=400)
            woman = request.woman
            start_date = datetime.strptime(request.data['start_date'], '%Y-%m-%d').date()
            last_menstruation = woman.menstruations.last()

            if last_menstruation:
                last_menstruation.cycle_length = (start_date - last_menstruation.start_date).days
                last_menstruation.save()

            duration = request.data.get('duration',woman.average_menstruation_duration)
            end_date = start_date +timedelta(days=int(duration)) if duration is not None else start_date + timedelta(days=woman.average_menstruation_duration)
            data = {
                'start_date': start_date,
                'end_date': end_date
                }

            serializer = MenstruationSerializer(data=data)
            if serializer.is_valid():
                menstruation = serializer.save(woman=woman)
                woman.last_period_date = start_date
                if end_date is not None:
                    woman.average_mensturation_duration = (end_date - start_date).days
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
            print('serializer is not valid...')
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            print(traceback.format_exc())
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class MenstruationPredictView(APIView):
    permission_classes = [IsAuthenticatedWoman]

    def get(self, request):
        try:
            last_menstruation = request.woman.menstruations.last()
            if not last_menstruation:
                return Response({'detail': 'No menstruation data available for prediction'}, status=status.HTTP_404_NOT_FOUND)
            
            predicted_start = last_menstruation.start_date + timedelta(days=request.woman.average_cycle_length)
            predicted_end_date_duration = predicted_start+timedelta(days=int(request.woman.average_menstruation_duration))
            return Response({'predicted_start_date': predicted_start, 'predicted_end_date_duration':predicted_end_date_duration}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
class OvulationPredictView(APIView):
    permission_classes = [IsAuthenticatedWoman]

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
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
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
            predicted_end_date_duration = predicted_start+timedelta(days=int(request.woman.average_menstruation_duration))
            
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
            return Response(data,status=200)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
class WomanLinkSymptomView(APIView):
    permission_classes=[IsAuthenticatedWoman]
    
    def put(self, request,id_symptom):
        try:
            symptom = Symptom.objects.get(id_symptom=id_symptom)
            woman = request.woman
            woman.symptoms.add(symptom)
            woman.save()
            if woman.ovulations.all().count()>0:
                ovulation_last = woman.ovulations.last()
                ovulation_last.symptoms.add(symptom)
                ovulation_last.save()
            return Response({'message':'symptom soumis avec succès'}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
class WomanSymptomsNewView(APIView):
    permission_classes = [IsAuthenticatedWoman]
    
    def validate_data(self, data):
        try:
            keys = ['date', 'description','title']
            if any(key not in data.keys()for key in keys):
                return False
            return True
        except Exception:
            return False

    def post(self, request):
        try:
            # request.data = ['date', 'description','title']
            if not self.validate_data(request.data):
                return Response({'erreur':'Tous les champs sont requis'}, status=status.HTTP_400_BAD_REQUEST)
            symptom_data = request.data
            woman = request.woman
            symptom_data['date'] = datetime.strptime(request.data['date'], "%Y-%m-%d").date()
            serializer = SymptomSerializer(data=symptom_data, context=symptom_data)
            if serializer.is_valid():
                serializer_saved = serializer.save()
                symptom = Symptom.objects.get(id_symptom=serializer_saved.id_symptom)
                woman.symptoms.add(symptom)
                woman.save()
                if woman.ovulations.all().count()>0:
                    ovulation_last = woman.ovulations.last()
                    ovulation_last.symptoms.add(symptom)
                    ovulation_last.save()
                
                return Response({'message':'symptom soumis avec succès'}, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
class WomanSymptomListView(APIView):
    permission_classes = [IsAuthenticatedWoman]

    def get(self, request):
        try:
            symptoms = Symptom.objects.filter(woman=request.woman)
            serializer = SymptomSerializer(symptoms, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
class WomanSymptomFilterView(APIView):
    permission_classes = [IsAuthenticatedWoman]

    def get(self, request, category):
        try:
            symptoms = Symptom.objects.filter(woman=request.woman,category=category)
            serializer = SymptomSerializer(symptoms, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
class MenstruationNewFull(APIView):
    permission_classes = [IsAuthenticatedWoman]
    
    def validate(self, data):
        try:
            keys=['start_date','cycle_duration', 'symptoms']
            if any(key not in data.keys()for key in keys):
                return False
            start_date = datetime.strptime(data['start_date'],'%Y-%m-%d')
            if start_date>datetime.now():
                return False
            symptoms = data['symptoms']
            for symptom_id in symptoms:
                if not Symptom.objects.filter(id_symptom=symptom_id).exists():
                    return False
            return True
        except Exception:
            return False

    # request.data.keys = ['start_date', 'cycle_duration', 'symptoms']
    def post(self, request):
        try:
            if not self.validate(request.data):
                return Response({'error':'veuillez verifier votre donné'},status=400)
            woman = request.woman
            start_date = datetime.strptime(request.data['start_date'], '%Y-%m-%d').date()
            
            last_menstruation = woman.menstruations.last()

            if last_menstruation and (start_date - last_menstruation.start_date).days<int(os.getenv('MAXIMALE_CYCLE')):
                last_menstruation.cycle_length = (start_date - last_menstruation.start_date).days
                last_menstruation.save()

            duration = request.data.get('duration',woman.average_menstruation_duration)
            end_date = start_date +timedelta(days=int(duration)) if duration is not None else start_date + timedelta(days=woman.average_menstruation_duration)
            data = {
                'start_date': start_date,
                'end_date': end_date
                }

            serializer = MenstruationSerializer(data=data)
            if serializer.is_valid():
                next_start_date = start_date+timedelta(int(request.data['cycle_duration']))
                next_end_date = next_start_date + timedelta(days=woman.average_menstruation_duration)
                Menstruation.objects.create(start_date=next_start_date,end_date=next_end_date)
                last_menstruation = woman.menstruations.last()

                if last_menstruation:
                    last_menstruation.cycle_length = (start_date - last_menstruation.start_date).days
                    last_menstruation.save()
                    
                menstruation = serializer.save(woman=woman)
                woman.last_period_date = start_date
                if end_date is not None:
                    woman.average_mensturation_duration = (end_date - start_date).days
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
                    woman = request.woman
                    woman.symptoms.add(symptom)
                    woman.save()
                    if woman.ovulations.all().count()>0:
                        ovulation_last = woman.ovulations.last()
                        ovulation_last.symptoms.add(symptom)
                        ovulation_last.save()
                
                Notification.objects.create(
                    woman=woman,
                    message=f"Une nouvelle menstruation a été ajoutée pour la période du {menstruation.start_date} au {menstruation.end_date}."
                )
                    
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            print('serializer is not valid...')
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            print(traceback.format_exc())
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)