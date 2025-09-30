# contacts/views.py

import logging
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from django.db.models import QuerySet, Q, Count
from django.db import transaction
from django_filters import rest_framework as django_filters
from typing import Any, Dict
from datetime import datetime, timedelta

from .models import Contact
from .serializers import ContactSerializer
from agencies.permissions import StandardAgencyPermissions

logger = logging.getLogger(__name__)


class ContactFilter(django_filters.FilterSet):
    """Filter set for the Contact model."""
    contact_type = django_filters.ChoiceFilter(choices=Contact.ContactType.choices)
    reference_type = django_filters.ChoiceFilter(choices=Contact.ReferenceType.choices)
    is_active = django_filters.BooleanFilter()
    is_primary = django_filters.BooleanFilter()
    is_emergency = django_filters.BooleanFilter()
    created_at = django_filters.DateFromToRangeFilter()
    country = django_filters.CharFilter()
    promoter_id = django_filters.CharFilter()
    venue_id = django_filters.CharFilter()
    has_phone = django_filters.BooleanFilter(method='filter_has_phone')
    has_whatsapp = django_filters.BooleanFilter(method='filter_has_whatsapp')
    has_linkedin = django_filters.BooleanFilter(method='filter_has_linkedin')
    
    class Meta:
        model = Contact
        fields = [
            'contact_type', 'reference_type', 'is_active', 'is_primary', 
            'is_emergency', 'created_at', 'country', 'promoter_id', 'venue_id'
        ]
    
    def filter_has_phone(self, queryset, name, value):
        """Filter contacts with/without phone."""
        if value:
            return queryset.exclude(contact_phone='')
        return queryset.filter(contact_phone='')
    
    def filter_has_whatsapp(self, queryset, name, value):
        """Filter contacts with/without WhatsApp."""
        if value:
            return queryset.exclude(whatsapp='')
        return queryset.filter(whatsapp='')
    
    def filter_has_linkedin(self, queryset, name, value):
        """Filter contacts with/without LinkedIn."""
        if value:
            return queryset.exclude(linkedin='')
        return queryset.filter(linkedin='')


class ContactQueryMixin:
    """Mixin to centralize contact query logic and optimize database access."""
    
    def get_contact_queryset(self) -> QuerySet:
        """Get optimized queryset for contacts with all related data."""
        return Contact.objects.filter(
            agency=self.request.user.profile.agency
        ).select_related(
            'agency',
            'created_by__user',
            'updated_by__user'
        )
    
    def get_contact(self, pk: str) -> Contact:
        """Get single contact instance with optimized query."""
        contact = self.get_contact_queryset().filter(pk=pk).first()
        if not contact:
            return None
        return contact
    
    def get_contacts_by_reference(self, reference_type: str, reference_id: str = None) -> QuerySet:
        """Get contacts by their reference type and optional reference ID."""
        queryset = self.get_contact_queryset().filter(reference_type=reference_type)
        
        if reference_id:
            if reference_type == Contact.ReferenceType.PROMOTER:
                queryset = queryset.filter(promoter_id=reference_id)
            elif reference_type == Contact.ReferenceType.VENUE:
                queryset = queryset.filter(venue_id=reference_id)
        
        return queryset
    
    def get_related_entity_name(self, contact: Contact) -> str:
        """Get the name of the entity this contact is related to."""
        related_entity = contact.get_related_entity()
        if not related_entity:
            return "Unknown"
        
        if contact.reference_type == Contact.ReferenceType.AGENCY:
            return related_entity.name
        elif contact.reference_type == Contact.ReferenceType.PROMOTER:
            return getattr(related_entity, 'company_name', 'Unknown Promoter')
        elif contact.reference_type == Contact.ReferenceType.VENUE:
            return getattr(related_entity, 'venue_name', 'Unknown Venue')
        
        return "Unknown"


class ContactViewSet(ContactQueryMixin, viewsets.ModelViewSet):
    """
    ViewSet for managing contacts.
    
    Supports CRUD operations with smart reference handling for promoters, venues, and agency contacts.
    """
    serializer_class = ContactSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'patch', 'delete', 'head', 'options']
    filter_backends = [django_filters.DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ContactFilter
    search_fields = ['contact_name', 'contact_email', 'job_title', 'notes', 'tags']
    ordering_fields = ['contact_name', 'contact_email', 'contact_type', 'created_at', 'is_primary']
    ordering = ['contact_name']
    
    def get_queryset(self) -> QuerySet:
        """Get the queryset filtered by the user's agency with optimized joins."""
        return self.get_contact_queryset()
    
    def perform_create(self, serializer) -> None:
        """Create a new contact with proper agency and user assignment."""
        try:
            with transaction.atomic():
                serializer.save(
                    agency=self.request.user.profile.agency,
                    created_by=self.request.user.profile
                )
        except Exception as e:
            if 'UNIQUE constraint' in str(e) and 'contact_email' in str(e):
                raise ValidationError({
                    'contact_email': ['A contact with this email already exists in your agency.']
                })
            raise
    
    def perform_update(self, serializer) -> None:
        """Update an existing contact with transaction safety."""
        with transaction.atomic():
            serializer.save(updated_by=self.request.user.profile)
    
    @action(detail=True, methods=['get'])
    def summary(self, request, pk=None):
        """Get contact summary information."""
        contact = self.get_object()
        if not contact:
            return Response(
                {"detail": "Contact not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        summary = {
            'id': str(contact.id),
            'contact_name': contact.contact_name,
            'contact_type_display': contact.get_contact_type_display(),
            'reference_type_display': contact.get_reference_type_display(),
            'reference_entity_name': self.get_related_entity_name(contact),
            'primary_contact_method': contact.preferred_contact_method,
            'contact_info': contact.full_contact_info,
            'is_primary': contact.is_primary,
            'is_emergency': contact.is_emergency,
            'is_active': contact.is_active,
            'has_additional_channels': bool(contact.whatsapp or contact.linkedin),
            'created_at': contact.created_at
        }
        
        return Response(summary)
    
    @action(detail=True, methods=['patch'])
    def toggle_status(self, request, pk=None):
        """Toggle contact active status."""
        contact = self.get_object()
        if not contact:
            return Response(
                {"detail": "Contact not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        with transaction.atomic():
            contact.is_active = not contact.is_active
            contact.updated_by = request.user.profile
            contact.save(update_fields=['is_active', 'updated_by', 'updated_at'])
        
        serializer = self.get_serializer(contact)
        return Response(serializer.data)
    
    @action(detail=True, methods=['patch'])
    def set_primary(self, request, pk=None):
        """Set this contact as the primary contact for its entity."""
        contact = self.get_object()
        if not contact:
            return Response(
                {"detail": "Contact not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        try:
            with transaction.atomic():
                # First, unset any existing primary contact for the same entity
                existing_primary = Contact.objects.filter(
                    agency=contact.agency,
                    reference_type=contact.reference_type,
                    is_primary=True
                )
                
                if contact.reference_type == Contact.ReferenceType.PROMOTER:
                    existing_primary = existing_primary.filter(promoter_id=contact.promoter_id)
                elif contact.reference_type == Contact.ReferenceType.VENUE:
                    existing_primary = existing_primary.filter(venue_id=contact.venue_id)
                
                existing_primary.exclude(pk=contact.pk).update(is_primary=False)
                
                # Set this contact as primary
                contact.is_primary = True
                contact.updated_by = request.user.profile
                contact.save(update_fields=['is_primary', 'updated_by', 'updated_at'])
                
        except Exception as e:
            return Response(
                {'error': f'Failed to set primary contact: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(contact)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def bulk_update_status(self, request):
        """Bulk update contact status."""
        contact_ids = request.data.get('contact_ids', [])
        is_active = request.data.get('is_active', True)
        
        if not contact_ids:
            return Response(
                {'error': 'contact_ids is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        with transaction.atomic():
            updated_count = Contact.objects.filter(
                id__in=contact_ids,
                agency=request.user.profile.agency
            ).update(is_active=is_active)
        
        return Response({
            'message': f'Updated {updated_count} contacts',
            'updated_count': updated_count
        })
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get only active contacts."""
        queryset = self.get_queryset().filter(is_active=True)
        queryset = self.filter_queryset(queryset)
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """Get contacts grouped by contact type."""
        queryset = self.get_queryset()
        
        type_groups = {}
        for choice in Contact.ContactType.choices:
            contact_type = choice[0]
            type_queryset = queryset.filter(contact_type=contact_type)
            type_groups[contact_type] = {
                'label': choice[1],
                'count': type_queryset.count(),
                'contacts': self.get_serializer(type_queryset, many=True).data
            }
        
        return Response(type_groups)
    
    @action(detail=False, methods=['get'])
    def by_reference(self, request):
        """Get contacts grouped by reference type."""
        queryset = self.get_queryset()
        
        reference_groups = {}
        for choice in Contact.ReferenceType.choices:
            reference_type = choice[0]
            ref_queryset = queryset.filter(reference_type=reference_type)
            reference_groups[reference_type] = {
                'label': choice[1],
                'count': ref_queryset.count(),
                'contacts': self.get_serializer(ref_queryset, many=True).data
            }
        
        return Response(reference_groups)
    
    @action(detail=False, methods=['get'])
    def promoter_contacts(self, request):
        """Get all promoter contacts, optionally filtered by promoter_id."""
        promoter_id = request.query_params.get('promoter_id')
        
        queryset = self.get_contacts_by_reference(
            Contact.ReferenceType.PROMOTER, 
            promoter_id
        )
        queryset = self.filter_queryset(queryset)
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def venue_contacts(self, request):
        """Get all venue contacts, optionally filtered by venue_id."""
        venue_id = request.query_params.get('venue_id')
        
        queryset = self.get_contacts_by_reference(
            Contact.ReferenceType.VENUE,
            venue_id
        )
        queryset = self.filter_queryset(queryset)
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def agency_contacts(self, request):
        """Get all agency contacts."""
        queryset = self.get_contacts_by_reference(Contact.ReferenceType.AGENCY)
        queryset = self.filter_queryset(queryset)
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def primary_contacts(self, request):
        """Get all primary contacts."""
        queryset = self.get_queryset().filter(is_primary=True, is_active=True)
        queryset = self.filter_queryset(queryset)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def emergency_contacts(self, request):
        """Get all emergency contacts."""
        queryset = self.get_queryset().filter(is_emergency=True, is_active=True)
        queryset = self.filter_queryset(queryset)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """Get contact statistics for dashboard."""
        queryset = self.get_queryset()
        
        total_contacts = queryset.count()
        active_contacts = queryset.filter(is_active=True).count()
        inactive_contacts = total_contacts - active_contacts
        
        # Group by reference type
        reference_breakdown = {}
        for choice in Contact.ReferenceType.choices:
            reference_breakdown[choice[0]] = {
                'label': choice[1],
                'count': queryset.filter(reference_type=choice[0]).count()
            }
        
        # Group by contact type (top 5)
        type_breakdown = {}
        for choice in Contact.ContactType.choices[:5]:  # Limit to top 5 for dashboard
            type_breakdown[choice[0]] = {
                'label': choice[1],
                'count': queryset.filter(contact_type=choice[0]).count()
            }
        
        # Special categories
        primary_contacts = queryset.filter(is_primary=True).count()
        emergency_contacts = queryset.filter(is_emergency=True).count()
        
        # Communication channels
        has_whatsapp = queryset.exclude(whatsapp='').count()
        has_linkedin = queryset.exclude(linkedin='').count()
        
        # Recent additions
        last_30_days = datetime.now() - timedelta(days=30)
        recent_additions = queryset.filter(created_at__gte=last_30_days).count()
        
        return Response({
            'total_contacts': total_contacts,
            'active_contacts': active_contacts,
            'inactive_contacts': inactive_contacts,
            'reference_breakdown': reference_breakdown,
            'type_breakdown': type_breakdown,
            'primary_contacts': primary_contacts,
            'emergency_contacts': emergency_contacts,
            'communication_channels': {
                'has_whatsapp': has_whatsapp,
                'has_linkedin': has_linkedin
            },
            'recent_additions': recent_additions
        })