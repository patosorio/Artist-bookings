# backend/agencies/views.py (Back to APIView)
from rest_framework import status, viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import transaction
from django.db.models import Prefetch
from .serializers import (
    AgencySerializer, AgencyBusinessDetailsSerializer, 
    AgencySettingsSerializer, UserProfileSerializer
)
from .models import Agency, AgencyBusinessDetails, AgencySettings, UserProfile
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError


class AgencyQueryMixin:
    """
    Mixin to centralize agency query logic and optimize database access
    """
    def get_user_agency_queryset(self, user):
        """
        Get optimized queryset for user's agency with all related data
        """
        base_queryset = Agency.objects.select_related(
            'owner',
            'business_details',
            'agency_settings'
        ).prefetch_related(
            Prefetch(
                'users',
                queryset=UserProfile.objects.select_related('user')
            )
        )
        
        if hasattr(user, 'owned_agency'):
            return base_queryset.filter(id=user.owned_agency.id)
        elif hasattr(user, 'profile') and user.profile.agency_id:
            return base_queryset.filter(id=user.profile.agency_id)
        
        return Agency.objects.none()

    def get_user_agency(self, user, slug=None):
        """
        Get single agency instance with optimized query
        """
        queryset = self.get_user_agency_queryset(user)
        
        if slug:
            return queryset.filter(slug=slug).first()
        
        return queryset.first()


class AgencyView(AgencyQueryMixin, APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """
        Get user's agencies
        """
        agencies = self.get_user_agency_queryset(request.user)
        serializer = AgencySerializer(agencies, many=True)
        return Response(serializer.data)

    def post(self, request):
        """
        Create new agency with transaction safety
        """
        serializer = AgencySerializer(data=request.data)
        if serializer.is_valid():
            with transaction.atomic():
                agency = serializer.save(owner=request.user)
                # Create related objects if needed
                AgencyBusinessDetails.objects.get_or_create(agency=agency)
                AgencySettings.objects.get_or_create(agency=agency)
                
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AgencyDetailView(AgencyQueryMixin, APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, slug):
        """
        Get agency details with 404 handling
        """
        agency = self.get_user_agency(request.user, slug)
        if not agency:
            return Response(
                {"detail": "Agency not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = AgencySerializer(agency)
        return Response(serializer.data)

    def put(self, request, slug):
        """
        Update agency with optimized query
        """
        agency = self.get_user_agency(request.user, slug)
        if not agency:
            return Response(
                {"detail": "Agency not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = AgencySerializer(agency, data=request.data, partial=True)
        if serializer.is_valid():
            with transaction.atomic():
                serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AgencyBusinessDetailsView(AgencyQueryMixin, APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, slug):
        """
        Get business details with optimized query
        """
        agency = self.get_user_agency(request.user, slug)
        if not agency:
            return Response(
                {"detail": "Agency not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        business_details, created = AgencyBusinessDetails.objects.get_or_create(
            agency=agency
        )
        
        serializer = AgencyBusinessDetailsSerializer(business_details)
        return Response(serializer.data)

    def put(self, request, slug):
        """
        Update business details with transaction safety
        """
        agency = self.get_user_agency(request.user, slug)
        if not agency:
            return Response(
                {"detail": "Agency not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        business_details, created = AgencyBusinessDetails.objects.get_or_create(
            agency=agency
        )
        
        serializer = AgencyBusinessDetailsSerializer(
            business_details,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            with transaction.atomic():
                serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AgencySettingsView(AgencyQueryMixin, APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, slug):
        """
        Get agency settings with optimized query
        """
        agency = self.get_user_agency(request.user, slug)
        if not agency:
            return Response(
                {"detail": "Agency not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
            
        settings, created = AgencySettings.objects.get_or_create(
            agency=agency
        )
        
        serializer = AgencySettingsSerializer(settings)
        return Response(serializer.data)

    def put(self, request, slug):
        """
        Update agency settings with transaction safety
        """
        agency = self.get_user_agency(request.user, slug)
        if not agency:
            return Response(
                {"detail": "Agency not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
            
        settings, created = AgencySettings.objects.get_or_create(
            agency=agency
        )
        
        serializer = AgencySettingsSerializer(
            settings,
            data=request.data,
            partial=True
        )
        
        if serializer.is_valid():
            with transaction.atomic():
                serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Keep UserProfileViewSet as ModelViewSet since it works fine
class UserProfileViewSet(AgencyQueryMixin, viewsets.ModelViewSet):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        base_queryset = UserProfile.objects.select_related('user', 'agency')
        
        if hasattr(user, 'owned_agency'):
            return base_queryset.filter(agency=user.owned_agency)
        elif hasattr(user, 'profile') and user.profile.agency_id:
            return base_queryset.filter(agency_id=user.profile.agency_id)
            
        return UserProfile.objects.none()

    def perform_create(self, serializer):
        if hasattr(self.request.user, 'owned_agency'):
            serializer.save(agency=self.request.user.owned_agency)
        else:
            raise ValidationError("User must own an agency to create profiles")

    def perform_update(self, serializer):
        with transaction.atomic():
            if hasattr(self.request.user, 'owned_agency'):
                serializer.save(agency=self.request.user.owned_agency)
            else:
                raise ValidationError("User must own an agency to update profiles")

    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        if not hasattr(request.user, 'owned_agency'):
            return Response(
                {"detail": "User must own an agency"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = self.get_serializer(data=request.data, many=True)
        if serializer.is_valid():
            with transaction.atomic():
                profiles = []
                for profile_data in serializer.validated_data:
                    profile_data['agency'] = request.user.owned_agency
                    profiles.append(UserProfile(**profile_data))
                
                UserProfile.objects.bulk_create(profiles)
                
            return Response(
                {"detail": f"Created {len(profiles)} profiles"}, 
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)