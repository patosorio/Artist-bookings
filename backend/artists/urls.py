from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers
from . import views

# Create a router for the main artist endpoints
router = DefaultRouter()
router.register(r'artists', views.ArtistViewSet, basename='artist')

# Create nested routers for members and notes
artist_router = routers.NestedDefaultRouter(router, r'artists', lookup='artist')
artist_router.register(r'members', views.ArtistMemberViewSet, basename='artist-member')
artist_router.register(r'notes', views.ArtistNoteViewSet, basename='artist-note')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(artist_router.urls)),
]