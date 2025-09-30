# venues/admin.py

from django.contrib import admin
from django.utils.html import format_html
from .models import Venue


@admin.register(Venue)
class VenueAdmin(admin.ModelAdmin):
    """Django admin configuration for Venue model."""
    
    list_display = [
        'venue_name', 'venue_city', 'venue_type', 'get_capacity_display',
        'contact_name', 'get_features_display', 'is_active', 'created_at'
    ]
    list_filter = [
        'venue_type', 'venue_country', 'is_active', 'has_parking', 
        'has_catering', 'is_accessible', 'created_at'
    ]
    search_fields = [
        'venue_name', 'venue_city', 'venue_address', 'contact_name', 'contact_email'
    ]
    readonly_fields = [
        'id', 'created_at', 'updated_at', 'created_by', 'updated_by'
    ]
    
    fieldsets = (
        ('Venue Information', {
            'fields': (
                'venue_name', 'venue_type', 'capacity',
                'venue_address', 'venue_city', 'venue_zipcode', 'venue_country'
            )
        }),
        ('Technical Information', {
            'fields': ('tech_specs', 'stage_dimensions', 'sound_system', 'lighting_system'),
            'classes': ('collapse',)
        }),
        ('Features', {
            'fields': ('has_parking', 'has_catering', 'is_accessible')
        }),
        ('Primary Contact', {
            'fields': ('contact_name', 'contact_email', 'contact_phone')
        }),
        ('Company Information', {
            'fields': (
                'company_name', 'company_address', 'company_city',
                'company_zipcode', 'company_country'
            ),
            'classes': ('collapse',)
        }),
        ('Additional Information', {
            'fields': ('website', 'notes', 'is_active')
        }),
        ('System Information', {
            'fields': ('id', 'agency', 'created_at', 'updated_at', 'created_by', 'updated_by'),
            'classes': ('collapse',)
        })
    )
    
    # Filtering by agency for multi-tenancy
    def get_queryset(self, request):
        """Filter venues by user's agency if not superuser."""
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        
        # For agency users, only show their agency's venues
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
    def get_capacity_display(self, obj):
        """Display capacity with category."""
        if obj.capacity < 500:
            category = "Small"
            color = "#28a745"  # Green
        elif obj.capacity < 2000:
            category = "Medium"
            color = "#ffc107"  # Yellow
        elif obj.capacity < 10000:
            category = "Large"
            color = "#fd7e14"  # Orange
        else:
            category = "Massive"
            color = "#dc3545"  # Red
        
        return format_html(
            '<span style="color: {}; font-weight: bold;">{:,}</span> <small>({})</small>',
            color, obj.capacity, category
        )
    get_capacity_display.short_description = "Capacity"
    get_capacity_display.admin_order_field = "capacity"
    
    def get_features_display(self, obj):
        """Display venue features as icons."""
        features = []
        if obj.has_parking:
            features.append('<span title="Has Parking">🅿️</span>')
        if obj.has_catering:
            features.append('<span title="Has Catering">🍽️</span>')
        if obj.is_accessible:
            features.append('<span title="Wheelchair Accessible">♿</span>')
        
        if features:
            return format_html(" ".join(features))
        return format_html('<small style="color: #6c757d;">No features</small>')
    get_features_display.short_description = "Features"
    
    def get_location_display(self, obj):
        """Display formatted location."""
        location = obj.venue_city
        if obj.venue_country:
            location += f", {obj.venue_country.name}"
        return location
    get_location_display.short_description = "Location"
    
    # Add some useful actions
    actions = [
        'mark_active', 'mark_inactive', 
        'enable_parking', 'disable_parking',
        'enable_catering', 'disable_catering',
        'mark_accessible', 'mark_not_accessible'
    ]
    
    def mark_active(self, request, queryset):
        """Mark selected venues as active."""
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} venues marked as active.')
    mark_active.short_description = "✅ Mark selected venues as active"
    
    def mark_inactive(self, request, queryset):
        """Mark selected venues as inactive."""
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} venues marked as inactive.')
    mark_inactive.short_description = "❌ Mark selected venues as inactive"
    
    def enable_parking(self, request, queryset):
        """Enable parking for selected venues."""
        updated = queryset.update(has_parking=True)
        self.message_user(request, f'{updated} venues updated - parking enabled.')
    enable_parking.short_description = "🅿️ Enable parking for selected venues"
    
    def disable_parking(self, request, queryset):
        """Disable parking for selected venues."""
        updated = queryset.update(has_parking=False)
        self.message_user(request, f'{updated} venues updated - parking disabled.')
    disable_parking.short_description = "🚫 Disable parking for selected venues"
    
    def enable_catering(self, request, queryset):
        """Enable catering for selected venues."""
        updated = queryset.update(has_catering=True)
        self.message_user(request, f'{updated} venues updated - catering enabled.')
    enable_catering.short_description = "🍽️ Enable catering for selected venues"
    
    def disable_catering(self, request, queryset):
        """Disable catering for selected venues."""
        updated = queryset.update(has_catering=False)
        self.message_user(request, f'{updated} venues updated - catering disabled.')
    disable_catering.short_description = "🚫 Disable catering for selected venues"
    
    def mark_accessible(self, request, queryset):
        """Mark selected venues as wheelchair accessible."""
        updated = queryset.update(is_accessible=True)
        self.message_user(request, f'{updated} venues marked as wheelchair accessible.')
    mark_accessible.short_description = "♿ Mark selected venues as accessible"
    
    def mark_not_accessible(self, request, queryset):
        """Mark selected venues as not wheelchair accessible."""
        updated = queryset.update(is_accessible=False)
        self.message_user(request, f'{updated} venues marked as not accessible.')
    mark_not_accessible.short_description = "🚫 Mark selected venues as not accessible"