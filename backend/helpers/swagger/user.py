from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

error_schema = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    properties={
        'erreur': openapi.Schema(type=openapi.TYPE_STRING, description="Description de l'erreur")
    }
)

login_response_schema = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    properties={
        'refresh': openapi.Schema(type=openapi.TYPE_STRING, description="Token de rafraîchissement JWT"),
        'access': openapi.Schema(type=openapi.TYPE_STRING, description="Token d'accès JWT"),
    }
)

register_request_schema = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    required=['name', 'email', 'password', 'sexe', 'birth_date'],  
    properties={
        'name': openapi.Schema(type=openapi.TYPE_STRING, description="Nom de l'utilisateur"),
        'email': openapi.Schema(type=openapi.TYPE_STRING, format='email', description="Adresse email"),
        'password': openapi.Schema(type=openapi.TYPE_STRING, description="Mot de passe"),
        'sexe': openapi.Schema(
            type=openapi.TYPE_STRING,
            enum=['masculin', 'feminin', 'I'],
            description="Sexe de l'utilisateur (M pour masculin, F pour féminin, I pour inconnu)"
        ),
        'birth_date': openapi.Schema(
            type=openapi.TYPE_STRING,
            format='date',
            description="Date de naissance (format: YYYY-MM-DD ou DD/MM/YYYY)"
        ),
        'profession_domaine': openapi.Schema(
            type=openapi.TYPE_STRING,
            description="Domaine professionnel (optionnel, défaut: 'Inconnu')",
            default='Inconnu'
        ),
    }
)

register_201_response_schema = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    properties={
        "email": openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_EMAIL, example="jean.dupont@example.com"),
        "message": openapi.Schema(type=openapi.TYPE_STRING, example="Une code Otp de verification a été envoyé à jean.dupont@example.com"),
    },
)

register_400_response_schema = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    properties={
        "erreur": openapi.Schema(
            type=openapi.TYPE_STRING,
            description="Message d'erreur retourné par la vue (attributs requis, email existant, erreur de sérialisation, etc.).",
            example="Tous les attributs sont requis",
        )
    },
)

logout_response_schema = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    properties={
        'message': openapi.Schema(type=openapi.TYPE_STRING, description="Message de confirmation")
    }
)