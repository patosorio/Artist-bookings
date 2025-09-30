from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create a router for the venue endpoints
router = DefaultRouter()
router.register(r'venues', views.VenueViewSet, basename='venue')

urlpatterns = [
    path('', include(router.urls)),
]