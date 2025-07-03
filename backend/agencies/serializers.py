from rest_framework import serializers
from django_countries.serializers import CountryFieldMixin
from .models import Agency, AgencyBusinessDetails, AgencySettings, UserProfile
from authentication.models import User


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
        
        agency = Agency.objects.create(**validated_data)
        
        if business_details_data:
            AgencyBusinessDetails.objects.create(agency=agency, **business_details_data)
        else:
            AgencyBusinessDetails.objects.create(agency=agency)
            
        if agency_settings_data:
            AgencySettings.objects.create(agency=agency, **agency_settings_data)
        else:
            AgencySettings.objects.create(agency=agency)
            
        return agency