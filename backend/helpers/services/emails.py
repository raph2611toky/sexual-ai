from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings

from helpers.constants import TEMPLATES_EMAIL
from datetime import datetime
from dotenv import load_dotenv
import os, logging

load_dotenv()
LOGGER = logging.getLogger(__name__)

def envoyer_email(list_email_to_send:list, template_name:str, data:dict):
    try:
        data['current_year'] = datetime.now().year
        objet = data.get('subject', 'Objet d\'envoie d\'email ici.')
        data['logo_url'] = os.getenv('LOGO_SEXUALAI_URL')
        html_message = render_to_string(TEMPLATES_EMAIL[template_name], data)
        email_config = settings.EMAIL_HOST_USER
        send_mail(
            objet,
            '',
            email_config,
            list_email_to_send,
            html_message=html_message,
            fail_silently=False,
        )
        
        print("Email envoié avec succès✅.")
        LOGGER.info("Email envoié avec succès✅.")
    except Exception as e:
        print(f"Erreur lors d'envoie de l'email: {e}")
        LOGGER.error(f"Erreur lors d'envoie de l'email: {e}")

