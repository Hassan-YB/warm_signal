"""
URL configuration for users app API endpoints.

All views are class-based views following Django REST Framework best practices.
"""

from django.urls import path
from . import views

app_name = 'users'

urlpatterns = [
    path('api/auth/signup/', views.SignupView.as_view(), name='signup'),
    path('api/auth/login/', views.LoginView.as_view(), name='login'),
    path('api/auth/logout/', views.LogoutView.as_view(), name='logout'),
    path('api/auth/profile/', views.UserProfileView.as_view(), name='profile'),
    path('api/auth/password/change/', views.PasswordChangeView.as_view(), name='password-change'),
]

