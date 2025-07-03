from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from rest_framework import status
from .models import User
from .firebase_auth import verify_firebase_token
import logging
from firebase_admin import auth

logger = logging.getLogger(__name__)

User = get_user_model()

@api_view(["POST"])
@permission_classes([AllowAny])
@authentication_classes([])  # No authentication for registration
def register_user(request):
    try:
        # Get token from request body
        token = request.data.get("token")
        if not token:
            return Response(
                {"detail": "Missing Firebase token."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verify token manually since we're not using authentication class
        try:
            decoded_token = verify_firebase_token(token)
        except Exception as e:
            logger.error(f"Token verification failed: {str(e)}")
            return Response(
                {"detail": "Invalid Firebase token."}, 
                status=status.HTTP_401_UNAUTHORIZED
            )

        firebase_uid = decoded_token["uid"]
        email = decoded_token.get("email")
        email_verified = decoded_token.get("email_verified", False)

        # Check if user already exists
        existing_user = User.objects.filter(firebase_uid=firebase_uid).first()
        if existing_user:
            return Response({
                "detail": "User already registered.",
                "user": {
                    "id": existing_user.id,
                    "email": existing_user.email,
                    "is_email_verified": existing_user.is_email_verified
                }
            }, status=status.HTTP_200_OK)

        # Create new user
        user = User.objects.create(
            firebase_uid=firebase_uid,
            username=email.split('@')[0] if email else firebase_uid,
            email=email,
            is_email_verified=email_verified
        )

        return Response({
            "detail": "Registration successful.",
            "user": {
                "id": user.id,
                "email": user.email,
                "is_email_verified": user.is_email_verified
            }
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        logger.error(f"Registration failed: {str(e)}")
        return Response(
            {"detail": str(e)}, 
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_email(request):
    """
    Mark user's email as verified after Firebase email verification
    """
    try:
        user = request.user
        # Update email verification status
        user.is_email_verified = True
        user.save()
        
        return Response({
            "message": "Email verification status updated successfully",
            "is_verified": True
        })
    except Exception as e:
        return Response({
            "detail": "Failed to update email verification status",
            "error": str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_profile(request):
    try:
        user = request.user
        return Response({
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "is_email_verified": user.is_email_verified
        })
    except Exception as e:
        logger.error(f"Profile fetch failed: {str(e)}")
        return Response(
            {"detail": str(e)}, 
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_verification_email(request):
    """
    Send verification email to the user via Firebase
    """
    try:
        user = auth.get_user_by_uid(request.user.firebase_uid)
        
        # Generate email verification link
        action_code_settings = auth.ActionCodeSettings(
            url=request.data.get('continueUrl', 'http://localhost:3000/auth/verify-email'),
            handle_code_in_app=True
        )
        
        # Send verification email
        link = auth.generate_email_verification_link(
            user.email,
            action_code_settings=action_code_settings
        )
        
        return Response({
            "message": "Verification email sent successfully",
            "link": link
        })
    except Exception as e:
        logger.error(f"Failed to send verification email: {str(e)}")
        return Response({
            "detail": "Failed to send verification email",
            "error": str(e)
        }, status=status.HTTP_400_BAD_REQUEST)