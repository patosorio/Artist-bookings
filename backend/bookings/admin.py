from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from django import forms
from .models import Booking, BookingType


@admin.register(BookingType)
class BookingTypeAdmin(admin.ModelAdmin):
    """Admin interface for BookingType model."""
    
    list_display = [
        'name',
        'agency',
        'is_active',
        'created_at',
        'updated_at'
    ]
    list_filter = ['is_active', 'agency', 'created_at']
    search_fields = ['name', 'description']
    ordering = ['agency', 'name']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('agency', 'name', 'description', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']


class BookingAdminForm(forms.ModelForm):
    """Custom form for Booking admin with searchable dropdowns."""
    
    artist = forms.ModelChoiceField(
        queryset=None,
        required=True,
        label='Artist',
        help_text='Select the artist performing'
    )
    venue = forms.ModelChoiceField(
        queryset=None,
        required=True,
        label='Venue',
        help_text='Select the venue'
    )
    promoter = forms.ModelChoiceField(
        queryset=None,
        required=True,
        label='Promoter',
        help_text='Select the promoter organizing the event'
    )
    promoter_contact = forms.ModelChoiceField(
        queryset=None,
        required=False,
        label='Promoter Contact',
        help_text='Select the specific contact for this booking'
    )
    
    class Meta:
        model = Booking
        fields = '__all__'
    
    def __init__(self, *args, **kwargs):
        # Extract request from kwargs if provided
        self.request = kwargs.pop('request', None)
        super().__init__(*args, **kwargs)
        
        # Import models here to avoid circular imports
        from artists.models import Artist
        from venues.models import Venue
        from promoters.models import Promoter
        from contacts.models import Contact
        
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
            self.fields['artist'].queryset = Artist.objects.filter(agency=agency).order_by('artist_name')
            self.fields['venue'].queryset = Venue.objects.filter(agency=agency).order_by('venue_name')
            self.fields['promoter'].queryset = Promoter.objects.filter(agency=agency).order_by('promoter_name')
            self.fields['promoter_contact'].queryset = Contact.objects.filter(agency=agency).order_by('contact_name')
        else:
            self.fields['artist'].queryset = Artist.objects.none()
            self.fields['venue'].queryset = Venue.objects.none()
            self.fields['promoter'].queryset = Promoter.objects.none()
            self.fields['promoter_contact'].queryset = Contact.objects.none()
        
        # Pre-populate fields if editing existing booking
        if self.instance and self.instance.pk:
            if self.instance.artist_id:
                try:
                    self.fields['artist'].initial = Artist.objects.get(
                        id=self.instance.artist_id,
                        agency=agency
                    )
                except (Artist.DoesNotExist, ValueError):
                    # ValueError handles invalid UUID format
                    pass
            
            if self.instance.venue_id:
                try:
                    self.fields['venue'].initial = Venue.objects.get(
                        id=self.instance.venue_id,
                        agency=agency
                    )
                except (Venue.DoesNotExist, ValueError):
                    pass
            
            if self.instance.promoter_id:
                try:
                    self.fields['promoter'].initial = Promoter.objects.get(
                        id=self.instance.promoter_id,
                        agency=agency
                    )
                except (Promoter.DoesNotExist, ValueError):
                    pass
            
            if self.instance.promoter_contact_id:
                try:
                    self.fields['promoter_contact'].initial = Contact.objects.get(
                        id=self.instance.promoter_contact_id,
                        agency=agency
                    )
                except (Contact.DoesNotExist, ValueError):
                    pass
        
        # Hide the original CharField fields
        if 'artist_id' in self.fields:
            self.fields['artist_id'].widget = forms.HiddenInput()
        if 'venue_id' in self.fields:
            self.fields['venue_id'].widget = forms.HiddenInput()
        if 'promoter_id' in self.fields:
            self.fields['promoter_id'].widget = forms.HiddenInput()
        if 'promoter_contact_id' in self.fields:
            self.fields['promoter_contact_id'].widget = forms.HiddenInput()
    
    def clean(self):
        cleaned_data = super().clean()
        
        # Convert model instances to UUIDs for storage
        artist = cleaned_data.get('artist')
        if artist:
            cleaned_data['artist_id'] = str(artist.id)
        
        venue = cleaned_data.get('venue')
        if venue:
            cleaned_data['venue_id'] = str(venue.id)
            # Auto-populate venue capacity from selected venue
            cleaned_data['venue_capacity'] = venue.capacity
        
        promoter = cleaned_data.get('promoter')
        if promoter:
            cleaned_data['promoter_id'] = str(promoter.id)
        
        promoter_contact = cleaned_data.get('promoter_contact')
        if promoter_contact:
            cleaned_data['promoter_contact_id'] = str(promoter_contact.id)
        
        return cleaned_data
    
    def save(self, commit=True):
        instance = super().save(commit=False)
        
        # Ensure the UUID fields are set
        if hasattr(self, 'cleaned_data'):
            if 'artist_id' in self.cleaned_data:
                instance.artist_id = self.cleaned_data['artist_id']
            if 'venue_id' in self.cleaned_data:
                instance.venue_id = self.cleaned_data['venue_id']
            if 'venue_capacity' in self.cleaned_data:
                instance.venue_capacity = self.cleaned_data['venue_capacity']
            if 'promoter_id' in self.cleaned_data:
                instance.promoter_id = self.cleaned_data['promoter_id']
            if 'promoter_contact_id' in self.cleaned_data and self.cleaned_data['promoter_contact_id']:
                instance.promoter_contact_id = self.cleaned_data['promoter_contact_id']
        
        if commit:
            instance.save()
        return instance


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    """Admin interface for Booking model."""
    
    form = BookingAdminForm
    
    list_display = [
        'booking_reference',
        'booking_date',
        'status_badge',
        'artist_display',
        'promoter_display',
        'venue_display',
        'location_display',
        'guarantee_amount',
        'currency',
        'contract_status_badge',
        'completion_bar'
    ]
    
    list_filter = [
        'status',
        'contract_status',
        'artist_fee_invoice_status',
        'booking_fee_invoice_status',
        'is_cancelled',
        'is_private',
        'deal_type',
        'location_country',
        'agency',
        'booking_date'
    ]
    
    search_fields = [
        'booking_reference',
        'event_name',
        'location_city',
        'artist_id',
        'promoter_id',
        'venue_id',
        'notes'
    ]
    
    date_hierarchy = 'booking_date'
    
    ordering = ['-booking_date']
    
    readonly_fields = [
        'id',
        'booking_reference',
        'total_artist_fee_display',
        'total_booking_cost_display',
        'days_until_event_display',
        'completion_percentage_display',
        'created_at',
        'updated_at',
        'created_by',
        'updated_by'
    ]
    
    fieldsets = (
        ('Booking Information', {
            'fields': (
                'id',
                'booking_reference',
                'agency',
                'booking_date',
                'status',
                'booking_type',
                'event_name',
                'is_private',
                'is_cancelled',
                'cancellation_reason',
                'cancellation_date'
            )
        }),
        ('Location & Venue', {
            'fields': (
                'location_city',
                'location_country',
                'venue',
                'venue_capacity'
            )
        }),
        ('Relationships', {
            'fields': (
                'artist',
                'promoter',
                'promoter_contact'
            )
        }),
        ('Financial Details', {
            'fields': (
                'currency',
                'deal_type',
                'guarantee_amount',
                'bonus_amount',
                'expenses_amount',
                'booking_fee_amount',
                'percentage_split',
                'door_percentage',
                'total_artist_fee_display',
                'total_booking_cost_display'
            )
        }),
        ('Event Schedule', {
            'fields': (
                'show_schedule',
                'doors_time',
                'soundcheck_time',
                'performance_start_time',
                'performance_end_time'
            ),
            'classes': ('collapse',)
        }),
        ('Contract Management', {
            'fields': (
                'contract_status',
                'contract_sent_date',
                'contract_signed_date'
            )
        }),
        ('Artist Fee Invoice', {
            'fields': (
                'artist_fee_invoice_status',
                'artist_fee_invoice_sent_date',
                'artist_fee_invoice_due_date',
                'artist_fee_invoice_paid_date'
            )
        }),
        ('Booking Fee Invoice', {
            'fields': (
                'booking_fee_invoice_status',
                'booking_fee_invoice_sent_date',
                'booking_fee_invoice_due_date',
                'booking_fee_invoice_paid_date'
            )
        }),
        ('Itinerary', {
            'fields': ('itinerary_status',),
            'classes': ('collapse',)
        }),
        ('Requirements', {
            'fields': (
                'technical_requirements',
                'hospitality_requirements',
                'travel_requirements'
            ),
            'classes': ('collapse',)
        }),
        ('Notes', {
            'fields': ('notes',),
            'classes': ('collapse',)
        }),
        ('Metrics', {
            'fields': (
                'days_until_event_display',
                'completion_percentage_display'
            ),
            'classes': ('collapse',)
        }),
        ('Audit Information', {
            'fields': (
                'created_at',
                'created_by',
                'updated_at',
                'updated_by'
            ),
            'classes': ('collapse',)
        }),
    )
    
    # Custom display methods
    
    def status_badge(self, obj):
        """Display status as colored badge."""
        colors = {
            'block': '#6c757d',
            'confirmed': '#28a745',
            'hold': '#ffc107',
            'off': '#dc3545',
            'option': '#17a2b8',
            'pending': '#fd7e14',
            'private': '#6f42c1',
            'cancelled': '#343a40',
            'completed': '#20c997'
        }
        color = colors.get(obj.status, '#6c757d')
        return format_html(
            '<span style="background-color: {}; color: white; '
            'padding: 3px 8px; border-radius: 3px; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = 'Status'
    
    def contract_status_badge(self, obj):
        """Display contract status as colored badge."""
        colors = {
            'pending': '#ffc107',
            'sent': '#17a2b8',
            'signed': '#28a745',
            'cancelled': '#dc3545'
        }
        color = colors.get(obj.contract_status, '#6c757d')
        return format_html(
            '<span style="background-color: {}; color: white; '
            'padding: 3px 8px; border-radius: 3px;">{}</span>',
            color,
            obj.get_contract_status_display()
        )
    contract_status_badge.short_description = 'Contract'
    
    def artist_display(self, obj):
        """Display artist name with link."""
        try:
            artist = obj.get_artist()
            if artist:
                return format_html(
                    '<a href="{}">{}</a>',
                    reverse('admin:artists_artist_change', args=[artist.id]),
                    artist.name
                )
            return format_html(
                '<span style="color: #999;">ID: {}</span>',
                obj.artist_id[:8] if obj.artist_id else 'N/A'
            )
        except Exception as e:
            return format_html(
                '<span style="color: #dc3545;">Invalid: {}</span>',
                obj.artist_id[:20] if obj.artist_id else 'N/A'
            )
    artist_display.short_description = 'Artist'
    
    def promoter_display(self, obj):
        """Display promoter name with link."""
        try:
            promoter = obj.get_promoter()
            if promoter:
                return format_html(
                    '<a href="{}">{}</a>',
                    reverse('admin:promoters_promoter_change', args=[promoter.id]),
                    promoter.name
                )
            return format_html(
                '<span style="color: #999;">ID: {}</span>',
                obj.promoter_id[:8] if obj.promoter_id else 'N/A'
            )
        except Exception as e:
            return format_html(
                '<span style="color: #dc3545;">Invalid: {}</span>',
                obj.promoter_id[:20] if obj.promoter_id else 'N/A'
            )
    promoter_display.short_description = 'Promoter'
    
    def venue_display(self, obj):
        """Display venue name with link."""
        try:
            venue = obj.get_venue()
            if venue:
                return format_html(
                    '<a href="{}">{}</a>',
                    reverse('admin:venues_venue_change', args=[venue.id]),
                    venue.name
                )
            return format_html(
                '<span style="color: #999;">ID: {}</span>',
                obj.venue_id[:8] if obj.venue_id else 'N/A'
            )
        except Exception as e:
            return format_html(
                '<span style="color: #dc3545;">Invalid: {}</span>',
                obj.venue_id[:20] if obj.venue_id else 'N/A'
            )
    venue_display.short_description = 'Venue'
    
    def location_display(self, obj):
        """Display location with flag."""
        return f"{obj.location_city}, {obj.location_country.name}"
    location_display.short_description = 'Location'
    
    def completion_bar(self, obj):
        """Display completion percentage as progress bar."""
        try:
            percentage = obj.completion_percentage
            color = '#28a745' if percentage == 100 else '#17a2b8' if percentage >= 75 else '#ffc107' if percentage >= 50 else '#dc3545'
            return format_html(
                '<div style="width: 100px; background-color: #e9ecef; border-radius: 3px; overflow: hidden;">'
                '<div style="width: {}%; background-color: {}; color: white; '
                'text-align: center; padding: 2px 0; font-size: 11px;">{}%</div>'
                '</div>',
                int(percentage),
                color,
                int(percentage)
            )
        except:
            return format_html('<span style="color: #999;">N/A</span>')
    completion_bar.short_description = 'Progress'
    
    def total_artist_fee_display(self, obj):
        """Display total artist fee."""
        try:
            return f"{obj.currency} {obj.total_artist_fee:,.2f}"
        except:
            return "N/A"
    total_artist_fee_display.short_description = 'Total Artist Fee'
    
    def total_booking_cost_display(self, obj):
        """Display total booking cost."""
        try:
            return f"{obj.currency} {obj.total_booking_cost:,.2f}"
        except:
            return "N/A"
    total_booking_cost_display.short_description = 'Total Booking Cost'
    
    def days_until_event_display(self, obj):
        """Display days until event."""
        days = obj.days_until_event
        if days is None:
            return '-'
        if days < 0:
            return format_html(
                '<span style="color: #999;">{} days ago</span>',
                abs(days)
            )
        elif days == 0:
            return format_html('<span style="color: #dc3545; font-weight: bold;">TODAY</span>')
        elif days <= 7:
            return format_html(
                '<span style="color: #dc3545; font-weight: bold;">{} days</span>',
                days
            )
        elif days <= 30:
            return format_html('<span style="color: #ffc107;">{} days</span>', days)
        else:
            return f'{days} days'
    days_until_event_display.short_description = 'Days Until Event'
    
    def completion_percentage_display(self, obj):
        """Display completion percentage."""
        return f"{obj.completion_percentage:.1f}%"
    completion_percentage_display.short_description = 'Completion'
    
    # Actions
    
    actions = [
        'mark_as_confirmed',
        'mark_as_cancelled',
        'send_contracts',
        'mark_contracts_signed'
    ]
    
    def mark_as_confirmed(self, request, queryset):
        """Mark selected bookings as confirmed."""
        updated = queryset.update(status=Booking.BookingStatus.CONFIRMED)
        self.message_user(request, f'{updated} booking(s) marked as confirmed.')
    mark_as_confirmed.short_description = 'Mark selected as Confirmed'
    
    def mark_as_cancelled(self, request, queryset):
        """Mark selected bookings as cancelled."""
        updated = queryset.update(
            status=Booking.BookingStatus.CANCELLED,
            is_cancelled=True
        )
        self.message_user(request, f'{updated} booking(s) marked as cancelled.')
    mark_as_cancelled.short_description = 'Mark selected as Cancelled'
    
    def send_contracts(self, request, queryset):
        """Mark contracts as sent."""
        from django.utils import timezone
        updated = queryset.update(
            contract_status=Booking.ContractStatus.SENT,
            contract_sent_date=timezone.now()
        )
        self.message_user(request, f'{updated} contract(s) marked as sent.')
    send_contracts.short_description = 'Mark contracts as Sent'
    
    def mark_contracts_signed(self, request, queryset):
        """Mark contracts as signed."""
        from django.utils import timezone
        updated = queryset.filter(
            contract_status=Booking.ContractStatus.SENT
        ).update(
            contract_status=Booking.ContractStatus.SIGNED,
            contract_signed_date=timezone.now()
        )
        self.message_user(request, f'{updated} contract(s) marked as signed.')
    mark_contracts_signed.short_description = 'Mark contracts as Signed'
    
    def get_form(self, request, obj=None, **kwargs):
        """Pass request to form so it can access user's agency."""
        form = super().get_form(request, obj, **kwargs)
        
        class FormWithRequest(form):
            def __new__(cls, *args, **kwargs):
                kwargs['request'] = request
                return form(*args, **kwargs)
        
        return FormWithRequest