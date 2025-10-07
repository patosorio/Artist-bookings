from django.db import models
from decimal import Decimal
from typing import Optional
from django.core.validators import MinValueValidator, RegexValidator
from django_countries.fields import CountryField
from agencies.models import Agency, UserProfile
from config.models import TimestampedModel


class Artist(TimestampedModel):
    """Model representing an artist entity."""

    class ArtistType(models.TextChoices):
        DJ = 'DJ', 'DJ'
        BAND = 'BAND', 'Band'
        MUSICIAN = 'MUSICIAN', 'Musician'
        PRODUCER = 'PRODUCER', 'Producer'
        PAINTER = 'PAINTER', 'Painter'
        OTHER = 'OTHER', 'Other'

    class Status(models.TextChoices):
        ACTIVE = 'active', 'Active'
        INACTIVE = 'inactive', 'Inactive'

    # Agency relationship for multitenancy
    agency = models.ForeignKey(
        Agency,
        on_delete=models.CASCADE,
        related_name='artists',
        help_text='The agency that manages this artist'
    )

    # Basic information
    artist_name = models.CharField(max_length=255)
    artist_type = models.CharField(
        max_length=20,
        choices=ArtistType.choices,
        default=ArtistType.OTHER
    )
    country = CountryField(blank=True, null=True)
    number_of_members = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
        default=1
    )

    # Contact information
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    bio = models.TextField(blank=True)

    # Visual customization
    color = models.CharField(
        max_length=7,
        default='#3B82F6',
        validators=[
            RegexValidator(
                regex=r'^#[0-9A-Fa-f]{6}$',
                message='Color must be a valid hex color code (e.g., #FF5733)',
            )
        ],
        help_text='Hex color code for calendar and table visualization (e.g., #FF5733)'
    )

    # Status
    is_active = models.BooleanField(default=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE
    )

    # Relationships
    created_by = models.ForeignKey(
        UserProfile,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_artists'
    )
    updated_by = models.ForeignKey(
        UserProfile,
        on_delete=models.SET_NULL,
        null=True,
        related_name='updated_artists'
    )

    class Meta:
        indexes = [
            models.Index(fields=['agency', 'status']),
            models.Index(fields=['agency', 'artist_name']),
            models.Index(fields=['agency', 'artist_type']),
            models.Index(fields=['is_active']),
        ]
        ordering = ['artist_name']
        unique_together = ['agency', 'email']

    def __str__(self) -> str:
        return f"{self.artist_name} ({self.agency.name})"

    @property
    def is_onboarded(self) -> bool:
        """Check if the artist has completed onboarding."""
        return bool(
            self.members.exists() and
            all(member.is_onboarded for member in self.members.all())
        )


class ArtistSocialLinks(TimestampedModel):
    """Model for storing artist social media links."""
    
    artist = models.OneToOneField(
        Artist,
        on_delete=models.CASCADE,
        related_name='social_links'
    )
    instagram_url = models.URLField(blank=True)
    soundcloud_url = models.URLField(blank=True)
    youtube_url = models.URLField(blank=True)
    bandcamp_url = models.URLField(blank=True)

    class Meta:
        verbose_name = 'Artist Social Links'
        verbose_name_plural = 'Artist Social Links'

    def __str__(self) -> str:
        return f"Social links for {self.artist.artist_name}"


class ArtistMember(TimestampedModel):
    """Model representing individual members of an artist entity."""

    class PaymentMethod(models.TextChoices):
        BANK_TRANSFER = 'BANK_TRANSFER', 'Bank Transfer'
        PAYPAL = 'PAYPAL', 'PayPal'
        CRYPTO = 'CRYPTO', 'Crypto'
        OTHER = 'OTHER', 'Other'

    # Relationships
    artist = models.ForeignKey(
        Artist,
        on_delete=models.CASCADE,
        related_name='members'
    )
    agency = models.ForeignKey(
        Agency,
        on_delete=models.CASCADE,
        help_text='The agency this member belongs to (for additional security)'
    )

    # Personal Information
    passport_name = models.CharField(max_length=255)
    residential_address = models.CharField(max_length=500)
    country_of_residence = CountryField()
    dob = models.DateField(verbose_name='Date of Birth')
    passport_number = models.CharField(max_length=50)
    passport_expiry = models.DateField()

    # Financial Information
    artist_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    has_withholding = models.BooleanField(default=False)
    withholding_percentage = models.PositiveIntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(0)]
    )
    payment_method = models.CharField(
        max_length=20,
        choices=PaymentMethod.choices,
        default=PaymentMethod.BANK_TRANSFER
    )
    bank_beneficiary = models.CharField(max_length=255, blank=True)
    bank_account_number = models.CharField(max_length=50, blank=True)
    bank_address = models.TextField(blank=True)
    bank_swift_code = models.CharField(max_length=50, blank=True)

    # Logistics Information
    flight_affiliate_program = models.CharField(max_length=100, blank=True)
    country_of_departure = CountryField()

    class Meta:
        verbose_name = 'Artist Member'
        verbose_name_plural = 'Artist Members'
        indexes = [
            models.Index(fields=['agency', 'artist']),
            models.Index(fields=['passport_number']),
            models.Index(fields=['country_of_residence']),
        ]
        ordering = ['passport_name']

    def __str__(self) -> str:
        return f"{self.passport_name} - Member of {self.artist.artist_name}"

    def save(self, *args, **kwargs) -> None:
        """Ensure member's agency matches artist's agency."""
        if not self.agency_id:
            self.agency = self.artist.agency
        elif self.agency != self.artist.agency:
            raise ValueError("Member's agency must match artist's agency")
        super().save(*args, **kwargs)

    @property
    def is_onboarded(self) -> bool:
        """Check if the member has completed onboarding."""
        required_fields = [
            self.passport_name,
            self.residential_address,
            self.country_of_residence,
            self.dob,
            self.passport_number,
            self.passport_expiry,
            self.artist_fee,
            self.country_of_departure
        ]
        return all(bool(field) for field in required_fields)


class ArtistNote(TimestampedModel):
    """Model for storing notes related to artists."""

    class NoteColor(models.TextChoices):
        YELLOW = 'yellow', 'Yellow'
        BLUE = 'blue', 'Blue'
        GREEN = 'green', 'Green'
        PINK = 'pink', 'Pink'
        PURPLE = 'purple', 'Purple'

    # Relationships
    artist = models.ForeignKey(
        Artist,
        on_delete=models.CASCADE,
        related_name='notes'
    )
    agency = models.ForeignKey(
        Agency,
        on_delete=models.CASCADE,
        help_text='The agency this note belongs to (for additional security)'
    )
    created_by = models.ForeignKey(
        UserProfile,
        on_delete=models.SET_NULL,
        null=True,
        related_name='artist_notes'
    )

    # Note content
    content = models.TextField()
    color = models.CharField(
        max_length=20,
        choices=NoteColor.choices,
        default=NoteColor.YELLOW
    )

    class Meta:
        verbose_name = 'Artist Note'
        verbose_name_plural = 'Artist Notes'
        indexes = [
            models.Index(fields=['agency', 'artist']),
            models.Index(fields=['created_at']),
        ]
        ordering = ['-created_at']

    def __str__(self) -> str:
        creator_name = 'Unknown'
        if self.created_by and self.created_by.user:
            creator_name = self.created_by.user.get_full_name() or self.created_by.user.username
        return f"Note for {self.artist.artist_name} by {creator_name}"

    def save(self, *args, **kwargs) -> None:
        """Ensure note's agency matches artist's agency."""
        if not self.agency_id:
            self.agency = self.artist.agency
        elif self.agency != self.artist.agency:
            raise ValueError("Note's agency must match artist's agency")
        super().save(*args, **kwargs)
