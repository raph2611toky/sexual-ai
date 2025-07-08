from django.urls import path
from apps.users.views import ProfileView, LoginView,LogoutView,RegisterView,ProfileUpdateView

urlpatterns = [
    path('profile/',ProfileView.as_view(),name="profile"),#GET
    path('profile/update/',ProfileUpdateView.as_view(),name="profile-update"),#GET
    path('login/',LoginView.as_view(),name="login"),#POST
    path('register/',RegisterView.as_view(),name="register"),#POST
    path('logout/',LogoutView.as_view(),name='logout'),#PUT
]
