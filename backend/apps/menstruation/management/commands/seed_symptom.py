import random
from datetime import timedelta
from django.utils import timezone
from django.core.management.base import BaseCommand
from apps.menstruation.models import Symptom
from faker import Faker

fake = Faker()


class Command(BaseCommand):
    help = "Seeder pour la creation des symptoms par defaut."

    def handle(self, *args, **kwargs):
        self.stdout.write("🚀 Suppression des anciennes données...")
        Symptom.objects.all().delete()

        symptoms_data = [
            # Général
            {"title": "Fatigue", "description": "Fatigue générale ressentie pendant la journée", "type": "general", "category": "physique"},
            {"title": "Maux de tête", "description": "Céphalée légère à modérée", "type": "general", "category": "physique"},
            {"title": "Stress", "description": "Sentiment de pression ou d’inquiétude", "type": "general", "category": "emotion"},
            {"title": "Irritabilité", "description": "Réactions excessives à de petites frustrations", "type": "general", "category": "emotion"},
            
            # Menstruel
            {"title": "Crampes", "description": "Douleurs dans le bas-ventre pendant les règles", "type": "menstrual", "category": "physique"},
            {"title": "Sautes d’humeur", "description": "Passage rapide d’une émotion à une autre", "type": "menstrual", "category": "emotion"},
            {"title": "Sensibilité des seins", "description": "Seins douloureux ou gonflés", "type": "menstrual", "category": "physique"},
            {"title": "Tristesse", "description": "Sentiment de mélancolie", "type": "menstrual", "category": "emotion"},

            # Ovulation
            {"title": "Douleur ovulatoire", "description": "Douleur d’un seul côté du bas-ventre", "type": "ovulation", "category": "physique"},
            {"title": "Augmentation de la libido", "description": "Appétit sexuel plus élevé que d’habitude", "type": "ovulation", "category": "emotion"},
            {"title": "Énergie accrue", "description": "Sentiment de vitalité ou motivation", "type": "ovulation", "category": "physique"},
            {"title": "Optimisme", "description": "Vision plus positive des choses", "type": "ovulation", "category": "emotion"},
        ]

        for entry in symptoms_data:
            Symptom.objects.create(
                date=timezone.now().date() - timedelta(days=random.randint(0, 10)),
                title=entry["title"],
                description=entry["description"],
                symptom_type=entry["type"],
                category=entry["category"]
            )

        print("✅ Symptômes insérés avec succès.")

