"""
User Serializers for API

ARCHITECTURE NOTE:
==================
Serializers handle:
- Data validation (input/output)
- Data transformation
- Field serialization/deserialization

Business logic should remain in models. Serializers validate and transform data,
then delegate to model methods for actual operations.

All API responses use standardized structure via utils.py (success_response/error_response).
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


class UserSignupSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration/signup.
    
    Handles validation and data transformation for signup.
    Delegates actual user creation to User.create_user_with_email() model method.
    """
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    first_name = serializers.CharField(required=True, max_length=150)
    last_name = serializers.CharField(required=True, max_length=150)
    
    class Meta:
        model = User
        fields = ('email', 'password', 'password_confirm', 'first_name', 'last_name')
        extra_kwargs = {
            'email': {'required': True}
        }
    
    def validate_email(self, value):
        """Validate email format and uniqueness."""
        value = value.lower().strip() if value else None
        if not value:
            raise serializers.ValidationError("Email is required.")
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value
    
    def validate(self, attrs):
        """Validate that passwords match."""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def create(self, validated_data):
        """
        Create user using model's business logic method.
        
        This delegates to User.create_user_with_email() which contains
        all the business logic for user creation.
        """
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        # Use model method for business logic
        user = User.create_user_with_email(
            email=validated_data['email'],
            password=password,
            first_name=validated_data.get('first_name'),
            last_name=validated_data.get('last_name')
        )
        return user


class UserLoginSerializer(serializers.Serializer):
    """
    Serializer for user login/authentication.
    
    Validates login credentials and delegates authentication
    to model's authenticate_user() method.
    """
    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    
    def validate_email(self, value):
        """Normalize email."""
        return value.lower().strip() if value else None
    
    def validate(self, attrs):
        """Validate credentials using model's business logic."""
        email = attrs.get('email')
        password = attrs.get('password')
        
        if not email or not password:
            raise serializers.ValidationError("Email and password are required.")
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid email or password.")
        
        # Use model method for authentication business logic
        if not user.authenticate_user(password):
            raise serializers.ValidationError("Invalid email or password.")
        
        if not user.is_active:
            raise serializers.ValidationError("User account is disabled.")
        
        attrs['user'] = user
        return attrs


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for user data representation.
    
    Used for returning user information in API responses.
    """
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'date_joined', 'is_active')
        read_only_fields = ('id', 'date_joined', 'is_active')


class UserUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating user profile information.
    
    Allows updating first_name, last_name, and email.
    """
    email = serializers.EmailField(required=False)
    
    class Meta:
        model = User
        fields = ('email', 'first_name', 'last_name')
    
    def validate_email(self, value):
        """Validate email format and uniqueness."""
        value = value.lower().strip() if value else None
        if value and User.objects.filter(email=value).exclude(pk=self.instance.pk).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value
    
    def update(self, instance, validated_data):
        """Update user profile information."""
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class PasswordChangeSerializer(serializers.Serializer):
    """
    Serializer for changing user password.
    
    Validates old password and sets new password.
    """
    old_password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    new_password_confirm = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    
    def validate_old_password(self, value):
        """Validate that old password is correct."""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value
    
    def validate(self, attrs):
        """Validate that new passwords match."""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({"new_password": "New password fields didn't match."})
        return attrs
    
    def save(self):
        """Update user password."""
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user

