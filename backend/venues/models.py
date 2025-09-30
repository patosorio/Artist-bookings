# venues/models.py

import uuid
from django.db import models
from django.core.validators import MinValueValidator
from django_countries.fields import CountryField
from agencies.models import Agency, UserProfile
from config.models import TimestampedModel


class Venue(TimestampedModel):
    """Model representing venues."""
    
    class VenueType(models.TextChoices):
        CLUB = 'club', 'Club'
        FESTIVAL = 'festival', 'Festival'
        THEATER = 'theater', 'Theater'
        ARENA = 'arena', 'Arena'
        STADIUM = 'stadium', 'Stadium'
        BAR = 'bar', 'Bar'
        PRIVATE = 'private', 'Private'
        OUTDOOR = 'outdoor', 'Outdoor'
        CONFERENCE = 'conference', 'Conference Center'
        WAREHOUSE = 'warehouse', 'Warehouse'
    
    # UUID primary key for cross-app references
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Agency relationship for multitenancy
    agency = models.ForeignKey(
        Agency,
        on_delete=models.CASCADE,
        related_name='venues',
        help_text='The agency that manages this venue'
    )
    
    # Basic venue information
    venue_name = models.CharField(max_length=255)
    venue_address = models.TextField()
    venue_city = models.CharField(max_length=100)
    venue_zipcode = models.CharField(max_length=20, blank=True)
    venue_country = CountryField()
    
    # Venue details
    venue_type = models.CharField(
        max_length=20,
        choices=VenueType.choices,
        default=VenueType.CLUB
    )
    capacity = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
        help_text='Maximum capacity of the venue'
    )
    
    # Technical information
    tech_specs = models.TextField(blank=True, help_text="Technical specifications and equipment")
    stage_dimensions = models.CharField(max_length=100, blank=True, help_text="Stage size (e.g., '12m x 8m')")
    sound_system = models.CharField(max_length=255, blank=True)
    lighting_system = models.CharField(max_length=255, blank=True)
    has_parking = models.BooleanField(default=False, help_text="Venue has parking available")
    has_catering = models.BooleanField(default=False, help_text="Venue provides catering services")
    is_accessible = models.BooleanField(default=False, help_text="Venue is wheelchair accessible")
    
    # Contact information (primary contact)
    contact_name = models.CharField(max_length=255, blank=True)
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=50, blank=True)
    
    # Business information
    company_name = models.CharField(max_length=255, blank=True, help_text="Operating company name")
    company_address = models.TextField(blank=True, help_text="Company billing address")
    company_city = models.CharField(max_length=100, blank=True)
    company_zipcode = models.CharField(max_length=20, blank=True)
    company_country = CountryField(blank=True, null=True)
    
    # Additional info
    website = models.URLField(blank=True)
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    
    # Audit fields
    created_by = models.ForeignKey(
        UserProfile,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_venues'
    )
    updated_by = models.ForeignKey(
        UserProfile,
        on_delete=models.SET_NULL,
        null=True,
        related_name='updated_venues'
    )
    
    class Meta:
        indexes = [
            models.Index(fields=['agency', 'venue_name']),
            models.Index(fields=['agency', 'venue_city']),
            models.Index(fields=['agency', 'venue_type']),
            models.Index(fields=['agency', 'capacity']),
            models.Index(fields=['is_active']),
            models.Index(fields=['created_at']),
        ]
        ordering = ['venue_name']
        unique_together = ['agency', 'venue_name', 'venue_city']
        verbose_name = 'Venue'
        verbose_name_plural = 'Venues'
    
    def __str__(self):
        return f"{self.venue_name} - {self.venue_city}"