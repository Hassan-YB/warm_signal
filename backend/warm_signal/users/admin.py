"""
Django Admin configuration for User model.

Provides a comprehensive admin interface for managing users with:
- Custom list display and filters
- Search functionality
- Organized fieldsets
- Bulk actions
- User-friendly interface
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe

from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Admin interface for User model.
    
    Extends Django's built-in UserAdmin with customizations
    for the custom User model.
    """
    
    # List display configuration
    list_display = (
        'email',
        'username',
        'full_name',
        'is_active',
        'is_staff',
        'is_superuser',
        'date_joined',
        'last_login',
    )
    
    list_filter = (
        'is_active',
        'is_staff',
        'is_superuser',
        'date_joined',
        'last_login',
    )
    
    search_fields = (
        'email',
        'username',
        'first_name',
        'last_name',
    )
    
    ordering = ('-date_joined',)
    
    # Fieldsets for add/edit forms
    fieldsets = (
        ('Authentication', {
            'fields': ('username', 'email', 'password')
        }),
        ('Personal Information', {
            'fields': ('first_name', 'last_name')
        }),
        ('Permissions', {
            'fields': (
                'is_active',
                'is_staff',
                'is_superuser',
                'groups',
                'user_permissions',
            ),
        }),
        ('Important Dates', {
            'fields': ('last_login', 'date_joined')
        }),
    )
    
    # Fieldsets for add form
    add_fieldsets = (
        ('Authentication', {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2'),
        }),
        ('Personal Information', {
            'classes': ('wide',),
            'fields': ('first_name', 'last_name'),
        }),
    )
    
    readonly_fields = ('date_joined', 'last_login')
    
    # Actions
    actions = ['activate_users', 'deactivate_users', 'make_staff', 'remove_staff']
    
    def full_name(self, obj):
        """Display user's full name."""
        if obj.first_name or obj.last_name:
            return f"{obj.first_name} {obj.last_name}".strip()
        return "-"
    full_name.short_description = "Full Name"
    
    @admin.action(description='Activate selected users')
    def activate_users(self, request, queryset):
        """Bulk action to activate users."""
        updated = queryset.update(is_active=True)
        self.message_user(
            request,
            f'{updated} user(s) were successfully activated.'
        )
    
    @admin.action(description='Deactivate selected users')
    def deactivate_users(self, request, queryset):
        """Bulk action to deactivate users."""
        updated = queryset.update(is_active=False)
        self.message_user(
            request,
            f'{updated} user(s) were successfully deactivated.'
        )
    
    @admin.action(description='Make selected users staff')
    def make_staff(self, request, queryset):
        """Bulk action to make users staff."""
        updated = queryset.update(is_staff=True)
        self.message_user(
            request,
            f'{updated} user(s) were successfully made staff.'
        )
    
    @admin.action(description='Remove staff status from selected users')
    def remove_staff(self, request, queryset):
        """Bulk action to remove staff status."""
        # Prevent removing staff status from superusers
        non_superusers = queryset.filter(is_superuser=False)
        updated = non_superusers.update(is_staff=False)
        self.message_user(
            request,
            f'{updated} user(s) had staff status removed. Superusers were skipped.'
        )
    
    def get_queryset(self, request):
        """Optimize queryset by selecting related fields."""
        qs = super().get_queryset(request)
        return qs.select_related()
