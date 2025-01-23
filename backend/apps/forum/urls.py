from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from apps.forum.views import DiscussionForumListView,DiscussionForumFilterView,MessageDFNewView,MessageDFProfileView,LikeMessageDFView,DislikeMessageDFView,MessageDFResponseView

urlpatterns = [
    path('discussion/list/',DiscussionForumListView.as_view(),name='discussion_list'),#GET
    path('discussion/filter/',DiscussionForumFilterView.as_view(),name='discussion_filter'),#GET
    path('message/new/',MessageDFNewView.as_view(),name='message_new'),#POST
    path('message/response/',MessageDFResponseView.as_view(),name='message_response'),#POST
    path('message/profile/',MessageDFProfileView.as_view(),name='message_profile'),#GET
    path('message/like/<int:message_id>/',LikeMessageDFView.as_view(),name='message_like'),#PUT
    path('message/dislike/<int:message_id>/',DislikeMessageDFView.as_view(),name='^message_dislike'),#PUT
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
