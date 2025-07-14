from django.contrib import admin
from django.urls import path, include
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework.permissions import AllowAny
from django.conf import settings
from django.conf.urls.static import static

schema_view = get_schema_view(
    openapi.Info(
        title="SEXUAL AI",
        default_version='v1',
        description="API pour la santé sexuelle",
        terms_of_service="https://sexualai.learnix.school/terms-of-services/",
        contact=openapi.Contact(email="contact@monapi.local"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=[AllowAny],
    url="https://sa-backend.learnix.school"
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('apps.users.urls')),
    path('api/', include('apps.forum.urls')),
    path('api/', include('apps.menstruation.urls')),
    path('api/', include('apps.chatbot.urls')),
    
    path('api/docs/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)