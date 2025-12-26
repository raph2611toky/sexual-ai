from openai import OpenAI
from dotenv import load_dotenv
import os
import traceback

from apps.chatbot.models import MessageChat
from helpers.helper import LOGGER
from helpers.services.google.traduction import traduire_texte

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

client = OpenAI(
    api_key=GEMINI_API_KEY,
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
)

CHAT_CONTENT = {
    "FR": "Tu es un assistant exceptionnel appelé Sexual AI, spécialisé dans la santé sexuelle. Tu es basé à Madagascar et tu connais toutes les provinces, régions, districts et villes du pays. Tu fournis des informations extrêmement détaillées et complètes sur la santé sexuelle, incluant les causes, symptômes, méthodes de prévention, options de traitement et conseils pratiques. Tu donnes également des conseils brefs mais précis, et tu suggères de contacter ou de visiter l’hôpital ou le CSB le plus proche lorsque cela est nécessaire.",
    "en": "You are an exceptional assistant called Sexual AI, specialized in sexual health. You are based in Madagascar and know all the provinces, regions, districts, and cities of the country. You provide extremely detailed and comprehensive information on sexual health, including causes, symptoms, prevention methods, treatment options, and practical advice. You also give brief but precise advice and suggest contacting or visiting the nearest hospital or CSB when necessary.",
    "MG": "Ianao dia mpanampy miavaka antsoina hoe Sexual AI, manam-pahaizana manokana amin’ny fahasalamana ara-pananahana. Miorina ao Madagasikara ianao ary mahafantatra ny faritany, faritra, distrika ary tanàna rehetra ao amin’ny firenena. Manome fampahalalana tena amin’ny antsipiriany sy feno momba ny fahasalamana ara-pananahana ianao, anisan’izany ny antony, ny soritr’aretina, ny fomba fisorohana, ny safidy fitsaboana ary ny torohevitra azo ampiharina. Manome torohevitra fohy nefa marina koa ianao ary manoro hevitra ny hifandray na hitsidika ny hopitaly na CSB akaiky indrindra rehefa ilaina izany."
}

def prepare_messages(conversation_id: int, user_message: str, lang='FR'):
    system_msg = {
        "role": "system",
        "content": CHAT_CONTENT[lang]
    }

    msgs = MessageChat.objects.filter(conversation_id=conversation_id).order_by('-created_at')[:20]
    history = []
    for m in reversed(msgs):
        role = "user" if m.from_user else "assistant"
        history.append({"role": role, "content": m.contenu})

    user_msg = {"role": "user", "content": user_message}

    return [system_msg] + history + [user_msg]

def conversation_chat(conversation_id: int, message: str, lang='fr') -> str:
    if not message:
        return "Message requis"
    if lang.upper() == 'MG':
        print(message)
        message = traduire_texte(message, source_lang='mg', cible_lang='fr')
        print(message)
    try:
        messages = prepare_messages(conversation_id, message, lang)
        LOGGER.info("=="*20)
        LOGGER.info(f"Messages préparés pour la conversation {conversation_id} : {messages}", end="\n\n")
        LOGGER.info(f"{'--'*20}".join([f"# Role : {msg['role']}\n# Content: {msg['content']}\n" for msg in messages]))
        
        LOGGER.info("=="*20)
        response = client.chat.completions.create(
            model="gemini-2.0-flash",
            messages=messages,
            # temperature=0.7,
            # max_tokens=512
        )
        return response.choices[0].message.content
    except Exception as e:
        print(traceback.format_exc())
        raise Exception(str(e))

def simple_chat(message: str, lang='FR') -> str:
    if not message:
        return "Message requis"
    if lang.upper() == 'MG':
        message = traduire_texte(message, source_lang='mg', cible_lang='fr')
    try:
        chat_content = CHAT_CONTENT.get(lang.upper(), CHAT_CONTENT["FR"])
        response = client.chat.completions.create(
            model="gemini-2.0-flash",
            messages=[
                {"role": "system", "content": chat_content},
                {"role": "user", "content": message}
            ]
        )
        reponse_chat = response.choices[0].message.content
        if lang.upper() == 'MG':
            reponse_chat = traduire_texte(reponse_chat, source_lang='FR', cible_lang='MG')
        print("✔✅ Génération réussie.")
        return reponse_chat
    except Exception as e:
        print(traceback.format_exc())
        raise Exception(f"Erreur lors de la communication avec l’IA : {str(e)}")

async def websocket_chat(message: str) -> str:
    if not message:
        raise Exception("Message requis pour le chat")

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
        raise Exception(f"Erreur lors de la communication avec l'IA: {str(e)}")
