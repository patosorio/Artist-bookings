from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'users', views.UserProfileViewSet, basename='agency-user')

urlpatterns = [
    path('agencies/', views.AgencyView.as_view(), name='agency-list'),
    path('agencies/<str:slug>/', views.AgencyDetailView.as_view(), name='agency-detail'),
    path('agencies/<str:slug>/business-details/', views.AgencyBusinessDetailsView.as_view(), name='agency-business-details'),
    path('agencies/<str:slug>/settings/', views.AgencySettingsView.as_view(), name='agency-settings'),
    path('', include(router.urls)),
]