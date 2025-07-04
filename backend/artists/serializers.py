from typing import Dict, Any
from rest_framework import serializers
from django_countries.serializers import CountryFieldMixin
from .models import Artist, ArtistMember, ArtistNote, ArtistSocialLinks
from agencies.models import Agency, UserProfile

class ArtistMemberSerializer(CountryFieldMixin, serializers.ModelSerializer):
    """Serializer for the ArtistMember model."""
    
    class Meta:
        model = ArtistMember
        fields = [
            'id',
            'passport_name',
            'residential_address',
            'country_of_residence',
            'dob',
            'passport_number',
            'passport_expiry',
            'artist_fee',
            'has_withholding',
            'withholding_percentage',
            'payment_method',
            'bank_beneficiary',
            'bank_account_number',
            'bank_address',
            'bank_swift_code',
            'flight_affiliate_program',
            'country_of_departure',
            'is_onboarded',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data: Dict[str, Any]) -> ArtistMember:
        """Create a new ArtistMember instance."""
        artist = self.context['artist']
        validated_data['artist'] = artist
        validated_data['agency'] = artist.agency
        return super().create(validated_data)

class ArtistNoteSerializer(serializers.ModelSerializer):
    """Serializer for the ArtistNote model."""
    
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = ArtistNote
        fields = [
            'id',
            'content',
            'color',
            'created_by',
            'created_by_name',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

    def get_created_by_name(self, obj: ArtistNote) -> str:
        """Get the name of the note creator."""
        if obj.created_by and obj.created_by.user:
            return obj.created_by.user.get_full_name() or obj.created_by.user.username
        return 'Unknown'

    def create(self, validated_data: Dict[str, Any]) -> ArtistNote:
        """Create a new ArtistNote instance."""
        artist = self.context['artist']
        request = self.context['request']
        validated_data.update({
            'artist': artist,
            'agency': artist.agency,
            'created_by': request.user.userprofile
        })
        return super().create(validated_data)

class ArtistSocialLinksSerializer(serializers.ModelSerializer):
    """Serializer for the ArtistSocialLinks model."""
    
    class Meta:
        model = ArtistSocialLinks
        fields = [
            'instagram_url',
            'soundcloud_url',
            'youtube_url',
            'bandcamp_url'
        ]

class ArtistSerializer(CountryFieldMixin, serializers.ModelSerializer):
    """Serializer for the Artist model."""
    
    members = ArtistMemberSerializer(many=True, read_only=True)
    notes = ArtistNoteSerializer(many=True, read_only=True)
    social_links = ArtistSocialLinksSerializer(read_only=True)
    is_onboarded = serializers.BooleanField(read_only=True)

    class Meta:
        model = Artist
        fields = [
            'id',
            'artist_name',
            'artist_type',
            'country',
            'number_of_members',
            'email',
            'phone',
            'bio',
            'is_active',
            'status',
            'social_links',
            'members',
            'notes',
            'is_onboarded',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data: Dict[str, Any]) -> Artist:
        """Create a new Artist instance."""

        validated_data['is_active'] = validated_data.get('status') == 'active'
        return super().create(validated_data)

    def update(self, instance: Artist, validated_data: Dict[str, Any]) -> Artist:
        """Update an Artist instance."""
        # updated_by is handled in the viewset's perform_update
        if 'status' in validated_data:
            validated_data['is_active'] = validated_data['status'] == 'active'
        return super().update(instance, validated_data) 