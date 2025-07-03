from django.shortcuts import render

from rest_framework import status, viewsets, permissions
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import transaction
from .serializers import AgencySerializer, AgencyBusinessDetailsSerializer, AgencySettingsSerializer, UserProfileSerializer
from .models import Agency, AgencyBusinessDetails, AgencySettings, UserProfile
from authentication.models import User


class AgencyViewSet(viewsets.ModelViewSet):
    serializer_class = AgencySerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'slug'

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'owned_agency'):
            return Agency.objects.filter(id=user.owned_agency.id)
        elif hasattr(user, 'profile'):
            return Agency.objects.filter(id=user.profile.agency.id)
        return Agency.objects.none()

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=['get', 'put'])
    def business_details(self, request, slug=None):
        agency = self.get_object()
        if request.method == 'GET':
            serializer = AgencyBusinessDetailsSerializer(agency.business_details)
            return Response(serializer.data)
        
        serializer = AgencyBusinessDetailsSerializer(
            agency.business_details,
            data=request.data,
            partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get', 'put'])
    def settings(self, request, slug=None):
        agency = self.get_object()
        if request.method == 'GET':
            serializer = AgencySettingsSerializer(agency.agency_settings)
            return Response(serializer.data)
        
        serializer = AgencySettingsSerializer(
            agency.agency_settings,
            data=request.data,
            partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def users(self, request, slug=None):
        agency = self.get_object()
        users = agency.users.all()
        serializer = UserProfileSerializer(users, many=True)
        return Response(serializer.data)


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
