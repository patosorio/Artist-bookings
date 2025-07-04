from django.contrib import admin
from .models import Artist, ArtistMember, ArtistNote, ArtistSocialLinks

@admin.register(Artist)
class ArtistAdmin(admin.ModelAdmin):
    list_display = ('artist_name', 'artist_type', 'agency', 'status', 'is_active', 'email')
    list_filter = ('artist_type', 'status', 'is_active', 'agency')
    search_fields = ('artist_name', 'email')
    readonly_fields = ('created_at', 'updated_at')
    raw_id_fields = ('agency', 'created_by', 'updated_by')

@admin.register(ArtistMember)
class ArtistMemberAdmin(admin.ModelAdmin):
    list_display = ('passport_name', 'artist', 'agency', 'country_of_residence', 'is_onboarded')
    list_filter = ('country_of_residence', 'payment_method', 'agency')
    search_fields = ('passport_name', 'passport_number')
    readonly_fields = ('created_at', 'updated_at')
    raw_id_fields = ('artist', 'agency')

@admin.register(ArtistNote)
class ArtistNoteAdmin(admin.ModelAdmin):
    list_display = ('artist', 'created_by', 'color', 'created_at')
    list_filter = ('color', 'agency')
    search_fields = ('content', 'artist__artist_name')
    readonly_fields = ('created_at', 'updated_at')
    raw_id_fields = ('artist', 'agency', 'created_by')

@admin.register(ArtistSocialLinks)
class ArtistSocialLinksAdmin(admin.ModelAdmin):
    list_display = ('artist', 'instagram_url', 'soundcloud_url')
    search_fields = ('artist__artist_name',)
    raw_id_fields = ('artist',)
