from django.contrib import admin
from django.utils.html import format_html
from django import forms
from .models import Contact


class ContactAdminForm(forms.ModelForm):
    """Custom form for Contact admin with searchable dropdowns."""
    
    promoter = forms.ModelChoiceField(
        queryset=None,
        required=False,
        label='Promoter',
        help_text='Select the promoter this contact is associated with'
    )
    venue = forms.ModelChoiceField(
        queryset=None,
        required=False,
        label='Venue',
        help_text='Select the venue this contact is associated with'
    )
    
    class Meta:
        model = Contact
        fields = '__all__'
    
    def __init__(self, *args, **kwargs):
        # Extract request from kwargs if provided
        self.request = kwargs.pop('request', None)
        super().__init__(*args, **kwargs)
        
        # Import models here to avoid circular imports
        from promoters.models import Promoter
        from venues.models import Venue
        
        # Get the agency from the instance, initial data, or request user
        agency = None
        if self.instance and self.instance.pk and hasattr(self.instance, 'agency'):
            agency = self.instance.agency
        elif 'agency' in self.initial:
            agency = self.initial['agency']
        elif self.request and hasattr(self.request, 'user') and hasattr(self.request.user, 'userprofile'):
            agency = self.request.user.userprofile.agency
        
        # Set querysets based on agency
        if agency:
            self.fields['promoter'].queryset = Promoter.objects.filter(agency=agency).order_by('promoter_name')
            self.fields['venue'].queryset = Venue.objects.filter(agency=agency).order_by('venue_name')
        else:
            self.fields['promoter'].queryset = Promoter.objects.none()
            self.fields['venue'].queryset = Venue.objects.none()
        
        # Pre-populate fields if editing existing contact
        if self.instance and self.instance.pk:
            if self.instance.promoter_id:
                try:
                    self.fields['promoter'].initial = Promoter.objects.get(
                        id=self.instance.promoter_id,
                        agency=agency
                    )
                except (Promoter.DoesNotExist, ValueError):
                    pass
            
            if self.instance.venue_id:
                try:
                    self.fields['venue'].initial = Venue.objects.get(
                        id=self.instance.venue_id,
                        agency=agency
                    )
                except (Venue.DoesNotExist, ValueError):
                    pass
        
        # Hide the original CharField fields
        if 'promoter_id' in self.fields:
            self.fields['promoter_id'].widget = forms.HiddenInput()
        if 'venue_id' in self.fields:
            self.fields['venue_id'].widget = forms.HiddenInput()
    
    def clean(self):
        cleaned_data = super().clean()
        
        # Convert model instances to UUIDs for storage
        promoter = cleaned_data.get('promoter')
        if promoter:
            cleaned_data['promoter_id'] = str(promoter.id)
        else:
            cleaned_data['promoter_id'] = None
        
        venue = cleaned_data.get('venue')
        if venue:
            cleaned_data['venue_id'] = str(venue.id)
        else:
            cleaned_data['venue_id'] = None
        
        # Validate based on reference type
        reference_type = cleaned_data.get('reference_type')
        
        if reference_type == Contact.ReferenceType.PROMOTER:
            if not cleaned_data.get('promoter_id'):
                raise forms.ValidationError("Please select a promoter for promoter contacts")
            cleaned_data['venue_id'] = None
        elif reference_type == Contact.ReferenceType.VENUE:
            if not cleaned_data.get('venue_id'):
                raise forms.ValidationError("Please select a venue for venue contacts")
            cleaned_data['promoter_id'] = None
        elif reference_type == Contact.ReferenceType.AGENCY:
            cleaned_data['promoter_id'] = None
            cleaned_data['venue_id'] = None
        
        return cleaned_data
    
    def save(self, commit=True):
        instance = super().save(commit=False)
        
        # Ensure the UUID fields are set
        if hasattr(self, 'cleaned_data'):
            instance.promoter_id = self.cleaned_data.get('promoter_id')
            instance.venue_id = self.cleaned_data.get('venue_id')
        
        if commit:
            instance.save()
        return instance


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    """Django admin configuration for Contact model."""
    
    form = ContactAdminForm
    
    list_display = [
        'contact_name', 'contact_email', 'get_reference_display', 
        'contact_type', 'get_contact_status', 'is_primary', 'is_active', 'created_at'
    ]
    list_filter = [
        'contact_type', 'reference_type', 'is_active', 'is_primary', 
        'is_emergency', 'preferred_contact_method', 'created_at'
    ]
    search_fields = [
        'contact_name', 'contact_email', 'job_title', 'notes'
    ]
    readonly_fields = [
        'id', 'reference_display_name', 'full_contact_info',
        'created_at', 'updated_at', 'created_by', 'updated_by'
    ]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('contact_name', 'contact_email', 'contact_phone', 'contact_type', 'job_title', 'department')
        }),
        ('Reference Information', {
            'fields': ('reference_type', 'promoter', 'venue', 'reference_display_name'),
            'description': 'Specify what entity this contact is associated with'
        }),
        ('Contact Preferences', {
            'fields': ('preferred_contact_method', 'whatsapp', 'linkedin'),
            'classes': ('collapse',)
        }),
        ('Location Information', {
            'fields': ('address', 'city', 'country', 'timezone', 'working_hours'),
            'classes': ('collapse',)
        }),
        ('Status & Flags', {
            'fields': ('is_active', 'is_primary', 'is_emergency')
        }),
        ('Additional Information', {
            'fields': ('tags', 'notes'),
            'classes': ('collapse',)
        }),
        ('System Information', {
            'fields': ('id', 'agency', 'full_contact_info', 'created_at', 'updated_at', 'created_by', 'updated_by'),
            'classes': ('collapse',)
        })
    )
    
    # Filtering by agency for multi-tenancy
    def get_queryset(self, request):
        """Filter contacts by user's agency if not superuser."""
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        
        # For agency users, only show their agency's contacts
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
    def get_reference_display(self, obj):
        """Display what entity this contact is related to."""
        if obj.reference_type == Contact.ReferenceType.AGENCY:
            return format_html(
                '<span style="color: #007cba; font-weight: bold;">🏢 Agency</span>'
            )
        elif obj.reference_type == Contact.ReferenceType.PROMOTER:
            related = obj.get_related_entity()
            name = getattr(related, 'company_name', 'Unknown') if related else 'Unknown'
            return format_html(
                '<span style="color: #28a745; font-weight: bold;">🎤 {}</span>',
                name[:20] + ('...' if len(name) > 20 else '')
            )
        elif obj.reference_type == Contact.ReferenceType.VENUE:
            related = obj.get_related_entity()
            name = getattr(related, 'venue_name', 'Unknown') if related else 'Unknown'
            return format_html(
                '<span style="color: #fd7e14; font-weight: bold;">🏟️ {}</span>',
                name[:20] + ('...' if len(name) > 20 else '')
            )
        return obj.get_reference_type_display()
    get_reference_display.short_description = "Associated With"
    
    def get_contact_status(self, obj):
        """Display contact status with icons."""
        status_icons = []
        if obj.is_primary:
            status_icons.append('<span title="Primary Contact">⭐</span>')
        if obj.is_emergency:
            status_icons.append('<span title="Emergency Contact">🚨</span>')
        if obj.whatsapp:
            status_icons.append('<span title="Has WhatsApp">📱</span>')
        if obj.linkedin:
            status_icons.append('<span title="Has LinkedIn">💼</span>')
        
        if status_icons:
            return format_html(' '.join(status_icons))
        return '-'
    get_contact_status.short_description = "Status"
    
    def get_contact_methods(self, obj):
        """Display available contact methods."""
        methods = []
        if obj.contact_email:
            methods.append('📧')
        if obj.contact_phone:
            methods.append('📞')
        if obj.whatsapp:
            methods.append('📱')
        return format_html(' '.join(methods))
    get_contact_methods.short_description = "Contact Methods"
    
    # Add some useful actions
    actions = [
        'mark_active', 'mark_inactive', 'set_as_primary', 'unset_primary',
        'mark_emergency', 'unmark_emergency'
    ]
    
    def mark_active(self, request, queryset):
        """Mark selected contacts as active."""
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} contacts marked as active.')
    mark_active.short_description = "✅ Mark selected contacts as active"
    
    def mark_inactive(self, request, queryset):
        """Mark selected contacts as inactive."""
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} contacts marked as inactive.')
    mark_inactive.short_description = "❌ Mark selected contacts as inactive"
    
    def set_as_primary(self, request, queryset):
        """Set selected contacts as primary (be careful - this could create conflicts)."""
        updated = queryset.update(is_primary=True)
        self.message_user(
            request, 
            f'{updated} contacts set as primary. Note: This may create multiple primary contacts for the same entity.',
            level='warning'
        )
    set_as_primary.short_description = "⭐ Set as primary contact"
    
    def unset_primary(self, request, queryset):
        """Unset primary status for selected contacts."""
        updated = queryset.update(is_primary=False)
        self.message_user(request, f'{updated} contacts removed from primary status.')
    unset_primary.short_description = "⭐ Remove primary status"
    
    def mark_emergency(self, request, queryset):
        """Mark selected contacts as emergency contacts."""
        updated = queryset.update(is_emergency=True)
        self.message_user(request, f'{updated} contacts marked as emergency contacts.')
    mark_emergency.short_description = "🚨 Mark as emergency contact"
    
    def unmark_emergency(self, request, queryset):
        """Remove emergency status from selected contacts."""
        updated = queryset.update(is_emergency=False)
        self.message_user(request, f'{updated} contacts removed from emergency status.')
    unmark_emergency.short_description = "🚨 Remove emergency status"
    
    def get_form(self, request, obj=None, **kwargs):
        """Pass request to form so it can access user's agency."""
        form = super().get_form(request, obj, **kwargs)
        
        class FormWithRequest(form):
            def __new__(cls, *args, **kwargs):
                kwargs['request'] = request
                return form(*args, **kwargs)
        
        return FormWithRequest
