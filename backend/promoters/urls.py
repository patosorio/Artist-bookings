from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create a router for the promoter endpoints
router = DefaultRouter()
router.register(r'promoters', views.PromoterViewSet, basename='promoter')

urlpatterns = [
    path('', include(router.urls)),
]