# venues/serializers.py

from rest_framework import serializers
from django.db import transaction
from typing import Dict, Any
from django_countries.serializers import CountryFieldMixin
from .models import Venue


class VenueSerializer(CountryFieldMixin, serializers.ModelSerializer):
    """Serializer for the Venue model."""
    
    display_name = serializers.SerializerMethodField()
    full_address = serializers.SerializerMethodField()
    country_name = serializers.CharField(source='venue_country.name', read_only=True)
    company_country_name = serializers.CharField(source='company_country.name', read_only=True)
    
    capacity_category = serializers.SerializerMethodField()
    
    # Audit information
    created_by_name = serializers.CharField(
        source='created_by.user.get_full_name', 
        read_only=True
    )
    updated_by_name = serializers.CharField(
        source='updated_by.user.get_full_name', 
        read_only=True
    )
    
    class Meta:
        model = Venue
        fields = [
            'id', 'venue_name', 'venue_address', 'venue_city', 
            'venue_zipcode', 'venue_country', 'country_name',
            'venue_type', 'capacity', 'capacity_category',
            'tech_specs', 'stage_dimensions', 'sound_system', 'lighting_system',
            'has_parking', 'has_catering', 'is_accessible',
            'contact_name', 'contact_email', 'contact_phone',
            'company_name', 'company_address', 'company_city',
            'company_zipcode', 'company_country', 'company_country_name',
            'website', 'notes', 'is_active',
            'display_name', 'full_address',
            'created_at', 'updated_at', 'created_by_name', 'updated_by_name'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'display_name', 'full_address',
            'capacity_category', 'created_by_name', 'updated_by_name'
        ]
    
    def get_display_name(self, obj):
        """Get human-readable display name."""
        return f"{obj.venue_name} - {obj.venue_city}"
    
    def get_full_address(self, obj):
        """Get formatted full address."""
        address_parts = []
        if obj.venue_address:
            address_parts.append(obj.venue_address)
        if obj.venue_city:
            address_parts.append(obj.venue_city)
        if obj.venue_zipcode:
            address_parts.append(obj.venue_zipcode)
        if obj.venue_country:
            address_parts.append(str(obj.venue_country.name))
        
        return ', '.join(address_parts) if address_parts else ''
    
    def get_capacity_category(self, obj):
        """Get capacity category for easier filtering/grouping."""
        if obj.capacity < 500:
            return 'small'
        elif obj.capacity < 2000:
            return 'medium'
        elif obj.capacity < 10000:
            return 'large'
        else:
            return 'massive'
    
    
    def validate_capacity(self, value):
        """Validate venue capacity."""
        if value <= 0:
            raise serializers.ValidationError("Capacity must be greater than 0.")
        if value > 1000000:  # Reasonable upper limit
            raise serializers.ValidationError("Capacity seems unreasonably high. Please verify.")
        return value
    
    def validate_contact_email(self, value):
        """Validate email uniqueness within agency if provided."""
        if value:
            # Get agency from context (set by viewset)
            agency = self.context['request'].user.profile.agency
            
            # Check for existing email in the same agency
            existing_venues = Venue.objects.filter(
                agency=agency,
                contact_email=value
            )
            
            # Exclude current instance if updating
            if self.instance:
                existing_venues = existing_venues.exclude(pk=self.instance.pk)
            
            if existing_venues.exists():
                raise serializers.ValidationError(
                    "A venue with this contact email already exists in your agency."
                )
        
        return value
    
    def validate(self, data):
        """Cross-field validation."""
        # Ensure at least one contact method is provided
        contact_email = data.get('contact_email', '')
        contact_phone = data.get('contact_phone', '')
        website = data.get('website', '')
        
        # Check current instance values for fields not being updated
        if self.instance:
            contact_email = contact_email or getattr(self.instance, 'contact_email', '')
            contact_phone = contact_phone or getattr(self.instance, 'contact_phone', '')
            website = website or getattr(self.instance, 'website', '')
        
        if not any([contact_email, contact_phone, website]):
            raise serializers.ValidationError(
                "At least one contact method (email, phone, or website) must be provided."
            )
        
        # Validate venue name uniqueness within agency and city
        venue_name = data.get('venue_name')
        venue_city = data.get('venue_city')
        
        if venue_name and venue_city:
            agency = self.context['request'].user.profile.agency
            existing_venues = Venue.objects.filter(
                agency=agency,
                venue_name=venue_name,
                venue_city=venue_city
            )
            
            # Exclude current instance if updating
            if self.instance:
                existing_venues = existing_venues.exclude(pk=self.instance.pk)
            
            if existing_venues.exists():
                raise serializers.ValidationError({
                    'venue_name': 'A venue with this name already exists in this city within your agency.'
                })
        
        return data
    
    def create(self, validated_data: Dict[str, Any]) -> Venue:
        """Create venue with proper agency and audit info."""
        # Agency and created_by are set in the viewset's perform_create
        return super().create(validated_data)
    
    def update(self, instance: Venue, validated_data: Dict[str, Any]) -> Venue:
        """Update venue with audit info."""
        # updated_by is set in the viewset's perform_update
        return super().update(instance, validated_data)