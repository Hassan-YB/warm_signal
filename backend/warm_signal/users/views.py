"""
API Views for User Authentication

ARCHITECTURE NOTE:
==================
This project uses CLASS-BASED VIEWS exclusively.

Views should contain minimal code and delegate to:
- Serializers for validation and data transformation
- Models for business logic

This keeps views thin and makes the codebase more maintainable.
Following Django REST Framework best practices with class-based views.
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

from .serializers import (
    UserSignupSerializer,
    UserLoginSerializer,
    UserSerializer,
    UserUpdateSerializer,
    PasswordChangeSerializer
)
from .utils import success_response, error_response

User = get_user_model()


class SignupView(APIView):
    """
    User registration endpoint.
    
    Class-based view that delegates to serializer for validation
    and model method for business logic.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        """Handle POST request for user registration."""
        serializer = UserSignupSerializer(data=request.data)
        
        if serializer.is_valid():
            # Serializer handles validation, model handles business logic
            user = serializer.save()
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            # Return standardized success response
            user_serializer = UserSerializer(user)
            return success_response(
                data={
                    'user': user_serializer.data,
                    'tokens': {
                        'refresh': str(refresh),
                        'access': str(refresh.access_token),
                    }
                },
                message='User registered successfully.',
                status_code=status.HTTP_201_CREATED
            )
        
        # Return standardized error response
        return error_response(
            message='Registration failed. Please check your information.',
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )


class LoginView(APIView):
    """
    User login/authentication endpoint.
    
    Class-based view that delegates to serializer for validation
    and model method for authentication business logic.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        """Handle POST request for user login."""
        serializer = UserLoginSerializer(data=request.data)
        
        if serializer.is_valid():
            # Serializer validates and gets user using model's authenticate_user()
            user = serializer.validated_data['user']
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            # Return standardized success response
            user_serializer = UserSerializer(user)
            return success_response(
                data={
                    'user': user_serializer.data,
                    'tokens': {
                        'refresh': str(refresh),
                        'access': str(refresh.access_token),
                    }
                },
                message='Login successful.'
            )
        
        # Return standardized error response
        return error_response(
            message='Login failed. Please check your credentials.',
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )


class LogoutView(APIView):
    """
    User logout endpoint.
    
    Class-based view that blacklists the refresh token to invalidate the session.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Handle POST request for user logout."""
        try:
            refresh_token = request.data.get('refresh_token')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
                return success_response(
                    message='Logout successful.'
                )
            else:
                return error_response(
                    message='Refresh token is required.',
                    status_code=status.HTTP_400_BAD_REQUEST
                )
        except Exception as e:
            return error_response(
                message='Invalid token.',
                status_code=status.HTTP_400_BAD_REQUEST
            )


class UserProfileView(APIView):
    """
    Get and update current user profile.
    
    Class-based view that returns and updates authenticated user's information.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Handle GET request for user profile."""
        serializer = UserSerializer(request.user)
        return success_response(
            data={'user': serializer.data},
            message='Profile retrieved successfully.'
        )
    
    def put(self, request):
        """Handle PUT request to update user profile."""
        serializer = UserUpdateSerializer(request.user, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            user_serializer = UserSerializer(request.user)
            return success_response(
                data={'user': user_serializer.data},
                message='Profile updated successfully.'
            )
        
        return error_response(
            message='Profile update failed. Please check your information.',
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )


class PasswordChangeView(APIView):
    """
    Change user password endpoint.
    
    Class-based view that handles password change.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Handle POST request to change password."""
        serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            serializer.save()
            return success_response(
                message='Password changed successfully.'
            )
        
        return error_response(
            message='Password change failed. Please check your information.',
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )
