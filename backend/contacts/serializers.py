# contacts/serializers.py

from rest_framework import serializers
from django.db import transaction
from django.core.exceptions import ValidationError as DjangoValidationError
from typing import Dict, Any
from .models import Contact


class ContactSerializer(serializers.ModelSerializer):
    """Serializer for the Contact model with smart reference handling."""
    
    reference_display_name = serializers.SerializerMethodField()
    reference_details = serializers.SerializerMethodField()
    full_contact_info = serializers.SerializerMethodField()
    country_name = serializers.CharField(source='country.name', read_only=True)
    
    # Display fields for related entities (populated via methods)
    promoter_name = serializers.SerializerMethodField()
    venue_name = serializers.SerializerMethodField()
    
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
        model = Contact
        fields = [
            'id', 'contact_name', 'contact_email', 'contact_phone',
            'contact_type', 'job_title', 'department',
            'reference_type', 'promoter_id', 'venue_id',
            'promoter_name', 'venue_name', 'reference_display_name', 'reference_details',
            'preferred_contact_method', 'address', 'city', 'country', 'country_name',
            'whatsapp', 'linkedin', 'is_primary', 'is_emergency',
            'notes', 'tags', 'timezone', 'working_hours', 'is_active',
            'full_contact_info', 'created_at', 'updated_at',
            'created_by_name', 'updated_by_name'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'reference_display_name', 'reference_details',
            'full_contact_info', 'promoter_name', 'venue_name',
            'created_by_name', 'updated_by_name', 'updated_by'
        ]
    
    def get_reference_display_name(self, obj):
        """Get display name of referenced entity."""
        return obj.reference_display_name
    
    def get_reference_details(self, obj):
        """Get detailed info about the referenced entity."""
        related_entity = obj.get_related_entity()
        if not related_entity:
            return None
        
        if obj.reference_type == Contact.ReferenceType.AGENCY:
            return {
                'type': 'agency',
                'name': related_entity.name,
                'id': str(related_entity.id)
            }
        elif obj.reference_type == Contact.ReferenceType.PROMOTER:
            return {
                'type': 'promoter',
                'name': getattr(related_entity, 'company_name', 'Unknown Promoter'),
                'promoter_name': getattr(related_entity, 'promoter_name', ''),
                'id': str(related_entity.id)
            }
        elif obj.reference_type == Contact.ReferenceType.VENUE:
            return {
                'type': 'venue',
                'name': getattr(related_entity, 'venue_name', 'Unknown Venue'),
                'city': getattr(related_entity, 'venue_city', ''),
                'id': str(related_entity.id)
            }
        
        return None
    
    def get_full_contact_info(self, obj):
        """Get formatted contact information."""
        return obj.full_contact_info
    
    def get_promoter_name(self, obj):
        """Get promoter name if this is a promoter contact."""
        if obj.reference_type == Contact.ReferenceType.PROMOTER:
            related_entity = obj.get_related_entity()
            if related_entity:
                return getattr(related_entity, 'company_name', 'Unknown Promoter')
        return None
    
    def get_venue_name(self, obj):
        """Get venue name if this is a venue contact."""
        if obj.reference_type == Contact.ReferenceType.VENUE:
            related_entity = obj.get_related_entity()
            if related_entity:
                return getattr(related_entity, 'venue_name', 'Unknown Venue')
        return None
    
    def validate_contact_email(self, value):
        """Validate email uniqueness within agency."""
        if value:
            agency = self.context['request'].user.profile.agency
            
            existing_contacts = Contact.objects.filter(
                agency=agency,
                contact_email=value
            )
            
            # Exclude current instance if updating
            if self.instance:
                existing_contacts = existing_contacts.exclude(pk=self.instance.pk)
            
            if existing_contacts.exists():
                raise serializers.ValidationError(
                    "A contact with this email already exists in your agency."
                )
        
        return value
    
    def validate_reference_consistency(self, data):
        """Validate that reference_type matches the provided IDs."""
        reference_type = data.get('reference_type')
        promoter_id = data.get('promoter_id')
        venue_id = data.get('venue_id')
        
        if reference_type == Contact.ReferenceType.PROMOTER:
            if not promoter_id:
                raise serializers.ValidationError({
                    'promoter_id': 'Promoter ID is required for promoter contacts.'
                })
            if venue_id:
                raise serializers.ValidationError({
                    'venue_id': 'Venue ID should be empty for promoter contacts.'
                })
        
        elif reference_type == Contact.ReferenceType.VENUE:
            if not venue_id:
                raise serializers.ValidationError({
                    'venue_id': 'Venue ID is required for venue contacts.'
                })
            if promoter_id:
                raise serializers.ValidationError({
                    'promoter_id': 'Promoter ID should be empty for venue contacts.'
                })
        
        elif reference_type == Contact.ReferenceType.AGENCY:
            if promoter_id or venue_id:
                raise serializers.ValidationError({
                    'reference_type': 'Agency contacts should not have promoter or venue references.'
                })
    
    def validate_related_entity_exists(self, data):
        """Validate that referenced promoter or venue actually exists."""
        agency = self.context['request'].user.profile.agency
        reference_type = data.get('reference_type')
        promoter_id = data.get('promoter_id')
        venue_id = data.get('venue_id')
        
        if reference_type == Contact.ReferenceType.PROMOTER and promoter_id:
            try:
                from promoters.models import Promoter
                if not Promoter.objects.filter(id=promoter_id, agency=agency).exists():
                    raise serializers.ValidationError({
                        'promoter_id': 'The specified promoter does not exist or does not belong to your agency.'
                    })
            except ImportError:
                raise serializers.ValidationError({
                    'promoter_id': 'Promoters functionality is not available.'
                })
        
        elif reference_type == Contact.ReferenceType.VENUE and venue_id:
            try:
                from venues.models import Venue
                if not Venue.objects.filter(id=venue_id, agency=agency).exists():
                    raise serializers.ValidationError({
                        'venue_id': 'The specified venue does not exist or does not belong to your agency.'
                    })
            except ImportError:
                raise serializers.ValidationError({
                    'venue_id': 'Venues functionality is not available.'
                })
    
    def validate_primary_contact_logic(self, data):
        """Ensure primary contact logic makes sense."""
        is_primary = data.get('is_primary', False)
        reference_type = data.get('reference_type')
        promoter_id = data.get('promoter_id')
        venue_id = data.get('venue_id')
        
        # If setting as primary, check for existing primary contacts
        if is_primary:
            agency = self.context['request'].user.profile.agency
            existing_primary = Contact.objects.filter(
                agency=agency,
                reference_type=reference_type,
                is_primary=True
            )
            
            if reference_type == Contact.ReferenceType.PROMOTER:
                existing_primary = existing_primary.filter(promoter_id=promoter_id)
            elif reference_type == Contact.ReferenceType.VENUE:
                existing_primary = existing_primary.filter(venue_id=venue_id)
            
            # Exclude current instance if updating
            if self.instance:
                existing_primary = existing_primary.exclude(pk=self.instance.pk)
            
            if existing_primary.exists():
                entity_name = "this entity"
                if reference_type == Contact.ReferenceType.AGENCY:
                    entity_name = "your agency"
                elif reference_type == Contact.ReferenceType.PROMOTER:
                    entity_name = "this promoter"
                elif reference_type == Contact.ReferenceType.VENUE:
                    entity_name = "this venue"
                
                raise serializers.ValidationError({
                    'is_primary': f'There is already a primary contact for {entity_name}. '
                                f'Please unset the existing primary contact first.'
                })
    
    def validate(self, data):
        """Cross-field validation."""
        # Run all validation checks
        self.validate_reference_consistency(data)
        self.validate_related_entity_exists(data)
        self.validate_primary_contact_logic(data)
        
        # Ensure at least basic contact info
        contact_email = data.get('contact_email')
        contact_phone = data.get('contact_phone')
        
        if not any([contact_email, contact_phone]):
            raise serializers.ValidationError(
                "At least email or phone must be provided."
            )
        
        return data
    
    def create(self, validated_data: Dict[str, Any]) -> Contact:
        """Create contact with proper agency and audit info."""
        # Agency and created_by are set in the viewset's perform_create
        return super().create(validated_data)
    
    def update(self, instance: Contact, validated_data: Dict[str, Any]) -> Contact:
        """Update contact with audit info."""
        # updated_by is set in the viewset's perform_update
        return super().update(instance, validated_data)