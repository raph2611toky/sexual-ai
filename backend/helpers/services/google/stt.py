import speech_recognition as sr
from pydub import AudioSegment
import os

def speech_to_text_fichier_audio(chemin_audio, langue='fr-FR'):
    recognizer = sr.Recognizer()
    
    if not chemin_audio.endswith('.wav'):
        audio_wav = "temp_audio.wav"
        son = AudioSegment.from_file(chemin_audio)
        son.export(audio_wav, format="wav")
        chemin_final = audio_wav
    else:
        chemin_final = chemin_audio
    
    with sr.AudioFile(chemin_final) as source:
        audio = recognizer.record(source)
    
    try:
        texte = recognizer.recognize_google(audio, language=langue)
        return texte
    except sr.UnknownValueError:
        return "Impossible de comprendre l'audio."
    except sr.RequestError as e:
        return f"Erreur de service Google : {e}"
    finally:
        if chemin_audio != chemin_final and os.path.exists(chemin_final):
            os.remove(chemin_final)

# 🔁 Exemple d'utilisation :
# Français
print(speech_to_text_fichier_audio("exemple_fr.mp3", langue='fr-FR'))

# Anglais
# print(speech_to_text_fichier_audio("example_en.wav", langue='en-US'))
