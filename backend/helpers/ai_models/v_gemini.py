from dotenv import load_dotenv
import os
import traceback

from google.auth import default
import google.auth.transport.requests
import openai

from apps.chatbot.models import MessageChat
from helpers.services.google.traduction import traduire_texte

load_dotenv()

PROJECT_ID = os.getenv("VERTEX_PROJECT_ID")
LOCATION = os.getenv("VERTEX_LOCATION", "global")
MODEL_NAME = os.getenv("VERTEX_OPENAI_MODEL", "google/gemini-2.0-flash-001")
SCOPE = os.getenv("VERTEX_OPENAI_SCOPE", "https://www.googleapis.com/auth/cloud-platform")

if not PROJECT_ID:
    raise RuntimeError("VERTEX_PROJECT_ID manquant dans le .env")

BASE_URL = (
    f"https://{LOCATION}-aiplatform.googleapis.com/v1/"
    f"projects/{PROJECT_ID}/locations/{LOCATION}/endpoints/openapi"
)

def _get_access_token() -> str:
    # Récupère un token OAuth via ADC (service account attaché, WIF, ou credentials disponibles)
    credentials, _ = default(scopes=[SCOPE])
    credentials.refresh(google.auth.transport.requests.Request())
    return credentials.token

def _make_client() -> openai.OpenAI:
    token = _get_access_token()
    return openai.OpenAI(base_url=BASE_URL, api_key=token)

CHAT_CONTENT = {
    "FR": "Tu es un assistant exceptionnel appelé Sexual AI, spécialisé dans la santé sexuelle. Tu es basé à Madagascar et tu connais toutes les provinces, régions, districts et villes du pays. Tu fournis des informations extrêmement détaillées et complètes sur la santé sexuelle, incluant les causes, symptômes, méthodes de prévention, options de traitement et conseils pratiques. Tu donnes également des conseils brefs mais précis, et tu suggères de contacter ou de visiter l’hôpital ou le CSB le plus proche lorsque cela est nécessaire.",
    "EN": "You are an exceptional assistant called Sexual AI, specialized in sexual health. You are based in Madagascar and know all the provinces, regions, districts, and cities of the country. You provide extremely detailed and comprehensive information on sexual health, including causes, symptoms, prevention methods, treatment options, and practical advice. You also give brief but precise advice and suggest contacting or visiting the nearest hospital or CSB when necessary.",
    "MG": "Ianao dia mpanampy miavaka antsoina hoe Sexual AI, manam-pahaizana manokana amin’ny fahasalamana ara-pananahana. Miorina ao Madagasikara ianao ary mahafantatra ny faritany, faritra, distrika ary tanàna rehetra ao amin’ny firenena. Manome fampahalalana tena amin’ny antsipiriany sy feno momba ny fahasalamana ara-pananahana ianao, anisan’izany ny antony, ny soritr’aretina, ny fomba fisorohana, ny safidy fitsaboana ary ny torohevitra azo ampiharina. Manome torohevitra fohy nefa marina koa ianao ary manoro hevitra ny hifandray na hitsidika ny hopitaly na CSB akaiky indrindra rehefa ilaina izany."
}

def prepare_messages(conversation_id: int, user_message: str, lang="FR"):
    system_msg = {"role": "system", "content": CHAT_CONTENT.get(lang.upper(), CHAT_CONTENT["FR"])}

    msgs = (
        MessageChat.objects.filter(conversation_id=conversation_id)
        .order_by("-created_at")[:20]
    )

    history = []
    for m in reversed(msgs):
        role = "user" if m.from_user else "assistant"
        history.append({"role": role, "content": m.contenu})

    user_msg = {"role": "user", "content": user_message}
    return [system_msg] + history + [user_msg]

def conversation_chat(conversation_id: int, message: str, lang="FR") -> str:
    if not message:
        return "Message requis"

    try:
        if lang.upper() == "MG":
            message = traduire_texte(message, source_lang="mg", cible_lang="fr")

        messages = prepare_messages(conversation_id, message, lang)

        client = _make_client()  # token refresh à chaque requête (simple et safe)
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=messages,
        )
        return response.choices[0].message.content
    except Exception as e:
        print(traceback.format_exc())
        raise Exception(str(e))

def simple_chat(message: str, lang="FR") -> str:
    if not message:
        return "Message requis"

    try:
        if lang.upper() == "MG":
            message_fr = traduire_texte(message, source_lang="mg", cible_lang="fr")
        else:
            message_fr = message

        chat_content = CHAT_CONTENT.get(lang.upper(), CHAT_CONTENT["FR"])

        client = _make_client()
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": chat_content},
                {"role": "user", "content": message_fr},
            ],
        )

        reponse = response.choices[0].message.content

        if lang.upper() == "MG":
            reponse = traduire_texte(reponse, source_lang="FR", cible_lang="MG")

        return reponse
    except Exception as e:
        print(traceback.format_exc())
        raise Exception(f"Erreur lors de la communication avec l’IA : {str(e)}")

async def websocket_chat(message: str) -> str:
    if not message:
        raise Exception("Message requis pour le chat")

    try:
        client = _make_client()
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": "Tu es un très bon assistant appelé Finale-AI."},
                {"role": "user", "content": message},
            ],
        )
        return response.choices[0].message.content
    except Exception as e:
        raise Exception(f"Erreur lors de la communication avec l'IA: {str(e)}")
