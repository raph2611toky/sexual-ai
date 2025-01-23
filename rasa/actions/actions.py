
# from typing import Any, Text, Dict, List
#
# from rasa_sdk import Action, Tracker
# from rasa_sdk.executor import CollectingDispatcher
#
#
# class ActionHelloWorld(Action):
#
#     def name(self) -> Text:
#         return "action_hello_world"
#
#     def run(self, dispatcher: CollectingDispatcher,
#             tracker: Tracker,
#             domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
#
#         dispatcher.utter_message(text="Hello World!")
#
#         return []

from datetime import datetime
from rasa_sdk import Action, Tracker
from rasa_sdk.events import SlotSet
from rasa_sdk.executor import CollectingDispatcher
import random

class ActionShowTime(Action):
    def name(self):
        return "action_show_time"

    def run(self, dispatcher:CollectingDispatcher, tracker:Tracker, domain):
        current_time = datetime.now().strftime("%H:%M")
        response = [f"Il est actuellement {current_time}.", f"L'heure est maintenant {current_time}.", f"L'heure actuelle est {current_time}.", f"Nous sommes à {current_time}."]
        dispatcher.utter_message(text=random.choice(response))
        return [SlotSet("time", current_time)]

class ActionShowDate(Action):
    def name(self):
        return "action_show_date"

    def run(self, dispatcher, tracker, domain):
        current_date = datetime.now().strftime("%d/%m/%Y")
        response = [f"Nous sommes le {current_date}.",f"La date d'aujourd'hui est {current_date}.",f"Aujourd'hui, c'est le {current_date}.",f"Nous sommes le {current_date}, c'est bien ça !"]
        dispatcher.utter_message(text=random.choice(response))
        return [SlotSet("date", current_date)]

class ActionShowBotName(Action):
    def name(self):
        return "action_show_bot_name"

    def run(self, dispatcher, tracker, domain):
        bot_name = "SexualAI"
        response = [f"Mon nom est {bot_name}.",f"On m'appelle {bot_name}.",f"Je m'appelle {bot_name}, enchanté!",f"Tu peux m'appeler {bot_name}."]
        dispatcher.utter_message(text=random.choice(response))
        return [SlotSet("bot_name", bot_name)]
    
class ActionShowJour(Action):
    def name(self):
        return "action_show_jour"

    def run(self, dispatcher, tracker, domain):
        jour = datetime.now().strftime("%A")
        date = datetime.now().strftime("%d-%m-%Y")
        response = [f"Aujourd'hui, nous sommes {jour}.",f"C'est {jour} aujourd'hui.",f"Le jour d'aujourd'hui est {jour}.",f"Nous sommes aujourd'hui {jour}."]
        dispatcher.utter_message(text=random.choice(response))
        return [SlotSet("jour", jour), SlotSet("date", date)]
    
class ActionShowMeteo(Action):
    def name(self):
        return "action_show_meteo"

    def run(self, dispatcher, tracker, domain):
        meteo = 'nuageux'
        response = [f"La météo est {meteo} aujourd'hui.",f"Aujourd'hui, il fait {meteo}.",f"Le temps actuel est {meteo}.",f"La météo du jour est {meteo}."]
        dispatcher.utter_message(text=random.choice(response))
        return [SlotSet("meteo", meteo)]
    
class ActionShowSaison(Action):
    def name(self):
        return "action_show_saison"

    def run(self, dispatcher, tracker, domain):
        mois = datetime.now().month

        if mois in [12, 1, 2]:
            saison = "hiver"
        elif mois in [3, 4, 5]:
            saison = "printemps"
        elif mois in [6, 7, 8]:
            saison = "été"
        else:
            saison = "automne"
        response = [f"Nous sommes en {saison}.",f"C'est la saison {saison} actuellement.",f"On est en pleine saison de {saison}.",f"Actuellement, la saison est {saison}."]
        dispatcher.utter_message(text=random.choice(response))
        return [SlotSet("saison", saison)]

class ActionShowCreatorName(Action):
    def name(self):
        return "action_show_creator_name"

    def run(self, dispatcher, tracker, domain):
        creator_name = random.choice(["Mon créateur est Raph et l'équipe IKOM.","Je suis un projet de l'équipe IKOM, avec Raph en tête de développement.","Je suis né grâce au travail de Raph et l'équipe IKOM.","Je dois mon existence à Raph et à l'équipe IKOM."])
        dispatcher.utter_message(text=creator_name)
        return [SlotSet("creator_name", creator_name)]
