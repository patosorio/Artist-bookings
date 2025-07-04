from rest_framework import serializers
from django_countries.serializers import CountryFieldMixin
from .models import Agency, AgencyBusinessDetails, AgencySettings, UserProfile
from authentication.models import User
from django.db.models.deletion import ProtectedError
from django.db.utils import IntegrityError
from django.db import transaction
from rest_framework.response import Response
from rest_framework import status


class UserProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['id', 'email', 'role', 'is_active', 'created_at', 'updated_at']


class AgencySettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = AgencySettings
        fields = ['currency', 'language', 'notifications_enabled']


class AgencyBusinessDetailsSerializer(CountryFieldMixin, serializers.ModelSerializer):
    class Meta:
        model = AgencyBusinessDetails
        fields = ['company_name', 'tax_number', 'address', 'town', 'city', 'country']


class AgencySerializer(CountryFieldMixin, serializers.ModelSerializer):
    business_details = AgencyBusinessDetailsSerializer(required=False)
    agency_settings = AgencySettingsSerializer(required=False)
    users = UserProfileSerializer(many=True, read_only=True)
    owner_email = serializers.EmailField(source='owner.email', read_only=True)

    class Meta:
        model = Agency
        fields = [
            'id', 'name', 'owner_email', 'country', 'timezone',
            'website', 'contact_email', 'phone_number',
            'logo', 'slug', 'is_set_up', 'created_at',
            'updated_at', 'business_details', 'agency_settings',
            'users'
        ]
        read_only_fields = ['slug', 'created_at', 'updated_at']

    def create(self, validated_data):
        business_details_data = validated_data.pop('business_details', None)
        agency_settings_data = validated_data.pop('agency_settings', None)
        
        # Set is_set_up based on whether business details are provided
        validated_data['is_set_up'] = bool(
            business_details_data and 
            all(business_details_data.values())
        )
        
        try:
            with transaction.atomic():
                # Check if user already has an agency
                if hasattr(validated_data['owner'], 'owned_agency'):
                    raise serializers.ValidationError(
                        "User already owns an agency"
                    )
                
                agency = Agency.objects.create(**validated_data)
                
                # Always create related objects
                AgencyBusinessDetails.objects.create(
                    agency=agency,
                    **(business_details_data or {})
                )
                AgencySettings.objects.create(
                    agency=agency,
                    **(agency_settings_data or {})
                )

                # Create UserProfile for agency owner
                UserProfile.objects.create(
                    user=validated_data['owner'],
                    agency=agency,
                    role="agency_owner",
                    is_active=True
                )
                
                return agency
                
        except IntegrityError as e:
            raise serializers.ValidationError(
                "Failed to create agency. User might already own one."
            )

def post(self, request):
    """
    Create new agency with transaction safety
    """
    # Check if this is a "setup later" request
    is_setup_later = not request.data.get('business_details')
    
    serializer = AgencySerializer(data=request.data)
    if serializer.is_valid():
        try:
            with transaction.atomic():
                agency = serializer.save(
                    owner=request.user,
                    is_set_up=not is_setup_later  # Set is_set_up to False for setup later
                )
                
            return Response({
                **serializer.data,
                "setup_complete": not is_setup_later
            }, status=status.HTTP_201_CREATED)
            
        except IntegrityError:
            return Response(
                {"detail": "Failed to create agency. User might already own one."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)