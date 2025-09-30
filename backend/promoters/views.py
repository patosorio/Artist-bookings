# promoters/views.py

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

from .models import Promoter
from .serializers import PromoterSerializer
from agencies.permissions import (
    IsAgencyMember,
    IsAgencyManagerOrOwner,
    IsAgencyOwner,
    StandardAgencyPermissions
)

logger = logging.getLogger(__name__)


class PromoterFilter(django_filters.FilterSet):
    """Filter set for the Promoter model."""
    promoter_type = django_filters.ChoiceFilter(choices=Promoter.PromoterType.choices)
    is_active = django_filters.BooleanFilter()
    created_at = django_filters.DateFromToRangeFilter()
    company_country = django_filters.CharFilter()
    has_email = django_filters.BooleanFilter(method='filter_has_email')
    has_phone = django_filters.BooleanFilter(method='filter_has_phone')
    has_website = django_filters.BooleanFilter(method='filter_has_website')
    
    class Meta:
        model = Promoter
        fields = ['promoter_type', 'is_active', 'created_at', 'company_country']
    
    def filter_has_email(self, queryset, name, value):
        """Filter promoters with/without email."""
        if value:
            return queryset.exclude(promoter_email='')
        return queryset.filter(promoter_email='')
    
    def filter_has_phone(self, queryset, name, value):
        """Filter promoters with/without phone."""
        if value:
            return queryset.exclude(promoter_phone='')
        return queryset.filter(promoter_phone='')
    
    def filter_has_website(self, queryset, name, value):
        """Filter promoters with/without website."""
        if value:
            return queryset.exclude(website='')
        return queryset.filter(website='')


class PromoterQueryMixin:
    """Mixin to centralize promoter query logic and optimize database access."""
    
    def get_promoter_queryset(self) -> QuerySet:
        """Get optimized queryset for promoters with all related data."""
        # Check if user has a profile, if not return empty queryset
        if not hasattr(self.request.user, 'profile') or not self.request.user.profile:
            return Promoter.objects.none()
        
        return Promoter.objects.filter(
            agency=self.request.user.profile.agency
        ).select_related(
            'agency',
            'created_by__user',
            'updated_by__user'
        )
    
    def get_promoter(self, pk: str) -> Promoter:
        """Get single promoter instance with optimized query."""
        promoter = self.get_promoter_queryset().filter(pk=pk).first()
        if not promoter:
            return None
        return promoter
    
    def get_display_name(self, promoter: Promoter) -> str:
        """Get human-readable display name for promoter."""
        if promoter.promoter_name and promoter.company_name:
            return f"{promoter.promoter_name} ({promoter.company_name})"
        return promoter.promoter_name or promoter.company_name or "Unnamed Promoter"
    
    def get_full_address(self, promoter: Promoter) -> str:
        """Get formatted full address."""
        address_parts = []
        if promoter.company_address:
            address_parts.append(promoter.company_address)
        if promoter.company_city:
            address_parts.append(promoter.company_city)
        if promoter.company_zipcode:
            address_parts.append(promoter.company_zipcode)
        if promoter.company_country:
            address_parts.append(str(promoter.company_country.name))
        
        return ', '.join(address_parts) if address_parts else ''
    
    # def get_contacts_count(self, promoter: Promoter) -> int:
    #     """Get active contacts count for promoter."""
    #     try:
    #         from contacts.models import Contact
    #         return Contact.objects.filter(
    #             agency=promoter.agency,
    #             promoter_id=str(promoter.id),
    #             is_active=True
    #         ).count()
    #     except ImportError:
    #         return 0
    
    # def get_bookings_count(self, promoter: Promoter) -> int:
    #     """Get total bookings count for promoter."""
    #     try:
    #         from bookings.models import Booking
    #         return Booking.objects.filter(
    #             agency=promoter.agency,
    #             promoter_id=str(promoter.id)
    #         ).count()
    #     except ImportError:
    #         return 0
    
    # def get_recent_bookings_summary(self, promoter: Promoter, limit: int = 5) -> list:
    #     """Get recent bookings summary for promoter."""
    #     try:
    #         from bookings.models import Booking
    #         recent_bookings = Booking.objects.filter(
    #             agency=promoter.agency,
    #             promoter_id=str(promoter.id)
    #         ).order_by('-booking_date')[:limit]
            
    #         return [{
    #             'id': str(booking.id),
    #             'booking_date': booking.booking_date,
    #             'status': booking.status,
    #             'artist_id': booking.artist_id,
    #             'venue_id': booking.venue_id,
    #             'guarantee_amount': booking.guarantee_amount,
    #             'currency': booking.currency
    #         } for booking in recent_bookings]
    #     except ImportError:
    #         return []
    
    # def get_active_contacts(self, promoter: Promoter) -> list:
    #     """Get active contacts for promoter."""
    #     try:
    #         from contacts.models import Contact
    #         contacts = Contact.objects.filter(
    #             agency=promoter.agency,
    #             promoter_id=str(promoter.id),
    #             is_active=True
    #         )
            
    #         return [{
    #             'id': str(contact.id),
    #             'contact_name': contact.contact_name,
    #             'contact_email': contact.contact_email,
    #             'contact_phone': contact.contact_phone,
    #             'contact_type': contact.contact_type,
    #             'is_primary': contact.is_primary
    #         } for contact in contacts]
    #     except ImportError:
    #         return []


class PromoterViewSet(PromoterQueryMixin, viewsets.ModelViewSet):
    """
    ViewSet for managing promoters.
    
    Supports CRUD operations with optimized queries, filtering, and pagination.
    """
    serializer_class = PromoterSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'patch', 'delete', 'head', 'options']
    
    filter_backends = [django_filters.DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = PromoterFilter
    search_fields = ['promoter_name', 'company_name', 'promoter_email', 'company_city', 'notes']
    ordering_fields = ['promoter_name', 'company_name', 'company_city', 'created_at', 'promoter_type']
    ordering = ['company_name', 'promoter_name']
    
    def get_queryset(self) -> QuerySet:
        """Get the queryset filtered by the user's agency with optimized joins."""
        return self.get_promoter_queryset()
    
    def perform_create(self, serializer) -> None:
        """Create a new promoter with proper agency and user assignment."""
        # Check if user has a profile
        if not hasattr(self.request.user, 'profile') or not self.request.user.profile:
            raise ValidationError({
                'non_field_errors': ['You must have an agency profile to create promoters.']
            })
        
        try:
            with transaction.atomic():
                serializer.save(
                    agency=self.request.user.profile.agency,
                    created_by=self.request.user.profile
                )
        except Exception as e:
            if 'UNIQUE constraint' in str(e) and 'email' in str(e):
                raise ValidationError({
                    'promoter_email': ['A promoter with this email already exists in your agency.']
                })
            raise
    
    def perform_update(self, serializer) -> None:
        """Update an existing promoter with transaction safety."""
        with transaction.atomic():
            serializer.save(updated_by=self.request.user.profile)
    
    @action(detail=True, methods=['get'])
    def summary(self, request, pk=None):
        """Get promoter summary information."""
        promoter = self.get_object()
        if not promoter:
            return Response(
                {"detail": "Promoter not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        summary = {
            'id': str(promoter.id),
            'display_name': self.get_display_name(promoter),
            'full_address': self.get_full_address(promoter),
            'contact_methods': {
                'has_email': bool(promoter.promoter_email),
                'has_phone': bool(promoter.promoter_phone),
                'has_website': bool(promoter.website)
            },
            'is_active': promoter.is_active,
            'promoter_type': promoter.get_promoter_type_display(),
            'created_at': promoter.created_at
        }
        
        return Response(summary)
    
    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        """Create a duplicate of the promoter."""
        promoter = self.get_object()
        if not promoter:
            return Response(
                {"detail": "Promoter not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        suffix = request.data.get('suffix', ' (Copy)')
        
        try:
            with transaction.atomic():
                new_promoter = Promoter.objects.create(
                    agency=promoter.agency,
                    promoter_name=f"{promoter.promoter_name}{suffix}" if promoter.promoter_name else None,
                    promoter_email='',  # Clear email to avoid unique constraint
                    promoter_phone=promoter.promoter_phone,
                    company_name=f"{promoter.company_name}{suffix}",
                    company_address=promoter.company_address,
                    company_city=promoter.company_city,
                    company_zipcode=promoter.company_zipcode,
                    company_country=promoter.company_country,
                    promoter_type=promoter.promoter_type,
                    tax_id='',  # Clear tax_id to avoid conflicts
                    website=promoter.website,
                    notes=f"Duplicated from {promoter.company_name}. {promoter.notes}".strip(),
                    is_active=True,
                    created_by=request.user.profile
                )
                
                serializer = self.get_serializer(new_promoter)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {'error': f'Failed to duplicate promoter: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['patch'])
    def toggle_status(self, request, pk=None):
        """Toggle promoter active status."""
        promoter = self.get_object()
        if not promoter:
            return Response(
                {"detail": "Promoter not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        with transaction.atomic():
            promoter.is_active = not promoter.is_active
            promoter.updated_by = request.user.profile
            promoter.save(update_fields=['is_active', 'updated_by', 'updated_at'])
        
        serializer = self.get_serializer(promoter)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def bulk_update_status(self, request):
        """Bulk update promoter status."""
        promoter_ids = request.data.get('promoter_ids', [])
        is_active = request.data.get('is_active', True)
        
        if not promoter_ids:
            return Response(
                {'error': 'promoter_ids is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        with transaction.atomic():
            updated_count = Promoter.objects.filter(
                id__in=promoter_ids,
                agency=request.user.profile.agency
            ).update(is_active=is_active)
        
        return Response({
            'message': f'Updated {updated_count} promoters',
            'updated_count': updated_count
        })
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get only active promoters."""
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
        """Get promoters grouped by type."""
        queryset = self.get_queryset()
        
        type_groups = {}
        for choice in Promoter.PromoterType.choices:
            promoter_type = choice[0]
            type_queryset = queryset.filter(promoter_type=promoter_type)
            type_groups[promoter_type] = {
                'label': choice[1],
                'count': type_queryset.count(),
                'promoters': self.get_serializer(type_queryset, many=True).data
            }
        
        return Response(type_groups)
    
    @action(detail=False, methods=['get'])
    def by_country(self, request):
        """Get promoters grouped by country."""
        queryset = self.get_queryset()
        
        # Group by country
        countries = {}
        for promoter in queryset:
            country = str(promoter.company_country.name) if promoter.company_country else 'Unknown'
            if country not in countries:
                countries[country] = []
            countries[country].append(promoter)
        
        country_data = {}
        for country, promoters in countries.items():
            country_data[country] = {
                'count': len(promoters),
                'promoters': self.get_serializer(promoters, many=True).data
            }
        
        return Response(country_data)
    
    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """Get promoter statistics for dashboard."""
        queryset = self.get_queryset()
        
        total_promoters = queryset.count()
        active_promoters = queryset.filter(is_active=True).count()
        inactive_promoters = total_promoters - active_promoters
        
        # Group by type
        type_breakdown = {}
        for choice in Promoter.PromoterType.choices:
            type_breakdown[choice[0]] = {
                'label': choice[1],
                'count': queryset.filter(promoter_type=choice[0]).count()
            }
        
        # Recent additions
        last_30_days = datetime.now() - timedelta(days=30)
        recent_additions = queryset.filter(created_at__gte=last_30_days).count()
        
        return Response({
            'total_promoters': total_promoters,
            'active_promoters': active_promoters,
            'inactive_promoters': inactive_promoters,
            'type_breakdown': type_breakdown,
            'recent_additions': recent_additions
        })