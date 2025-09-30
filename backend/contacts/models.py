# contacts/models.py

import uuid
from django.db import models
from django.core.validators import validate_email
from django_countries.fields import CountryField
from agencies.models import Agency, UserProfile
from config.models import TimestampedModel


class Contact(TimestampedModel):
    """
    Model for managing contacts related to promoters, venues, or standalone agency contacts.
    
    This model uses a flexible approach to link contacts to different entities:
    - Promoter contacts (people working for/with promoters)
    - Venue contacts (people working for/with venues)  
    - Agency contacts (accountants, lawyers, etc. who work with the agency directly)
    """
    
    class ContactType(models.TextChoices):
        # General contact types
        MANAGER = 'manager', 'Manager'
        BOOKING_AGENT = 'booking_agent', 'Booking Agent'
        OWNER = 'owner', 'Owner'
        ASSISTANT = 'assistant', 'Assistant'
        
        # Venue-specific contacts
        VENUE_MANAGER = 'venue_manager', 'Venue Manager'
        TECH_CONTACT = 'tech_contact', 'Technical Contact'
        PRODUCTION = 'production', 'Production Manager'
        SECURITY = 'security', 'Security Manager'
        CATERING_MANAGER = 'catering_manager', 'Catering Manager'
        
        # Promoter-specific contacts
        PROMOTER_MANAGER = 'promoter_manager', 'Promoter Manager'
        EVENT_COORDINATOR = 'event_coordinator', 'Event Coordinator'
        MARKETING = 'marketing', 'Marketing Manager'
        LOGISTICS = 'logistics', 'Logistics Coordinator'
        
        # Agency-specific contacts  
        ACCOUNTANT = 'accountant', 'Accountant'
        LAWYER = 'lawyer', 'Lawyer'
        INSURANCE_AGENT = 'insurance_agent', 'Insurance Agent'
        BANK_CONTACT = 'bank_contact', 'Bank Contact'
        VENDOR = 'vendor', 'Vendor/Supplier'
        CONSULTANT = 'consultant', 'Consultant'
        
        # Generic
        OTHER = 'other', 'Other'
    
    class ReferenceType(models.TextChoices):
        PROMOTER = 'promoter', 'Promoter Contact'
        VENUE = 'venue', 'Venue Contact'
        AGENCY = 'agency', 'Agency Contact'
    
    # UUID primary key for cross-app references
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Agency relationship for multitenancy
    agency = models.ForeignKey(
        Agency,
        on_delete=models.CASCADE,
        related_name='contacts',
        help_text='The agency that manages this contact'
    )
    
    # Basic contact information
    contact_name = models.CharField(max_length=255)
    contact_email = models.EmailField(validators=[validate_email])
    contact_phone = models.CharField(max_length=50, blank=True)
    
    # Contact details
    contact_type = models.CharField(
        max_length=30,
        choices=ContactType.choices,
        default=ContactType.OTHER
    )
    job_title = models.CharField(max_length=100, blank=True, help_text="Specific job title (e.g., 'Head of Security')")
    department = models.CharField(max_length=100, blank=True, help_text="Department or division")
    
    # Reference system - what this contact is related to
    reference_type = models.CharField(
        max_length=20,
        choices=ReferenceType.choices,
        help_text='What type of entity this contact is associated with'
    )
    
    # Foreign key references using UUID strings to avoid circular imports
    promoter_id = models.CharField(
        max_length=36, 
        blank=True, 
        null=True, 
        help_text="UUID of related promoter (if reference_type is 'promoter')"
    )
    venue_id = models.CharField(
        max_length=36, 
        blank=True, 
        null=True, 
        help_text="UUID of related venue (if reference_type is 'venue')"
    )
    
    # Contact preferences and details
    preferred_contact_method = models.CharField(
        max_length=20,
        choices=[
            ('email', 'Email'),
            ('phone', 'Phone'),
            ('whatsapp', 'WhatsApp'),
            ('text', 'Text/SMS'),
        ],
        default='email'
    )
    
    # Additional contact info
    address = models.TextField(blank=True, help_text="Physical address")
    city = models.CharField(max_length=100, blank=True)
    country = CountryField(blank=True, null=True)
    
    # Social/communication channels
    whatsapp = models.CharField(max_length=50, blank=True, help_text="WhatsApp number")
    linkedin = models.URLField(blank=True, help_text="LinkedIn profile URL")
    
    # Relationship info
    is_primary = models.BooleanField(
        default=False, 
        help_text="Primary contact for the associated entity"
    )
    is_emergency = models.BooleanField(
        default=False, 
        help_text="Emergency contact"
    )
    
    # Additional information
    notes = models.TextField(blank=True)
    tags = models.JSONField(
        default=list, 
        blank=True,
        help_text="Flexible tags for categorization (e.g., ['VIP', 'After-hours', 'Technical'])"
    )
    
    # Availability info
    timezone = models.CharField(max_length=50, blank=True)
    working_hours = models.CharField(
        max_length=100, 
        blank=True,
        help_text="e.g., 'Mon-Fri 9AM-5PM EST'"
    )
    
    # Status
    is_active = models.BooleanField(default=True)
    
    # Audit fields
    created_by = models.ForeignKey(
        UserProfile,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_contacts'
    )
    updated_by = models.ForeignKey(
        UserProfile,
        on_delete=models.SET_NULL,
        null=True,
        related_name='updated_contacts'
    )
    
    class Meta:
        indexes = [
            models.Index(fields=['agency', 'contact_name']),
            models.Index(fields=['agency', 'contact_type']),
            models.Index(fields=['agency', 'reference_type']),
            models.Index(fields=['promoter_id']),
            models.Index(fields=['venue_id']),
            models.Index(fields=['is_active']),
            models.Index(fields=['is_primary']),
            models.Index(fields=['created_at']),
        ]
        ordering = ['contact_name']
        unique_together = ['agency', 'contact_email']
        verbose_name = 'Contact'
        verbose_name_plural = 'Contacts'
    
    def __str__(self):
        if self.reference_type == self.ReferenceType.AGENCY:
            return f"{self.contact_name} - {self.get_contact_type_display()} (Agency)"
        elif self.reference_type == self.ReferenceType.PROMOTER:
            return f"{self.contact_name} - Promoter Contact"
        elif self.reference_type == self.ReferenceType.VENUE:
            return f"{self.contact_name} - Venue Contact"
        return self.contact_name
    
    def clean(self):
        """Validate the reference system."""
        from django.core.exceptions import ValidationError
        
        # Ensure reference consistency
        if self.reference_type == self.ReferenceType.PROMOTER:
            if not self.promoter_id:
                raise ValidationError("Promoter ID must be specified for promoter contacts")
            if self.venue_id:
                raise ValidationError("Venue ID should be empty for promoter contacts")
        
        elif self.reference_type == self.ReferenceType.VENUE:
            if not self.venue_id:
                raise ValidationError("Venue ID must be specified for venue contacts")
            if self.promoter_id:
                raise ValidationError("Promoter ID should be empty for venue contacts")
        
        elif self.reference_type == self.ReferenceType.AGENCY:
            if self.promoter_id or self.venue_id:
                raise ValidationError("Agency contacts should not have promoter or venue references")
    
    def save(self, *args, **kwargs):
        """Custom save with validation."""
        # For new instances, exclude updated_by from validation since it's not set yet
        if self._state.adding:
            self.full_clean(exclude=['updated_by'])
        else:
            self.full_clean()
        super().save(*args, **kwargs)
    
    @property
    def reference_display_name(self):
        """Get display name of the referenced entity."""
        if self.reference_type == self.ReferenceType.AGENCY:
            return f"{self.agency.name} (Agency)"
        elif self.reference_type == self.ReferenceType.PROMOTER and self.promoter_id:
            return f"Promoter ({self.promoter_id[:8]}...)"
        elif self.reference_type == self.ReferenceType.VENUE and self.venue_id:
            return f"Venue ({self.venue_id[:8]}...)"
        return "No reference"
    
    @property
    def full_contact_info(self):
        """Get complete contact information."""
        info = []
        if self.contact_email:
            info.append(f"Email: {self.contact_email}")
        if self.contact_phone:
            info.append(f"Phone: {self.contact_phone}")
        if self.whatsapp:
            info.append(f"WhatsApp: {self.whatsapp}")
        return " | ".join(info)
    
    def get_related_entity(self):
        """
        Helper method to get the actual related entity object.
        Returns None if entity doesn't exist or imports fail.
        """
        try:
            if self.reference_type == self.ReferenceType.PROMOTER and self.promoter_id:
                from promoters.models import Promoter
                return Promoter.objects.filter(
                    id=self.promoter_id,
                    agency=self.agency
                ).first()
            
            elif self.reference_type == self.ReferenceType.VENUE and self.venue_id:
                from venues.models import Venue
                return Venue.objects.filter(
                    id=self.venue_id,
                    agency=self.agency
                ).first()
                
            elif self.reference_type == self.ReferenceType.AGENCY:
                return self.agency
                
        except ImportError:
            # If the related app isn't available yet, return None
            pass
        
        return None