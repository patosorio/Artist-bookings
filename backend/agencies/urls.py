from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'agencies', views.AgencyViewSet, basename='agency')
router.register(r'users', views.UserProfileViewSet, basename='agency-user')

urlpatterns = [
    path('', include(router.urls)),
]