import uuid
from django.db import models
from django.core.validators import MinValueValidator
from django_countries.fields import CountryField
from decimal import Decimal
from datetime import datetime
from agencies.models import Agency, UserProfile
from config.models import TimestampedModel

class BookingType(TimestampedModel):
    """Configurable booking types for flexibility."""
    
    agency = models.ForeignKey(
        Agency,
        on_delete=models.CASCADE,
        related_name='booking_types'
    )
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ['agency', 'name']
        ordering = ['name']
        verbose_name = 'Booking Type'
        verbose_name_plural = 'Booking Types'
    
    def __str__(self):
        return self.name

class Booking(TimestampedModel):
    """
    The central booking model - connects artists, promoters, venues, and contacts.
    This is the heart of the booking management system.
    """
    
    class BookingStatus(models.TextChoices):
        BLOCK = 'block', 'Block'
        CONFIRMED = 'confirmed', 'Confirmed' 
        HOLD = 'hold', 'Hold'
        OFF = 'off', 'Off'
        OPTION = 'option', 'Option'
        PENDING = 'pending', 'Pending'
        PRIVATE = 'private', 'Private'
        CANCELLED = 'cancelled', 'Cancelled'
        COMPLETED = 'completed', 'Completed'
    
    class ContractStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        SENT = 'sent', 'Sent'
        SIGNED = 'signed', 'Signed'
        CANCELLED = 'cancelled', 'Cancelled'
    
    class InvoiceStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        SENT = 'sent', 'Sent'
        PAID = 'paid', 'Paid'
        OVERDUE = 'overdue', 'Overdue'
        CANCELLED = 'cancelled', 'Cancelled'
    
    class ItineraryStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        IN_PROGRESS = 'in_progress', 'In Progress'
        COMPLETED = 'completed', 'Completed'
        CANCELLED = 'cancelled', 'Cancelled'
    
    class DealType(models.TextChoices):
        LANDED = 'landed', 'Landed'
        ALL_IN = 'all_in', 'All In'
        PLUS_PLUS_PLUS = 'plus_plus_plus', '+++'
        VERSUS = 'versus', 'Versus'
        PERCENTAGE = 'percentage', 'Percentage'
        GUARANTEE_VS_PERCENTAGE = 'guarantee_vs_percentage', 'Guarantee vs Percentage'
        DOOR_DEAL = 'door_deal', 'Door Deal'
        OTHER = 'other', 'Other'
    
    # UUID primary key
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Agency relationship for multitenancy
    agency = models.ForeignKey(
        Agency,
        on_delete=models.CASCADE,
        related_name='bookings',
        help_text='The agency managing this booking'
    )
    
    # === CORE BOOKING INFORMATION ===
    
    # Date and timing
    booking_date = models.DateTimeField(help_text='Date and time of the performance')
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=BookingStatus.choices,
        default=BookingStatus.OPTION,
        help_text='Current booking status'
    )
    
    # Location information
    location_city = models.CharField(max_length=100, help_text='City of the event')
    location_country = CountryField(help_text='Country of the event')
    
    # Venue information (using UUID reference to avoid circular imports)
    venue_id = models.CharField(
        max_length=36,
        help_text="UUID of the venue"
    )
    venue_capacity = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
        help_text='Venue capacity (copied from venue for historical record)'
    )
    
    # === FINANCIAL INFORMATION ===
    
    currency = models.CharField(
        max_length=3,
        default='USD',
        help_text='Currency for all financial amounts'
    )
    
    # Deal structure
    deal_type = models.CharField(
        max_length=30,
        choices=DealType.choices,
        default=DealType.ALL_IN,
        help_text='Type of deal structure (landed, +++, all-in, etc.)'
    )
    
    guarantee_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text='Guaranteed fee amount'
    )
    bonus_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text='Additional bonus amount (if applicable)'
    )
    expenses_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text='Estimated expenses amount'
    )
    
    # Additional deal-specific fields
    percentage_split = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        help_text='Percentage split if applicable (e.g., 80.00 for 80%)'
    )
    door_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        help_text='Door percentage if applicable (e.g., 85.00 for 85% of door)'
    )
    
    # === RELATIONSHIP REFERENCES (using UUID strings) ===
    
    # Artist reference
    artist_id = models.CharField(
        max_length=36,
        help_text="UUID of the artist performing"
    )
    
    # Promoter reference
    promoter_id = models.CharField(
        max_length=36,
        help_text="UUID of the promoter organizing the event"
    )
    
    # Promoter contact reference (must be a contact linked to the promoter)
    promoter_contact_id = models.CharField(
        max_length=36,
        blank=True,
        null=True,
        help_text="UUID of the specific promoter contact for this booking"
    )
    
    # === EVENT DETAILS ===
    
    # Booking type
    booking_type = models.ForeignKey(
        BookingType,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='bookings'
    )
    
    # Event name/title
    event_name = models.CharField(
        max_length=255,
        blank=True,
        help_text='Name of the event/show'
    )
    
    # Show schedule and lineup
    show_schedule = models.TextField(
        blank=True,
        help_text='Running orders, lineup, roster, schedule details'
    )
    
    # Performance timing
    doors_time = models.TimeField(
        null=True,
        blank=True,
        help_text='What time doors open'
    )
    soundcheck_time = models.TimeField(
        null=True,
        blank=True,
        help_text='Soundcheck time'
    )
    performance_start_time = models.TimeField(
        null=True,
        blank=True,
        help_text='Performance start time'
    )
    performance_end_time = models.TimeField(
        null=True,
        blank=True,
        help_text='Expected performance end time'
    )
    
    # === MANAGEMENT FIELDS ===
    
    # Contract management
    contract_status = models.CharField(
        max_length=20,
        choices=ContractStatus.choices,
        default=ContractStatus.PENDING,
        help_text='Status of the booking contract'
    )
    contract_sent_date = models.DateTimeField(
        null=True,
        blank=True,
        help_text='When contract was sent'
    )
    contract_signed_date = models.DateTimeField(
        null=True,
        blank=True,
        help_text='When contract was signed'
    )
    
    # Artist fee invoice management
    artist_fee_invoice_status = models.CharField(
        max_length=20,
        choices=InvoiceStatus.choices,
        default=InvoiceStatus.PENDING,
        help_text='Status of invoice TO the artist for their fee'
    )
    artist_fee_invoice_sent_date = models.DateTimeField(
        null=True,
        blank=True,
        help_text='When artist fee invoice was sent'
    )
    artist_fee_invoice_due_date = models.DateField(
        null=True,
        blank=True,
        help_text='When artist fee invoice is due'
    )
    artist_fee_invoice_paid_date = models.DateTimeField(
        null=True,
        blank=True,
        help_text='When artist was paid'
    )
    
    # Booking fee invoice management (agency commission from promoter)
    booking_fee_invoice_status = models.CharField(
        max_length=20,
        choices=InvoiceStatus.choices,
        default=InvoiceStatus.PENDING,
        help_text='Status of invoice FROM agency to promoter for booking fee'
    )
    booking_fee_invoice_sent_date = models.DateTimeField(
        null=True,
        blank=True,
        help_text='When booking fee invoice was sent to promoter'
    )
    booking_fee_invoice_due_date = models.DateField(
        null=True,
        blank=True,
        help_text='When booking fee invoice is due from promoter'
    )
    booking_fee_invoice_paid_date = models.DateTimeField(
        null=True,
        blank=True,
        help_text='When promoter paid booking fee'
    )
    booking_fee_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text='Agency commission/booking fee amount'
    )
    
    # Itinerary management
    itinerary_status = models.CharField(
        max_length=20,
        choices=ItineraryStatus.choices,
        default=ItineraryStatus.PENDING,
        help_text='Status of travel itinerary'
    )
    
    # === ADDITIONAL INFORMATION ===
    
    # Requirements and notes
    technical_requirements = models.TextField(
        blank=True,
        help_text='Technical requirements for the performance'
    )
    hospitality_requirements = models.TextField(
        blank=True,
        help_text='Hospitality and rider requirements'
    )
    travel_requirements = models.TextField(
        blank=True,
        help_text='Travel and accommodation requirements'
    )
    
    # General notes
    notes = models.TextField(
        blank=True,
        help_text='Internal notes about this booking'
    )
    
    # Booking reference number
    booking_reference = models.CharField(
        max_length=50,
        unique=True,
        blank=True,
        help_text='Unique booking reference number'
    )
    
    # Internal flags
    is_private = models.BooleanField(
        default=False,
        help_text='Mark as private booking'
    )
    is_cancelled = models.BooleanField(
        default=False,
        help_text='Whether this booking is cancelled'
    )
    cancellation_reason = models.TextField(
        blank=True,
        help_text='Reason for cancellation if applicable'
    )
    cancellation_date = models.DateTimeField(
        null=True,
        blank=True,
        help_text='When booking was cancelled'
    )
    
    # Audit fields
    created_by = models.ForeignKey(
        UserProfile,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_bookings'
    )
    updated_by = models.ForeignKey(
        UserProfile,
        on_delete=models.SET_NULL,
        null=True,
        related_name='updated_bookings'
    )
    
    class Meta:
        indexes = [
            models.Index(fields=['agency', 'booking_date']),
            models.Index(fields=['agency', 'status']),
            models.Index(fields=['agency', 'artist_id']),
            models.Index(fields=['agency', 'promoter_id']),
            models.Index(fields=['agency', 'venue_id']),
            models.Index(fields=['booking_date', 'status']),
            models.Index(fields=['location_city', 'location_country']),
            models.Index(fields=['contract_status']),
            models.Index(fields=['artist_fee_invoice_status']),
            models.Index(fields=['booking_fee_invoice_status']),
            models.Index(fields=['is_cancelled']),
            models.Index(fields=['created_at']),
        ]
        ordering = ['-booking_date']
        verbose_name = 'Booking'
        verbose_name_plural = 'Bookings'
    
    def __str__(self):
        return f"{self.booking_reference or f'Booking-{str(self.id)[:8]}'} - {self.booking_date.date()}"
    
    def save(self, *args, **kwargs):
        """Generate booking reference if not provided."""
        if not self.booking_reference:
            # Generate a booking reference like: BK-2025-001234
            year = datetime.now().year
            # You might want to implement a more sophisticated numbering system
            self.booking_reference = f"BK-{year}-{str(self.id)[:6].upper()}"
        super().save(*args, **kwargs)
    
    # === COMPUTED PROPERTIES ===
    
    @property
    def total_artist_fee(self):
        """Calculate total artist fee including guarantee and bonus."""
        guarantee = self.guarantee_amount or Decimal('0.00')
        bonus = self.bonus_amount or Decimal('0.00')
        return guarantee + bonus
    
    @property
    def total_booking_cost(self):
        """Calculate total booking cost including all fees and expenses."""
        guarantee = self.guarantee_amount or Decimal('0.00')
        bonus = self.bonus_amount or Decimal('0.00')
        expenses = self.expenses_amount or Decimal('0.00')
        booking_fee = self.booking_fee_amount or Decimal('0.00')
        return guarantee + bonus + expenses + booking_fee
    
    @property
    def is_confirmed(self):
        """Check if booking is confirmed or beyond."""
        return self.status in [
            self.BookingStatus.CONFIRMED,
            self.BookingStatus.COMPLETED
        ]
    
    @property
    def days_until_event(self):
        """Calculate days until the event."""
        if self.booking_date:
            delta = self.booking_date.date() - datetime.now().date()
            return delta.days
        return None
    
    @property
    def contract_is_complete(self):
        """Check if contract process is complete."""
        return self.contract_status == self.ContractStatus.SIGNED
    
    @property
    def all_invoices_paid(self):
        """Check if both artist and booking fee invoices are paid."""
        return (
            self.artist_fee_invoice_status == self.InvoiceStatus.PAID and
            self.booking_fee_invoice_status == self.InvoiceStatus.PAID
        )
    
    @property
    def is_overdue(self):
        """Check if any invoices are overdue."""
        return (
            self.artist_fee_invoice_status == self.InvoiceStatus.OVERDUE or
            self.booking_fee_invoice_status == self.InvoiceStatus.OVERDUE
        )
    
    @property
    def completion_percentage(self):
        """Calculate booking completion percentage based on status of various components."""
        total_components = 4  # booking status, contract, artist invoice, booking invoice
        completed = 0
        
        if self.is_confirmed:
            completed += 1
        if self.contract_is_complete:
            completed += 1
        if self.artist_fee_invoice_status == self.InvoiceStatus.PAID:
            completed += 1
        if self.booking_fee_invoice_status == self.InvoiceStatus.PAID:
            completed += 1
        
        return (completed / total_components) * 100
    
    # === HELPER METHODS FOR CROSS-APP QUERIES ===
    
    def get_artist(self):
        """Get the related artist object safely."""
        try:
            from artists.models import Artist
            return Artist.objects.filter(
                id=self.artist_id,
                agency=self.agency
            ).first()
        except ImportError:
            return None
    
    def get_promoter(self):
        """Get the related promoter object safely."""
        try:
            from promoters.models import Promoter
            return Promoter.objects.filter(
                id=self.promoter_id,
                agency=self.agency
            ).first()
        except ImportError:
            return None
    
    def get_venue(self):
        """Get the related venue object safely."""
        try:
            from venues.models import Venue
            return Venue.objects.filter(
                id=self.venue_id,
                agency=self.agency
            ).first()
        except ImportError:
            return None
    
    def get_promoter_contact(self):
        """Get the related promoter contact safely."""
        if not self.promoter_contact_id:
            return None
        try:
            from contacts.models import Contact
            return Contact.objects.filter(
                id=self.promoter_contact_id,
                agency=self.agency,
                promoter_id=self.promoter_id
            ).first()
        except ImportError:
            return None
