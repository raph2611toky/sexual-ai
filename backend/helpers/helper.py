from dotenv import load_dotenv
from datetime import timedelta, datetime
from django.utils import timezone as django_timezone

import os
import random
from helpers.constantes import *
load_dotenv()


def get_notification(woman):
    menstruations = woman.menstruations.all().order_by('-start_date')
    if menstruations.count()==0:
        return "Veuiller nous informer de votre dérnier règle pour avoir un peu plus de prevision sur votre cycle menstruel.Sexual Education vous remercie."
    last_period = menstruations.first().start_date
    predicted_ovulation_date = last_period + timedelta(days=woman.get_cycle() - 14)
    fertility_window_start = predicted_ovulation_date - timedelta(days=4)
    fertility_window_end = predicted_ovulation_date + timedelta(days=3)
    last_menstruation = woman.menstruations.order_by('-start_date').first()
    if not last_menstruation:
        return "Veuiller nous informer de votre dérnier règle pour avoir un peu plus de prevision sur votre cycle menstruel.Sexual Education vous remercie."
    
    predicted_start = last_menstruation.start_date + timedelta(days=woman.get_cycle())
    predicted_end_date_duration = predicted_start+timedelta(days=int(woman.average_menstruation_duration))
    
    today = datetime.now().date()
    if today.strftime('%Y-%m-%d')in [(m.start_date-timedelta(days=2)).strftime('%Y-%m-%d') for m in woman.menstruations.all().order_by('start_date')]+[(predicted_start-timedelta(days=2)).strftime('%Y-%m-%d')]:
        current_phase = "normal"
        advice = random.choice(PRE_MENSTRUATION_TWO_DAYS)
    elif today.strftime('%Y-%m-%d')in [(m.start_date-timedelta(days=1)).strftime('%Y-%m-%d') for m in woman.menstruations.all().order_by('start_date')]+[(predicted_start-timedelta(days=1)).strftime('%Y-%m-%d')]:
        current_phase = "normal"
        advice = random.choice(PRE_MENSTRUATION_ONE_DAY)
    elif last_menstruation.start_date <= today <= last_menstruation.end_date or predicted_start<=today<=predicted_end_date_duration:
        current_phase = "menstruation"
        advice = random.choice(MENSTRUATION_MESSAGES)
    elif last_menstruation.end_date < today < fertility_window_start:
        current_phase = "normal"
        advice = random.choice(PRE_OVULATION_MESSAGES)
    elif fertility_window_start <= today <= fertility_window_end:
        current_phase = "fertile"
        advice = random.choice(FERTILITY_MESSAGES)
    else:
        current_phase = "normal"
        advice = random.choice(POST_OVULATION_MESSAGES)
    return advice

def get_timezone():
    tz = os.getenv("TIMEZONE_HOURS")
    if '-' in tz:
        return django_timezone.now() - timedelta(hours=int(tz.strip()[1:]))
    return django_timezone.now()+timedelta(hours=int(tz))
