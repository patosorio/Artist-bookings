from django.urls import path
from .views import user_profile, register_user, verify_email, send_verification_email


urlpatterns = [
    path("register/", register_user, name="register_user"),
    path("verify-email/", verify_email, name="verify_email"),
    path("user/profile/", user_profile, name="user_profile"),
    path("send-verification-email/", send_verification_email, name="send_verification_email"),
]