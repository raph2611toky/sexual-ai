from openai import OpenAI
from dotenv import load_dotenv
import os
import asyncio, traceback
from helpers.services.google.traduction import traduire_texte

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

client = OpenAI(
    api_key=GEMINI_API_KEY,
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
)

CHAT_CONTENT = {
    "fr": "Tu es un très bon assistant appelé Sexual AI qui est axé sur la santé sexuel. Tu donne des conseils brief mais précis.",
    "en":"You are a very good assistant called Sexual AI that is focused on sexual health. You provide brief but precise advice."
}

def simple_chat(message: str, lang='fr') -> str:
    if not message:
        return "Message requis"
    if lang=='mg':
        message = traduire_texte(message, source_lang='mg',cible_lang='fr')
    try:
        chat_content = "Tu es un très bon assistant appelé Sexual AI qui est axé sur la santé sexuel. Tu donne des conseils brief mais précis."
        if lang=='en':
            chat_content = CHAT_CONTENT[lang]
        response = client.chat.completions.create(
            model="gemini-2.0-flash",
            messages=[
                {"role": "system", "content": chat_content},
                {"role": "user", "content": message}
            ]
        )
        reponse_chat = response.choices[0].message.content
        if lang=='mg':
            reponse_chat = traduire_texte(reponse_chat, source_lang='fr',cible_lang='mg')
        print("✔✅ Generation reussie.")
        return reponse_chat
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
