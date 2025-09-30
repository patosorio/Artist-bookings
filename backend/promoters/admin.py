# promoters/admin.py

from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import Promoter


@admin.register(Promoter)
class PromoterAdmin(admin.ModelAdmin):
    """Django admin configuration for Promoter model."""
    
    list_display = [
        'promoter_name', 'company_name', 'promoter_type', 
        'company_city', 'company_country', 'is_active', 'created_at'
    ]
    list_filter = [
        'promoter_type', 'company_country', 'is_active', 'created_at'
    ]
    search_fields = [
        'promoter_name', 'company_name', 'promoter_email', 'company_city'
    ]
    readonly_fields = [
        'id', 'created_at', 'updated_at', 'created_by', 'updated_by'
    ]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('promoter_name', 'promoter_email', 'promoter_phone', 'promoter_type')
        }),
        ('Company Information', {
            'fields': (
                'company_name', 'company_address', 'company_city', 
                'company_zipcode', 'company_country', 'tax_id', 'website'
            )
        }),
        ('Additional Information', {
            'fields': ('notes', 'is_active')
        }),
        ('System Information', {
            'fields': ('id', 'agency', 'created_at', 'updated_at', 'created_by', 'updated_by'),
            'classes': ('collapse',)
        })
    )
    
    # Filtering by agency for multi-tenancy
    def get_queryset(self, request):
        """Filter promoters by user's agency if not superuser."""
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        
        # For agency users, only show their agency's promoters
        if hasattr(request.user, 'userprofile') and request.user.userprofile.agency:
            return qs.filter(agency=request.user.userprofile.agency)
        
        # If no agency association, return empty queryset
        return qs.none()
    
    def save_model(self, request, obj, form, change):
        """Set agency and audit info when saving."""
        if not change:  # Creating new object
            if hasattr(request.user, 'userprofile'):
                obj.agency = request.user.userprofile.agency
                obj.created_by = request.user.userprofile
        
        if hasattr(request.user, 'userprofile'):
            obj.updated_by = request.user.userprofile
        
        super().save_model(request, obj, form, change)
    
    def get_form(self, request, obj=None, **kwargs):
        """Customize form based on user permissions."""
        form = super().get_form(request, obj, **kwargs)
        
        # Hide agency field for non-superusers
        if not request.user.is_superuser:
            if 'agency' in form.base_fields:
                form.base_fields['agency'].widget.attrs['style'] = 'display: none;'
        
        return form
    
    # Custom display methods
    def get_company_info(self, obj):
        """Get formatted company information."""
        if obj.company_city and obj.company_country:
            return f"{obj.company_city}, {obj.company_country}"
        elif obj.company_city:
            return obj.company_city
        elif obj.company_country:
            return str(obj.company_country)
        return "-"
    get_company_info.short_description = "Location"
    
    # Add some useful actions
    actions = ['mark_active', 'mark_inactive']
    
    def mark_active(self, request, queryset):
        """Mark selected promoters as active."""
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} promoters marked as active.')
    mark_active.short_description = "Mark selected promoters as active"
    
    def mark_inactive(self, request, queryset):
        """Mark selected promoters as inactive."""
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} promoters marked as inactive.')
    mark_inactive.short_description = "Mark selected promoters as inactive"