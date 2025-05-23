from openai import OpenAI
from dotenv import load_dotenv
import os
import asyncio, traceback

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

client = OpenAI(
    api_key=GEMINI_API_KEY,
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
)

def simple_chat(message: str, lang='fr') -> str:
    if not message:
        return "Message requis"

    try:
        response = client.chat.completions.create(
            model="gemini-2.0-flash",
            messages=[
                {"role": "system", "content": "Tu es un très bon assistant appelé Sexual AI qui est axé sur la santé sexuel. Tu donne des conseils brief mais précis."},
                {"role": "user", "content": message}
            ]
        )
        print(response)
        return response.choices[0].message.content
    except Exception as e:
        print(traceback.format_exc())
        return f"Erreur lors de la communication avec l'IA: {str(e)}"

async def websocket_chat(message: str) -> str:
    if not message:
        return {"message": "", "error": "Message requis"}

    try:
        response = client.chat.completions.create(
            model="gemini-2.0-flash",
            messages=[
                {"role": "system", "content": "Tu es un très bon assistant appelé Finale-AI."},
                {"role": "user", "content": message}
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        return {
            "message": message,
            "error": f"Erreur lors de la communication avec l'IA: {str(e)}"
        }
