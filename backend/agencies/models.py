from django.db import models
from django_countries.fields import CountryField
from django.utils.text import slugify
from authentication.models import User


class Agency(models.Model):
    name = models.CharField(max_length=255)
    owner = models.OneToOneField(User, on_delete=models.CASCADE, related_name="owned_agency")
    
    country = CountryField()
    timezone = models.CharField(max_length=50)

    website = models.URLField(blank=True, null=True)
    contact_email = models.EmailField(blank=True, null=True)
    phone_number = models.CharField(max_length=50, blank=True, null=True)

    logo = models.ImageField(upload_to="agency_logos/", blank=True, null=True)
    slug = models.SlugField(unique=True, blank=True, db_index=True)

    is_set_up = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Agencies"
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return self.name


class AgencyBusinessDetails(models.Model):
    agency = models.OneToOneField(
        Agency,
        on_delete=models.CASCADE,
        related_name="business_details",
        primary_key=True
    )
    company_name = models.CharField(max_length=255, blank=True, null=True)
    tax_number = models.CharField(max_length=100, blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    town = models.CharField(max_length=100, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    country = CountryField(blank=True, null=True)

    class Meta:
        verbose_name_plural = "Agency business details"


class AgencySettings(models.Model):
    agency = models.OneToOneField(
        Agency,
        on_delete=models.CASCADE,
        related_name="agency_settings",
        primary_key=True
    )
    currency = models.CharField(max_length=10, default="EUR")
    language = models.CharField(max_length=10, default="en")
    notifications_enabled = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = "Agency settings"

    def __str__(self):
        return f"Settings for {self.agency.name}"


class UserProfile(models.Model):
    ROLE_CHOICES = [
        ("agency_owner", "Agency Owner"),
        ("agency_manager", "Agency Manager"),
        ("agency_agent", "Agency Agent"),
        ("agency_assistant", "Agency Assistant"),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    agency = models.ForeignKey(Agency, on_delete=models.CASCADE, related_name="users")
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="agency_assistant")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "User profiles"
        indexes = [
            models.Index(fields=['agency', 'role']),
            models.Index(fields=['is_active'])
        ]

    def __str__(self):
        return f"{self.user.email} - {self.role}"