from django.contrib import admin
from .models import Agency, AgencyBusinessDetails, AgencySettings, UserProfile


@admin.register(Agency)
class AgencyAdmin(admin.ModelAdmin):
    list_display = ['name', 'owner', 'country', 'timezone', 'is_set_up', 'created_at']
    list_filter = ['is_set_up', 'country', 'created_at']
    search_fields = ['name', 'owner__email', 'contact_email']
    readonly_fields = ['slug', 'created_at', 'updated_at']


@admin.register(AgencyBusinessDetails)
class AgencyBusinessDetailsAdmin(admin.ModelAdmin):
    list_display = ['agency', 'company_name', 'country', 'city']
    list_filter = ['country']
    search_fields = ['company_name', 'tax_number', 'agency__name']


@admin.register(AgencySettings)
class AgencySettingsAdmin(admin.ModelAdmin):
    list_display = ['agency', 'currency', 'language', 'notifications_enabled']
    list_filter = ['currency', 'language', 'notifications_enabled']
    search_fields = ['agency__name']


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'agency', 'role', 'is_active', 'created_at']
    list_filter = ['role', 'is_active', 'created_at']
    search_fields = ['user__email', 'agency__name']
    readonly_fields = ['created_at', 'updated_at']
