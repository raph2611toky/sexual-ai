from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from apps.chatbot.views import (ConversationFilterView, MessageChatNewView, ConversationNewView, ConversationProfileView,
    ConversationModifierTitreView, ConversationSupprimerView)

urlpatterns = [
    path('conversation/<int:conversation_id>/details/',ConversationProfileView.as_view(),name="conversation_profile"),#GET
    path('conversation/list/',ConversationFilterView.as_view(),name='Conversation_list_filter'),#GET
    path('conversation/new/',ConversationNewView.as_view(),name='conversation_new'),#POST
    path('messagechat/new/',MessageChatNewView.as_view(),name='message_new'),#POST
    path('conversation/<int:conversation_id>/modifier/titre/',ConversationModifierTitreView.as_view(),name='modifier-titre-conversation'),#POST
    path('conversation/<int:conversation_id>/supprimer/',ConversationSupprimerView.as_view(),name='supprimer-conversation'),#POST
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
