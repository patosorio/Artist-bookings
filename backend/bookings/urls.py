from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BookingViewSet, BookingTypeViewSet

app_name = 'bookings'

router = DefaultRouter()
router.register(r'bookings', BookingViewSet, basename='booking')
router.register(r'booking-types', BookingTypeViewSet, basename='bookingtype')

urlpatterns = [
    path('', include(router.urls)),
]
