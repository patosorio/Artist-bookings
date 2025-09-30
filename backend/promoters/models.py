import uuid
from django.db import models
from django.core.validators import MinValueValidator
from django_countries.fields import CountryField
from agencies.models import Agency, UserProfile
from config.models import TimestampedModel


class Promoter(TimestampedModel):
    """Model representing promoters/event organizers."""
    
    class PromoterType(models.TextChoices):
        FESTIVAL = 'festival', 'Festival'
        CLUB = 'club', 'Club'
        VENUE = 'venue', 'Venue'
        AGENCY = 'agency', 'Agency'
        PRIVATE = 'private', 'Private'
        CORPORATE = 'corporate', 'Corporate'
    
    # UUID primary key for cross-app references
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Agency relationship for multitenancy
    agency = models.ForeignKey(
        Agency,
        on_delete=models.CASCADE,
        related_name='promoters',
        help_text='The agency that manages this promoter'
    )
    
    # Basic information
    promoter_name = models.CharField(max_length=255)
    promoter_email = models.EmailField(blank=True, null=True)
    promoter_phone = models.CharField(max_length=50, blank=True)
    
    # Company information
    company_name = models.CharField(max_length=255)
    company_address = models.TextField(blank=True)
    company_city = models.CharField(max_length=100, blank=True)
    company_zipcode = models.CharField(max_length=20, blank=True)
    company_country = CountryField(blank=True, null=True)
    
    # Business details
    promoter_type = models.CharField(
        max_length=20,
        choices=PromoterType.choices,
        default=PromoterType.CLUB
    )
    tax_id = models.CharField(max_length=50, blank=True)
    website = models.URLField(blank=True)
    notes = models.TextField(blank=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    
    # Audit fields
    created_by = models.ForeignKey(
        UserProfile,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_promoters'
    )
    updated_by = models.ForeignKey(
        UserProfile,
        on_delete=models.SET_NULL,
        null=True,
        related_name='updated_promoters'
    )
    
    class Meta:
        indexes = [
            models.Index(fields=['agency', 'promoter_name']),
            models.Index(fields=['agency', 'company_name']),
            models.Index(fields=['agency', 'promoter_type']),
            models.Index(fields=['is_active']),
            models.Index(fields=['created_at']),
        ]
        ordering = ['company_name', 'promoter_name']
        unique_together = ['agency', 'promoter_email']
        verbose_name = 'Promoter'
        verbose_name_plural = 'Promoters'
    
    def __str__(self):
        if self.company_name and self.promoter_name:
            return f"{self.company_name} - {self.promoter_name}"
        return self.company_name or self.promoter_name