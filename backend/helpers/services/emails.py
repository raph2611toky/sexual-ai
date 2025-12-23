# backend/helpers/services/emails.py

from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from helpers.constantes import TEMPLATES_EMAIL
from datetime import datetime
import os, logging, traceback
import threading

LOGGER = logging.getLogger(__name__)


def _send_email_sync(list_email_to_send, template_name, data):
    try:
        print("[INFO] Envoi email...")
        data["current_year"] = datetime.now().year
        subject = data.get("subject", "Objet d'envoi d'email")
        data["logo_url"] = os.getenv("LOGO_SEXUALAI_URL")
        data["site_url"] = os.getenv("SITE_URL")
        data["support_email"] = os.getenv("SUPPORT_EMAIL")

        html_message = render_to_string(
            TEMPLATES_EMAIL[template_name], data
        )

        send_mail(
            subject=subject,
            message="",
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=list_email_to_send,
            html_message=html_message,
            fail_silently=False,
        )

        print("[INFO] Email envoyé avec succès....✅")
        LOGGER.info("[INFO] Email envoyé avec succès....✅")

    except Exception as e:
        LOGGER.error("Erreur envoi email", exc_info=True)


def envoyer_email(list_email_to_send: list, template_name: str, data: dict):
    """
    Envoi email ASYNCHRONE (thread)
    """
    thread = threading.Thread(
        target=_send_email_sync,
        args=(list_email_to_send, template_name, data),
        daemon=True,  # important
    )
    thread.start()

