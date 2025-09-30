# venues/views.py

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

from .models import Venue
from .serializers import VenueSerializer
from rest_framework.permissions import IsAuthenticated

logger = logging.getLogger(__name__)


class VenueFilter(django_filters.FilterSet):
    """Filter set for the Venue model."""
    venue_type = django_filters.ChoiceFilter(choices=Venue.VenueType.choices)
    is_active = django_filters.BooleanFilter()
    created_at = django_filters.DateFromToRangeFilter()
    venue_country = django_filters.CharFilter()
    capacity_min = django_filters.NumberFilter(field_name='capacity', lookup_expr='gte')
    capacity_max = django_filters.NumberFilter(field_name='capacity', lookup_expr='lte')
    has_parking = django_filters.BooleanFilter()
    has_catering = django_filters.BooleanFilter()
    is_accessible = django_filters.BooleanFilter()
    has_email = django_filters.BooleanFilter(method='filter_has_email')
    has_phone = django_filters.BooleanFilter(method='filter_has_phone')
    has_website = django_filters.BooleanFilter(method='filter_has_website')
    
    class Meta:
        model = Venue
        fields = [
            'venue_type', 'is_active', 'created_at', 'venue_country',
            'capacity_min', 'capacity_max', 'has_parking', 'has_catering', 'is_accessible'
        ]
    
    def filter_has_email(self, queryset, name, value):
        """Filter venues with/without email."""
        if value:
            return queryset.exclude(contact_email='')
        return queryset.filter(contact_email='')
    
    def filter_has_phone(self, queryset, name, value):
        """Filter venues with/without phone."""
        if value:
            return queryset.exclude(contact_phone='')
        return queryset.filter(contact_phone='')
    
    def filter_has_website(self, queryset, name, value):
        """Filter venues with/without website."""
        if value:
            return queryset.exclude(website='')
        return queryset.filter(website='')


class VenueQueryMixin:
    """Mixin to centralize venue query logic and optimize database access."""
    
    def get_venue_queryset(self) -> QuerySet:
        """Get optimized queryset for venues with all related data."""
        # Check if user has a profile, if not return empty queryset
        if not hasattr(self.request.user, 'profile') or not self.request.user.profile:
            return Venue.objects.none()
        
        return Venue.objects.filter(
            agency=self.request.user.profile.agency
        ).select_related(
            'agency',
            'created_by__user',
            'updated_by__user'
        )
    
    def get_venue(self, pk: str) -> Venue:
        """Get single venue instance with optimized query."""
        venue = self.get_venue_queryset().filter(pk=pk).first()
        if not venue:
            return None
        return venue
    
    def get_display_name(self, venue: Venue) -> str:
        """Get human-readable display name for venue."""
        return f"{venue.venue_name} - {venue.venue_city}"
    
    def get_full_address(self, venue: Venue) -> str:
        """Get formatted full address."""
        address_parts = []
        if venue.venue_address:
            address_parts.append(venue.venue_address)
        if venue.venue_city:
            address_parts.append(venue.venue_city)
        if venue.venue_zipcode:
            address_parts.append(venue.venue_zipcode)
        if venue.venue_country:
            address_parts.append(str(venue.venue_country.name))
        
        return ', '.join(address_parts) if address_parts else ''
    
    def get_capacity_category(self, venue: Venue) -> str:
        """Get capacity category."""
        if venue.capacity < 500:
            return 'small'
        elif venue.capacity < 2000:
            return 'medium'
        elif venue.capacity < 10000:
            return 'large'
        else:
            return 'massive'


class VenueViewSet(VenueQueryMixin, viewsets.ModelViewSet):
    """
    ViewSet for managing venues.
    
    Supports CRUD operations with optimized queries, filtering, and pagination.
    """
    serializer_class = VenueSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'patch', 'delete', 'head', 'options']
    filter_backends = [django_filters.DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = VenueFilter
    search_fields = ['venue_name', 'venue_city', 'venue_address', 'contact_name', 'notes']
    ordering_fields = ['venue_name', 'venue_city', 'capacity', 'created_at', 'venue_type']
    ordering = ['venue_name']
    
    def get_queryset(self) -> QuerySet:
        """Get the queryset filtered by the user's agency with optimized joins."""
        return self.get_venue_queryset()
    
    def perform_create(self, serializer) -> None:
        """Create a new venue with proper agency and user assignment."""
        try:
            with transaction.atomic():
                serializer.save(
                    agency=self.request.user.profile.agency,
                    created_by=self.request.user.profile
                )
        except Exception as e:
            if 'UNIQUE constraint' in str(e):
                if 'venue_name' in str(e):
                    raise ValidationError({
                        'venue_name': ['A venue with this name already exists in this city within your agency.']
                    })
                elif 'contact_email' in str(e):
                    raise ValidationError({
                        'contact_email': ['A venue with this contact email already exists in your agency.']
                    })
            raise
    
    def perform_update(self, serializer) -> None:
        """Update an existing venue with transaction safety."""
        with transaction.atomic():
            serializer.save(updated_by=self.request.user.profile)
    
    @action(detail=True, methods=['get'])
    def summary(self, request, pk=None):
        """Get venue summary information."""
        venue = self.get_object()
        if not venue:
            return Response(
                {"detail": "Venue not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        summary = {
            'id': str(venue.id),
            'display_name': self.get_display_name(venue),
            'full_address': self.get_full_address(venue),
            'capacity_category': self.get_capacity_category(venue),
            'features': {
                'has_parking': venue.has_parking,
                'has_catering': venue.has_catering,
                'is_accessible': venue.is_accessible
            },
            'contact_methods': {
                'has_email': bool(venue.contact_email),
                'has_phone': bool(venue.contact_phone),
                'has_website': bool(venue.website)
            },
            'technical_info': {
                'has_tech_specs': bool(venue.tech_specs),
                'has_stage_dimensions': bool(venue.stage_dimensions),
                'has_sound_system': bool(venue.sound_system),
                'has_lighting_system': bool(venue.lighting_system)
            },
            'is_active': venue.is_active,
            'venue_type': venue.get_venue_type_display(),
            'created_at': venue.created_at
        }
        
        return Response(summary)
    
    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        """Create a duplicate of the venue."""
        venue = self.get_object()
        if not venue:
            return Response(
                {"detail": "Venue not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        suffix = request.data.get('suffix', ' (Copy)')
        
        try:
            with transaction.atomic():
                new_venue = Venue.objects.create(
                    agency=venue.agency,
                    venue_name=f"{venue.venue_name}{suffix}",
                    venue_address=venue.venue_address,
                    venue_city=venue.venue_city,
                    venue_zipcode=venue.venue_zipcode,
                    venue_country=venue.venue_country,
                    venue_type=venue.venue_type,
                    capacity=venue.capacity,
                    tech_specs=venue.tech_specs,
                    stage_dimensions=venue.stage_dimensions,
                    sound_system=venue.sound_system,
                    lighting_system=venue.lighting_system,
                    has_parking=venue.has_parking,
                    has_catering=venue.has_catering,
                    is_accessible=venue.is_accessible,
                    contact_name=venue.contact_name,
                    contact_email='',  # Clear email to avoid unique constraint
                    contact_phone=venue.contact_phone,
                    company_name=venue.company_name,
                    company_address=venue.company_address,
                    company_city=venue.company_city,
                    company_zipcode=venue.company_zipcode,
                    company_country=venue.company_country,
                    website=venue.website,
                    notes=f"Duplicated from {venue.venue_name}. {venue.notes}".strip(),
                    is_active=True,
                    created_by=request.user.profile
                )
                
                serializer = self.get_serializer(new_venue)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {'error': f'Failed to duplicate venue: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['patch'])
    def toggle_status(self, request, pk=None):
        """Toggle venue active status."""
        venue = self.get_object()
        if not venue:
            return Response(
                {"detail": "Venue not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        with transaction.atomic():
            venue.is_active = not venue.is_active
            venue.updated_by = request.user.profile
            venue.save(update_fields=['is_active', 'updated_by', 'updated_at'])
        
        serializer = self.get_serializer(venue)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def bulk_update_status(self, request):
        """Bulk update venue status."""
        venue_ids = request.data.get('venue_ids', [])
        is_active = request.data.get('is_active', True)
        
        if not venue_ids:
            return Response(
                {'error': 'venue_ids is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        with transaction.atomic():
            updated_count = Venue.objects.filter(
                id__in=venue_ids,
                agency=request.user.profile.agency
            ).update(is_active=is_active)
        
        return Response({
            'message': f'Updated {updated_count} venues',
            'updated_count': updated_count
        })
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get only active venues."""
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
        """Get venues grouped by type."""
        queryset = self.get_queryset()
        
        type_groups = {}
        for choice in Venue.VenueType.choices:
            venue_type = choice[0]
            type_queryset = queryset.filter(venue_type=venue_type)
            type_groups[venue_type] = {
                'label': choice[1],
                'count': type_queryset.count(),
                'venues': self.get_serializer(type_queryset, many=True).data
            }
        
        return Response(type_groups)
    
    @action(detail=False, methods=['get'])
    def by_capacity(self, request):
        """Get venues grouped by capacity category."""
        queryset = self.get_queryset()
        
        capacity_groups = {
            'small': {'label': 'Small (< 500)', 'venues': []},
            'medium': {'label': 'Medium (500-2000)', 'venues': []},
            'large': {'label': 'Large (2000-10000)', 'venues': []},
            'massive': {'label': 'Massive (10000+)', 'venues': []}
        }
        
        for venue in queryset:
            category = self.get_capacity_category(venue)
            capacity_groups[category]['venues'].append(
                self.get_serializer(venue).data
            )
        
        # Add counts
        for category in capacity_groups:
            capacity_groups[category]['count'] = len(capacity_groups[category]['venues'])
        
        return Response(capacity_groups)
    
    @action(detail=False, methods=['get'])
    def by_country(self, request):
        """Get venues grouped by country."""
        queryset = self.get_queryset()
        
        # Group by country
        countries = {}
        for venue in queryset:
            country = str(venue.venue_country.name) if venue.venue_country else 'Unknown'
            if country not in countries:
                countries[country] = []
            countries[country].append(venue)
        
        country_data = {}
        for country, venues in countries.items():
            country_data[country] = {
                'count': len(venues),
                'venues': self.get_serializer(venues, many=True).data
            }
        
        return Response(country_data)
    
    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """Get venue statistics for dashboard."""
        queryset = self.get_queryset()
        
        total_venues = queryset.count()
        active_venues = queryset.filter(is_active=True).count()
        inactive_venues = total_venues - active_venues
        
        # Group by type
        type_breakdown = {}
        for choice in Venue.VenueType.choices:
            type_breakdown[choice[0]] = {
                'label': choice[1],
                'count': queryset.filter(venue_type=choice[0]).count()
            }
        
        # Capacity breakdown
        capacity_breakdown = {
            'small': queryset.filter(capacity__lt=500).count(),
            'medium': queryset.filter(capacity__gte=500, capacity__lt=2000).count(),
            'large': queryset.filter(capacity__gte=2000, capacity__lt=10000).count(),
            'massive': queryset.filter(capacity__gte=10000).count()
        }
        
        # Features breakdown
        features_breakdown = {
            'has_parking': queryset.filter(has_parking=True).count(),
            'has_catering': queryset.filter(has_catering=True).count(),
            'is_accessible': queryset.filter(is_accessible=True).count()
        }
        
        # Recent additions
        last_30_days = datetime.now() - timedelta(days=30)
        recent_additions = queryset.filter(created_at__gte=last_30_days).count()
        
        return Response({
            'total_venues': total_venues,
            'active_venues': active_venues,
            'inactive_venues': inactive_venues,
            'type_breakdown': type_breakdown,
            'capacity_breakdown': capacity_breakdown,
            'features_breakdown': features_breakdown,
            'recent_additions': recent_additions
        })