from twilio.rest import Client
import argparse, os
from dotenv import load_dotenv

load_dotenv()

def send_sms(message="", number_destination=os.getenv('DEFAULT_PHONE_NUMBER')):
    try:
        account_sid = os.getenv('TWILIO_SID')#'ACb4d4746e6c6ae008b7f529cf7f62352b'
        auth_token = os.getenv('TWILIO_AUTH_TOKEN')#'0165fe3921b8257c031b7778b21b92c9'
        from_number = os.getenv('TWILIO_NUMBER')
        client = Client(account_sid, auth_token)
        message = client.messages.create(
            from_=from_number,
            body=message,
            to=number_destination
            )
        print(message.account_sid)
        print("sms is sended successfully.....")
        return True
    except Exception as e:
        print(e)
        return False
