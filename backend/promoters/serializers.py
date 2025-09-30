# promoters/serializers.py

from rest_framework import serializers
from django.db import transaction
from typing import Dict, Any
from .models import Promoter


class PromoterSerializer(serializers.ModelSerializer):
    """Serializer for the Promoter model."""
    
    display_name = serializers.SerializerMethodField()
    full_address = serializers.SerializerMethodField()
    country_name = serializers.CharField(source='company_country.name', read_only=True)
    
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
        model = Promoter
        fields = [
            'id', 'promoter_name', 'promoter_email', 'promoter_phone',
            'company_name', 'company_address', 'company_city', 
            'company_zipcode', 'company_country', 'country_name',
            'promoter_type', 'tax_id', 'website', 'notes', 'is_active',
            'display_name', 'full_address',
            'created_at', 'updated_at', 'created_by_name', 'updated_by_name'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'display_name', 'full_address',
            'created_by_name', 'updated_by_name'
        ]
    
    def get_display_name(self, obj):
        """Get human-readable display name."""
        if obj.promoter_name and obj.company_name:
            return f"{obj.promoter_name} ({obj.company_name})"
        return obj.promoter_name or obj.company_name or "Unnamed Promoter"
    
    def get_full_address(self, obj):
        """Get formatted full address."""
        address_parts = []
        if obj.company_address:
            address_parts.append(obj.company_address)
        if obj.company_city:
            address_parts.append(obj.company_city)
        if obj.company_zipcode:
            address_parts.append(obj.company_zipcode)
        if obj.company_country:
            address_parts.append(str(obj.company_country.name))
        
        return ', '.join(address_parts) if address_parts else ''
    
    def validate_promoter_email(self, value):
        """Validate email uniqueness within agency."""
        if value:
            # Get agency from context (set by viewset)
            agency = self.context['request'].user.profile.agency
            
            # Check for existing email in the same agency
            existing_promoters = Promoter.objects.filter(
                agency=agency,
                promoter_email=value
            )
            
            # Exclude current instance if updating
            if self.instance:
                existing_promoters = existing_promoters.exclude(pk=self.instance.pk)
            
            if existing_promoters.exists():
                raise serializers.ValidationError(
                    "A promoter with this email already exists in your agency."
                )
        
        return value
    
    def validate(self, data):
        """Cross-field validation."""
        # Ensure at least one contact method is provided
        promoter_email = data.get('promoter_email', '')
        promoter_phone = data.get('promoter_phone', '')
        website = data.get('website', '')
        
        # Check current instance values for fields not being updated
        if self.instance:
            promoter_email = promoter_email or getattr(self.instance, 'promoter_email', '')
            promoter_phone = promoter_phone or getattr(self.instance, 'promoter_phone', '')
            website = website or getattr(self.instance, 'website', '')
        
        if not any([promoter_email, promoter_phone, website]):
            raise serializers.ValidationError(
                "At least one contact method (email, phone, or website) must be provided."
            )
        
        return data
    
    def create(self, validated_data: Dict[str, Any]) -> Promoter:
        """Create promoter with proper agency and audit info."""
        # Agency and created_by are set in the viewset's perform_create
        return super().create(validated_data)
    
    def update(self, instance: Promoter, validated_data: Dict[str, Any]) -> Promoter:
        """Update promoter with audit info."""
        # updated_by is set in the viewset's perform_update
        return super().update(instance, validated_data)