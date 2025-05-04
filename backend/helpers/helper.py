from dotenv import load_dotenv
from datetime import timedelta
from django.utils import timezone as django_timezone

import os
import requests
import pyttsx3
import json

load_dotenv()

def get_timezone():
    tz = os.getenv("TIMEZONE_HOURS")
    if '-' in tz:
        return django_timezone.now() - timedelta(hours=int(tz.strip()[1:]))
    return django_timezone.now()+timedelta(hours=int(tz))
