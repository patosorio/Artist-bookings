from django.shortcuts import render
from rest_framework import status, viewsets, permissions
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import transaction
from .serializers import AgencySerializer, AgencyBusinessDetailsSerializer, AgencySettingsSerializer, UserProfileSerializer
from .models import Agency, AgencyBusinessDetails, AgencySettings, UserProfile
from authentication.models import User


class AgencyView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        if hasattr(user, 'owned_agency'):
            agencies = Agency.objects.filter(id=user.owned_agency.id)
        elif hasattr(user, 'profile'):
            agencies = Agency.objects.filter(id=user.profile.agency.id)
        else:
            agencies = Agency.objects.none()
            
        serializer = AgencySerializer(agencies, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = AgencySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(owner=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AgencyDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, slug):
        user = self.request.user
        try:
            if hasattr(user, 'owned_agency'):
                return Agency.objects.get(slug=slug, id=user.owned_agency.id)
            elif hasattr(user, 'profile'):
                return Agency.objects.get(slug=slug, id=user.profile.agency.id)
        except Agency.DoesNotExist:
            return None

    def get(self, request, slug):
        agency = self.get_object(slug)
        if not agency:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = AgencySerializer(agency)
        return Response(serializer.data)

    def put(self, request, slug):
        agency = self.get_object(slug)
        if not agency:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = AgencySerializer(agency, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AgencyBusinessDetailsView(APIView):
    permission_classes = [IsAuthenticated]

    def get_agency(self, slug):
        user = self.request.user
        try:
            if hasattr(user, 'owned_agency'):
                return Agency.objects.get(slug=slug, id=user.owned_agency.id)
            elif hasattr(user, 'profile'):
                return Agency.objects.get(slug=slug, id=user.profile.agency.id)
        except Agency.DoesNotExist:
            return None

    def get(self, request, slug):
        agency = self.get_agency(slug)
        if not agency:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = AgencyBusinessDetailsSerializer(agency.business_details)
        return Response(serializer.data)

    def put(self, request, slug):
        agency = self.get_agency(slug)
        if not agency:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = AgencyBusinessDetailsSerializer(
            agency.business_details,
            data=request.data,
            partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AgencySettingsView(APIView):
    permission_classes = [IsAuthenticated]

    def get_agency(self, slug):
        user = self.request.user
        try:
            if hasattr(user, 'owned_agency'):
                return Agency.objects.get(slug=slug, id=user.owned_agency.id)
            elif hasattr(user, 'profile'):
                return Agency.objects.get(slug=slug, id=user.profile.agency.id)
        except Agency.DoesNotExist:
            return None

    def get(self, request, slug):
        agency = self.get_agency(slug)
        if not agency:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = AgencySettingsSerializer(agency.agency_settings)
        return Response(serializer.data)

    def put(self, request, slug):
        agency = self.get_agency(slug)
        if not agency:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = AgencySettingsSerializer(
            agency.agency_settings,
            data=request.data,
            partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserProfileViewSet(viewsets.ModelViewSet):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'owned_agency'):
            return UserProfile.objects.filter(agency=user.owned_agency)
        elif hasattr(user, 'profile'):
            return UserProfile.objects.filter(agency=user.profile.agency)
        return UserProfile.objects.none()

    def perform_create(self, serializer):
        agency = self.request.user.owned_agency
        serializer.save(agency=agency)
