# bookings/serializers.py

from rest_framework import serializers
from decimal import Decimal
from django.utils import timezone
from .models import Booking, BookingType


class BookingTypeSerializer(serializers.ModelSerializer):
    """Serializer for BookingType model."""
    
    class Meta:
        model = BookingType
        fields = [
            'id',
            'agency',
            'name',
            'description',
            'is_active',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate(self, data):
        """Ensure booking type name is unique within agency."""
        agency = data.get('agency')
        name = data.get('name')
        
        if self.instance:
            # Update case - exclude current instance
            if BookingType.objects.filter(
                agency=agency,
                name=name
            ).exclude(id=self.instance.id).exists():
                raise serializers.ValidationError({
                    'name': 'A booking type with this name already exists for this agency.'
                })
        else:
            # Create case
            if BookingType.objects.filter(agency=agency, name=name).exists():
                raise serializers.ValidationError({
                    'name': 'A booking type with this name already exists for this agency.'
                })
        
        return data


class BookingListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing bookings."""
    
    artist_name = serializers.SerializerMethodField()
    promoter_name = serializers.SerializerMethodField()
    venue_name = serializers.SerializerMethodField()
    total_artist_fee = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        read_only=True
    )
    days_until_event = serializers.IntegerField(read_only=True)
    completion_percentage = serializers.FloatField(read_only=True)
    
    class Meta:
        model = Booking
        fields = [
            'id',
            'booking_reference',
            'booking_date',
            'status',
            'location_city',
            'location_country',
            'artist_id',
            'artist_name',
            'promoter_id',
            'promoter_name',
            'venue_id',
            'venue_name',
            'event_name',
            'guarantee_amount',
            'bonus_amount',
            'total_artist_fee',
            'currency',
            'contract_status',
            'artist_fee_invoice_status',
            'booking_fee_invoice_status',
            'is_cancelled',
            'days_until_event',
            'completion_percentage',
            'created_at',
            'updated_at'
        ]
    
    def get_artist_name(self, obj):
        """Get artist name from related model."""
        artist = obj.get_artist()
        return artist.artist_name if artist else 'Unknown Artist'
    
    def get_promoter_name(self, obj):
        """Get promoter name from related model."""
        promoter = obj.get_promoter()
        return promoter.promoter_name if promoter else 'Unknown Promoter'
    
    def get_venue_name(self, obj):
        """Get venue name from related model."""
        venue = obj.get_venue()
        return venue.venue_name if venue else 'Unknown Venue'


class BookingDetailSerializer(serializers.ModelSerializer):
    """Comprehensive serializer for booking details."""
    
    # Computed fields
    total_artist_fee = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        read_only=True
    )
    total_booking_cost = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        read_only=True
    )
    is_confirmed = serializers.BooleanField(read_only=True)
    days_until_event = serializers.IntegerField(read_only=True)
    contract_is_complete = serializers.BooleanField(read_only=True)
    all_invoices_paid = serializers.BooleanField(read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    completion_percentage = serializers.FloatField(read_only=True)
    
    # Related object names
    artist_name = serializers.SerializerMethodField()
    promoter_name = serializers.SerializerMethodField()
    venue_name = serializers.SerializerMethodField()
    promoter_contact_name = serializers.SerializerMethodField()
    booking_type_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Booking
        fields = '__all__'
        read_only_fields = [
            'id',
            'booking_reference',
            'created_at',
            'updated_at',
            'created_by',
            'updated_by'
        ]
    
    def get_artist_name(self, obj):
        """Get artist name."""
        artist = obj.get_artist()
        return artist.artist_name if artist else None
    
    def get_promoter_name(self, obj):
        """Get promoter name."""
        promoter = obj.get_promoter()
        return promoter.promoter_name if promoter else None
    
    def get_venue_name(self, obj):
        """Get venue name."""
        venue = obj.get_venue()
        return venue.venue_name if venue else None
    
    def get_promoter_contact_name(self, obj):
        """Get promoter contact name."""
        contact = obj.get_promoter_contact()
        if contact:
            return f"{contact.first_name} {contact.last_name}".strip()
        return None
    
    def get_booking_type_name(self, obj):
        """Get booking type name."""
        return obj.booking_type.name if obj.booking_type else None
    
    def validate_booking_date(self, value):
        """Ensure booking date is not in the past for new bookings."""
        if not self.instance and value < timezone.now():
            raise serializers.ValidationError(
                "Booking date cannot be in the past."
            )
        return value
    
    def validate_guarantee_amount(self, value):
        """Validate guarantee amount is positive."""
        if value < Decimal('0.00'):
            raise serializers.ValidationError(
                "Guarantee amount must be positive."
            )
        return value
    
    def validate_venue_capacity(self, value):
        """Validate venue capacity is positive."""
        if value < 1:
            raise serializers.ValidationError(
                "Venue capacity must be at least 1."
            )
        return value
    
    def validate(self, data):
        """Cross-field validation."""
        # Validate percentage fields are within valid ranges
        if 'percentage_split' in data and data['percentage_split'] is not None:
            if not (0 <= data['percentage_split'] <= 100):
                raise serializers.ValidationError({
                    'percentage_split': 'Percentage must be between 0 and 100.'
                })
        
        if 'door_percentage' in data and data['door_percentage'] is not None:
            if not (0 <= data['door_percentage'] <= 100):
                raise serializers.ValidationError({
                    'door_percentage': 'Door percentage must be between 0 and 100.'
                })
        
        if 'booking_fee_percentage' in data and data['booking_fee_percentage'] is not None:
            if not (0 <= data['booking_fee_percentage'] <= 100):
                raise serializers.ValidationError({
                    'booking_fee_percentage': 'Booking fee percentage must be between 0 and 100.'
                })
        
        # Validate invoice date logic
        if data.get('artist_fee_invoice_paid_date'):
            if not data.get('artist_fee_invoice_sent_date'):
                raise serializers.ValidationError({
                    'artist_fee_invoice_paid_date': 
                    'Cannot mark as paid without sent date.'
                })
        
        if data.get('booking_fee_invoice_paid_date'):
            if not data.get('booking_fee_invoice_sent_date'):
                raise serializers.ValidationError({
                    'booking_fee_invoice_paid_date': 
                    'Cannot mark as paid without sent date.'
                })
        
        # Validate contract logic
        if data.get('contract_signed_date'):
            if not data.get('contract_sent_date'):
                raise serializers.ValidationError({
                    'contract_signed_date': 
                    'Cannot mark as signed without sent date.'
                })
        
        # Validate cancellation logic
        if data.get('is_cancelled') and not data.get('cancellation_reason'):
            raise serializers.ValidationError({
                'cancellation_reason': 
                'Cancellation reason is required when marking booking as cancelled.'
            })
        
        return data


class BookingCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating bookings with validation."""
    
    class Meta:
        model = Booking
        fields = [
            'id',
            'agency',
            'booking_date',
            'status',
            'location_city',
            'location_country',
            'venue_id',
            'venue_capacity',
            'currency',
            'deal_type',
            'guarantee_amount',
            'bonus_amount',
            'expenses_amount',
            'percentage_split',
            'door_percentage',
            'artist_id',
            'promoter_id',
            'promoter_contact_id',
            'booking_type',
            'event_name',
            'show_schedule',
            'doors_time',
            'soundcheck_time',
            'performance_start_time',
            'performance_end_time',
            'technical_requirements',
            'hospitality_requirements',
            'travel_requirements',
            'notes',
            'is_private',
            'booking_fee_percentage',
            'booking_fee_amount'
        ]
        read_only_fields = ['id']
    
    def validate(self, data):
        """Validate related entities exist and belong to the same agency."""
        agency = data.get('agency')
        
        # Validate artist exists and belongs to agency
        try:
            from artists.models import Artist
            if not Artist.objects.filter(
                id=data['artist_id'],
                agency=agency
            ).exists():
                raise serializers.ValidationError({
                    'artist_id': 'Artist not found or does not belong to this agency.'
                })
        except ImportError:
            pass
        
        # Validate promoter exists and belongs to agency
        try:
            from promoters.models import Promoter
            if not Promoter.objects.filter(
                id=data['promoter_id'],
                agency=agency
            ).exists():
                raise serializers.ValidationError({
                    'promoter_id': 'Promoter not found or does not belong to this agency.'
                })
        except ImportError:
            pass
        
        # Validate venue exists and belongs to agency
        try:
            from venues.models import Venue
            if not Venue.objects.filter(
                id=data['venue_id'],
                agency=agency
            ).exists():
                raise serializers.ValidationError({
                    'venue_id': 'Venue not found or does not belong to this agency.'
                })
        except ImportError:
            pass
        
        # Validate promoter contact if provided
        if data.get('promoter_contact_id'):
            try:
                from contacts.models import Contact
                if not Contact.objects.filter(
                    id=data['promoter_contact_id'],
                    agency=agency,
                    promoter_id=data['promoter_id']
                ).exists():
                    raise serializers.ValidationError({
                        'promoter_contact_id': 
                        'Contact not found or does not belong to this promoter.'
                    })
            except ImportError:
                pass
        
        return data
    
    def create(self, validated_data):
        """Create booking with user tracking."""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['created_by'] = request.user.profile
            validated_data['updated_by'] = request.user.profile
        
        return super().create(validated_data)


class BookingUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating bookings."""
    
    class Meta:
        model = Booking
        fields = [
            'booking_date',
            'status',
            'location_city',
            'location_country',
            'venue_capacity',
            'currency',
            'deal_type',
            'guarantee_amount',
            'bonus_amount',
            'expenses_amount',
            'percentage_split',
            'door_percentage',
            'booking_type',
            'event_name',
            'show_schedule',
            'doors_time',
            'soundcheck_time',
            'performance_start_time',
            'performance_end_time',
            'contract_status',
            'contract_sent_date',
            'contract_signed_date',
            'artist_fee_invoice_status',
            'artist_fee_invoice_sent_date',
            'artist_fee_invoice_due_date',
            'artist_fee_invoice_paid_date',
            'booking_fee_invoice_status',
            'booking_fee_invoice_sent_date',
            'booking_fee_invoice_due_date',
            'booking_fee_invoice_paid_date',
            'booking_fee_percentage',
            'booking_fee_amount',
            'itinerary_status',
            'technical_requirements',
            'hospitality_requirements',
            'travel_requirements',
            'notes',
            'is_private',
            'is_cancelled',
            'cancellation_reason',
            'cancellation_date'
        ]
    
    def update(self, instance, validated_data):
        """Update booking with user tracking."""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['updated_by'] = request.user.profile
        
        # Auto-set cancellation date if marking as cancelled
        if validated_data.get('is_cancelled') and not instance.is_cancelled:
            validated_data['cancellation_date'] = timezone.now()
        
        return super().update(instance, validated_data)


class BookingStatsSerializer(serializers.Serializer):
    """Serializer for booking statistics."""
    
    total_bookings = serializers.IntegerField()
    confirmed_bookings = serializers.IntegerField()
    pending_bookings = serializers.IntegerField()
    cancelled_bookings = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_booking_fees = serializers.DecimalField(max_digits=15, decimal_places=2)
    overdue_invoices = serializers.IntegerField()
    upcoming_shows = serializers.IntegerField()
    contracts_pending = serializers.IntegerField()
    avg_guarantee = serializers.DecimalField(max_digits=12, decimal_places=2)


class BookingFinancialBreakdownSerializer(serializers.Serializer):
    """Detailed financial breakdown for the booking detail page."""
    
    guarantee_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    bonus_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    expenses_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    booking_fee_percentage = serializers.DecimalField(max_digits=5, decimal_places=2, allow_null=True)
    booking_fee_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_artist_fee = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_booking_cost = serializers.DecimalField(max_digits=12, decimal_places=2)
    currency = serializers.CharField()
    deal_type = serializers.CharField()
    percentage_split = serializers.DecimalField(max_digits=5, decimal_places=2, allow_null=True)
    door_percentage = serializers.DecimalField(max_digits=5, decimal_places=2, allow_null=True)


class BookingEventScheduleSerializer(serializers.Serializer):
    """Event timing and schedule details."""
    
    doors_time = serializers.TimeField(allow_null=True)
    soundcheck_time = serializers.TimeField(allow_null=True)
    performance_start_time = serializers.TimeField(allow_null=True)
    performance_end_time = serializers.TimeField(allow_null=True)
    show_schedule = serializers.CharField(allow_blank=True)


class BookingContractStatusSerializer(serializers.Serializer):
    """Contract and invoice status summary."""
    
    contract_status = serializers.CharField()
    contract_sent_date = serializers.DateTimeField(allow_null=True)
    contract_signed_date = serializers.DateTimeField(allow_null=True)
    
    artist_fee_invoice_status = serializers.CharField()
    artist_fee_invoice_sent_date = serializers.DateTimeField(allow_null=True)
    artist_fee_invoice_due_date = serializers.DateField(allow_null=True)
    artist_fee_invoice_paid_date = serializers.DateTimeField(allow_null=True)
    
    booking_fee_invoice_status = serializers.CharField()
    booking_fee_invoice_sent_date = serializers.DateTimeField(allow_null=True)
    booking_fee_invoice_due_date = serializers.DateField(allow_null=True)
    booking_fee_invoice_paid_date = serializers.DateTimeField(allow_null=True)


class BookingRequirementsSerializer(serializers.Serializer):
    """Technical, hospitality, and travel requirements."""
    
    technical_requirements = serializers.CharField(allow_blank=True)
    hospitality_requirements = serializers.CharField(allow_blank=True)
    travel_requirements = serializers.CharField(allow_blank=True)


class BookingProgressSerializer(serializers.Serializer):
    """Progress tracking for booking completion."""
    
    completion_percentage = serializers.FloatField()
    is_confirmed = serializers.BooleanField()
    contract_is_complete = serializers.BooleanField()
    all_invoices_paid = serializers.BooleanField()
    is_overdue = serializers.BooleanField()
    days_until_event = serializers.IntegerField(allow_null=True)
    
    # Checklist items
    contract_signed = serializers.BooleanField()
    promoter_invoice_sent = serializers.BooleanField()
    promoter_invoice_paid = serializers.BooleanField()
    artist_invoice_created = serializers.BooleanField()
    artist_invoice_paid = serializers.BooleanField()


class EnrichedBookingDetailSerializer(serializers.ModelSerializer):
    """
    Comprehensive booking detail serializer optimized for the frontend detail page.
    Includes all nested data structures the UI needs.
    """
    
    # Related entity names
    artist_name = serializers.SerializerMethodField()
    promoter_name = serializers.SerializerMethodField()
    venue_name = serializers.SerializerMethodField()
    promoter_contact_name = serializers.SerializerMethodField()
    booking_type_name = serializers.SerializerMethodField()
    
    # Nested data structures
    financial_breakdown = serializers.SerializerMethodField()
    event_schedule = serializers.SerializerMethodField()
    contract_status_summary = serializers.SerializerMethodField()
    requirements = serializers.SerializerMethodField()
    progress = serializers.SerializerMethodField()
    
    # Location details
    location = serializers.SerializerMethodField()
    
    class Meta:
        model = Booking
        fields = [
            'id',
            'booking_reference',
            'status',
            'booking_date',
            
            # Related entities
            'artist_id',
            'artist_name',
            'promoter_id',
            'promoter_name',
            'promoter_contact_id',
            'promoter_contact_name',
            'venue_id',
            'venue_name',
            'booking_type',
            'booking_type_name',
            
            # Location
            'location',
            
            # Nested structures
            'financial_breakdown',
            'event_schedule',
            'contract_status_summary',
            'requirements',
            'progress',
            
            # Event details
            'event_name',
            'notes',
            'is_private',
            'is_cancelled',
            'cancellation_reason',
            'cancellation_date',
            
            # Audit
            'created_at',
            'updated_at',
            'created_by',
            'updated_by',
        ]
    
    def get_artist_name(self, obj):
        artist = obj.get_artist()
        return artist.artist_name if artist else 'Unknown Artist'
    
    def get_promoter_name(self, obj):
        promoter = obj.get_promoter()
        return promoter.promoter_name if promoter else 'Unknown Promoter'
    
    def get_venue_name(self, obj):
        venue = obj.get_venue()
        return venue.venue_name if venue else 'Unknown Venue'
    
    def get_promoter_contact_name(self, obj):
        contact = obj.get_promoter_contact()
        if contact:
            return f"{contact.first_name} {contact.last_name}".strip()
        return None
    
    def get_booking_type_name(self, obj):
        return obj.booking_type.name if obj.booking_type else None
    
    def get_location(self, obj):
        return {
            'city': obj.location_city,
            'country': obj.location_country.code,
            'country_name': obj.location_country.name,
        }
    
    def get_financial_breakdown(self, obj):
        return {
            'guarantee_amount': obj.guarantee_amount,
            'bonus_amount': obj.bonus_amount,
            'expenses_amount': obj.expenses_amount,
            'booking_fee_percentage': obj.booking_fee_percentage,
            'booking_fee_amount': obj.booking_fee_amount,
            'total_artist_fee': obj.total_artist_fee,
            'total_booking_cost': obj.total_booking_cost,
            'currency': obj.currency,
            'deal_type': obj.deal_type,
            'percentage_split': obj.percentage_split,
            'door_percentage': obj.door_percentage,
        }
    
    def get_event_schedule(self, obj):
        return {
            'doors_time': obj.doors_time,
            'soundcheck_time': obj.soundcheck_time,
            'performance_start_time': obj.performance_start_time,
            'performance_end_time': obj.performance_end_time,
            'show_schedule': obj.show_schedule,
        }
    
    def get_contract_status_summary(self, obj):
        return {
            'contract_status': obj.contract_status,
            'contract_sent_date': obj.contract_sent_date,
            'contract_signed_date': obj.contract_signed_date,
            'artist_fee_invoice_status': obj.artist_fee_invoice_status,
            'artist_fee_invoice_sent_date': obj.artist_fee_invoice_sent_date,
            'artist_fee_invoice_due_date': obj.artist_fee_invoice_due_date,
            'artist_fee_invoice_paid_date': obj.artist_fee_invoice_paid_date,
            'booking_fee_invoice_status': obj.booking_fee_invoice_status,
            'booking_fee_invoice_sent_date': obj.booking_fee_invoice_sent_date,
            'booking_fee_invoice_due_date': obj.booking_fee_invoice_due_date,
            'booking_fee_invoice_paid_date': obj.booking_fee_invoice_paid_date,
        }
    
    def get_requirements(self, obj):
        return {
            'technical_requirements': obj.technical_requirements,
            'hospitality_requirements': obj.hospitality_requirements,
            'travel_requirements': obj.travel_requirements,
        }
    
    def get_progress(self, obj):
        return {
            'completion_percentage': obj.completion_percentage,
            'is_confirmed': obj.is_confirmed,
            'contract_is_complete': obj.contract_is_complete,
            'all_invoices_paid': obj.all_invoices_paid,
            'is_overdue': obj.is_overdue,
            'days_until_event': obj.days_until_event,
            
            # Checklist items for UI
            'contract_signed': obj.contract_status == Booking.ContractStatus.SIGNED,
            'promoter_invoice_sent': obj.booking_fee_invoice_status in [
                Booking.InvoiceStatus.SENT,
                Booking.InvoiceStatus.PAID
            ],
            'promoter_invoice_paid': obj.booking_fee_invoice_status == Booking.InvoiceStatus.PAID,
            'artist_invoice_created': obj.artist_fee_invoice_status != Booking.InvoiceStatus.PENDING,
            'artist_invoice_paid': obj.artist_fee_invoice_status == Booking.InvoiceStatus.PAID,
        }