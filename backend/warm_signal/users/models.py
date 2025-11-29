"""
User Model with Business Logic

ARCHITECTURE NOTE:
==================
This project follows Django best practices where:
- Business logic is handled in models (methods, managers, properties)
- Serializers handle data validation and transformation
- Views are CLASS-BASED and contain minimal code, primarily delegating to models and serializers
- All API responses follow a standardized structure (see utils.py)
- This ensures separation of concerns and makes code more maintainable and testable
"""

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError


class User(AbstractUser):
    """
    Custom User model extending AbstractUser.
    
    Business logic methods are defined here to keep views minimal.
    All user-related operations should be handled through model methods.
    """
    
    def __str__(self):
        return self.email or self.username
    
    def clean(self):
        """Validate user data before saving."""
        super().clean()
        if self.email:
            self.email = self.email.lower().strip()
    
    def save(self, *args, **kwargs):
        """Override save to ensure email is normalized."""
        self.full_clean()
        if self.email:
            self.email = self.email.lower().strip()
        super().save(*args, **kwargs)
    
    @classmethod
    def create_user_with_email(cls, email, password, first_name=None, last_name=None, **extra_fields):
        """
        Business logic: Create a new user with email authentication.
        
        This method encapsulates the user creation logic, ensuring:
        - Email is normalized
        - Username is set from email if not provided
        - User is created with proper defaults
        
        Args:
            email: User's email address (required)
            password: User's password (required)
            first_name: User's first name (optional)
            last_name: User's last name (optional)
            **extra_fields: Additional user fields
        
        Returns:
            User instance
        
        Raises:
            ValidationError: If email is invalid or user already exists
        """
        email = email.lower().strip() if email else None
        
        if not email:
            raise ValidationError("Email is required")
        
        # Check if user with this email already exists
        if cls.objects.filter(email=email).exists():
            raise ValidationError("A user with this email already exists.")
        
        # Set username from email if not provided
        if not extra_fields.get('username'):
            extra_fields['username'] = email
        
        user = cls(
            email=email,
            first_name=first_name or '',
            last_name=last_name or '',
            **extra_fields
        )
        user.set_password(password)
        user.save()
        return user
    
    def authenticate_user(self, password):
        """
        Business logic: Authenticate user with password.
        
        Args:
            password: Plain text password to check
        
        Returns:
            bool: True if password is correct, False otherwise
        """
        return self.check_password(password) and self.is_active