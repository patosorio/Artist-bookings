import logging
from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, BasePermission
from rest_framework.exceptions import ValidationError
from django.db.models import QuerySet, Prefetch
from typing import Any, Dict
from rest_framework.request import Request
from django.db import transaction
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters import rest_framework as filters
from .models import Artist, ArtistMember, ArtistNote, ArtistSocialLinks
from .serializers import (
    ArtistSerializer,
    ArtistMemberSerializer,
    ArtistNoteSerializer
)

logger = logging.getLogger(__name__)

class ArtistFilter(filters.FilterSet):
    """Filter set for the Artist model."""
    artist_type = filters.ChoiceFilter(choices=Artist.ArtistType.choices)
    status = filters.ChoiceFilter(choices=Artist.Status.choices)
    is_active = filters.BooleanFilter()
    created_at = filters.DateFromToRangeFilter()
    
    class Meta:
        model = Artist
        fields = ['artist_type', 'status', 'is_active', 'created_at']

class ArtistQueryMixin:
    """Mixin to centralize artist query logic and optimize database access."""
    
    def get_artist_queryset(self) -> QuerySet:
        """Get optimized queryset for artists with all related data."""
        return Artist.objects.filter(
            agency=self.request.user.profile.agency
        ).select_related(
            'agency',
            'created_by',
            'updated_by',
            'social_links'
        ).prefetch_related(
            Prefetch(
                'members',
                queryset=ArtistMember.objects.select_related('agency')
            ),
            Prefetch(
                'notes',
                queryset=ArtistNote.objects.select_related('agency', 'created_by')
            )
        )

    def get_artist(self, pk: str) -> Artist:
        """Get single artist instance with optimized query."""
        artist = self.get_artist_queryset().filter(pk=pk).first()
        if not artist:
            return None
        return artist

class ArtistViewSet(ArtistQueryMixin, viewsets.ModelViewSet):
    """
    ViewSet for managing artists.
    
    Supports CRUD operations and nested routes for members and notes.
    Includes optimized queries, filtering, and pagination.
    """
    serializer_class = ArtistSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'patch', 'delete', 'head', 'options']
    filter_backends = [filters.DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ArtistFilter
    search_fields = ['artist_name', 'email', 'bio']
    ordering_fields = ['artist_name', 'created_at', 'status']
    ordering = ['artist_name']

    def get_queryset(self) -> QuerySet:
        """Get the queryset filtered by the user's agency with optimized joins."""
        return self.get_artist_queryset()

    def perform_create(self, serializer: ArtistSerializer) -> None:
        """Create a new artist with proper agency and user assignment."""
        try:
            serializer.save(
                agency=self.request.user.profile.agency,
                created_by=self.request.user.profile
            )
            # Create social links by default
            ArtistSocialLinks.objects.create(artist=serializer.instance)
        except Exception as e:
            if 'UNIQUE constraint' in str(e) and 'email' in str(e):
                raise ValidationError({
                    'email': ['An artist with this email already exists in your agency.']
                })
            raise

    def perform_update(self, serializer: ArtistSerializer) -> None:
        """Update an existing artist with transaction safety."""
        with transaction.atomic():
            serializer.save(updated_by=self.request.user.profile)

    @action(detail=True, methods=['get'])
    def onboarding_status(self, request: Request, pk: str = None) -> Response:
        """Get the onboarding status of an artist."""
        artist = self.get_object()
        if not artist:
            return Response(
                {"detail": "Artist not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        return Response({
            'is_onboarded': artist.is_onboarded,
            'total_members': artist.number_of_members,
            'onboarded_members': sum(1 for m in artist.members.all() if m.is_onboarded),
            'missing_members': artist.number_of_members - artist.members.count()
        })

    @action(detail=False, methods=['post'])
    def bulk_create(self, request: Request) -> Response:
        """Bulk create artists."""
        serializer = self.get_serializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            artists = serializer.save(
                agency=request.user.profile.agency,
                created_by=request.user.profile
            )
            # Create social links for each artist
            for artist in artists:
                ArtistSocialLinks.objects.create(artist=artist)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class ArtistMemberViewSet(ArtistQueryMixin, viewsets.ModelViewSet):
    """
    ViewSet for managing artist members.
    
    Nested under /artists/{artist_id}/members/.
    Includes optimized queries and transaction safety.
    """
    serializer_class = ArtistMemberSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self) -> QuerySet:
        """Get the queryset filtered by the artist and user's agency with optimized joins."""
        return ArtistMember.objects.filter(
            artist_id=self.kwargs['artist_pk'],
            agency=self.request.user.profile.agency
        ).select_related('agency', 'artist')

    def get_serializer_context(self) -> Dict[str, Any]:
        """Add artist to serializer context with proper error handling."""
        context = super().get_serializer_context()
        artist = self.get_artist(self.kwargs['artist_pk'])
        if not artist:
            raise ValidationError("Artist not found")
        context['artist'] = artist
        return context

    def perform_create(self, serializer: ArtistMemberSerializer) -> None:
        """Create a new artist member with transaction safety."""
        with transaction.atomic():
            super().perform_create(serializer)

class ArtistNoteViewSet(ArtistQueryMixin, viewsets.ModelViewSet):
    """
    ViewSet for managing artist notes.
    
    Nested under /artists/{artist_id}/notes/.
    Includes optimized queries and transaction safety.
    """
    serializer_class = ArtistNoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self) -> QuerySet:
        """Get the queryset filtered by the artist and user's agency with optimized joins."""
        return ArtistNote.objects.filter(
            artist_id=self.kwargs['artist_pk'],
            agency=self.request.user.profile.agency
        ).select_related('agency', 'artist', 'created_by')

    def get_serializer_context(self) -> Dict[str, Any]:
        """Add artist to serializer context with proper error handling."""
        context = super().get_serializer_context()
        artist = self.get_artist(self.kwargs['artist_pk'])
        if not artist:
            raise ValidationError("Artist not found")
        context['artist'] = artist
        return context

    def perform_create(self, serializer: ArtistNoteSerializer) -> None:
        """Create a new artist note with transaction safety."""
        with transaction.atomic():
            super().perform_create(serializer)
