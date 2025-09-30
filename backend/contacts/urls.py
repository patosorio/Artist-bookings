from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create a router for the contact endpoints
router = DefaultRouter()
router.register(r'contacts', views.ContactViewSet, basename='contact')

urlpatterns = [
    path('', include(router.urls)),
]