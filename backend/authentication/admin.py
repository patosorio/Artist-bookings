from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    fieldsets = BaseUserAdmin.fieldsets + (
        ("Firebase Info", {"fields": ("firebase_uid", "is_email_verified")}),
    )
    list_display = ("username", "email", "is_email_verified", "firebase_uid", "is_staff")
    search_fields = ("email", "firebase_uid", "username")