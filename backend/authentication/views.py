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
from rest_framework import viewsets
from rest_framework.views import APIView
from django.db import transaction
from django.core.cache import cache

logger = logging.getLogger(__name__)
User = get_user_model()

@api_view(["POST"])
@permission_classes([AllowAny])
@authentication_classes([])
def register_user(request):
    """
    Register user with Firebase token verification
    Optimized with database transaction and get_or_create
    """
    token = request.data.get("token")
    if not token:
        return Response(
            {"detail": "Missing Firebase token."}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        # Verify Firebase token
        decoded_token = auth.verify_id_token(token)
        firebase_uid = decoded_token["uid"]
        email = decoded_token.get("email")
        email_verified = decoded_token.get("email_verified", False)

        # Use get_or_create to handle race conditions atomically
        with transaction.atomic():
            user, created = User.objects.get_or_create(
                firebase_uid=firebase_uid,
                defaults={
                    'username': email.split('@')[0] if email else firebase_uid,
                    'email': email,
                    'is_email_verified': email_verified
                }
            )
        
        response_data = {
            "user": {
                "id": user.id,
                "email": user.email,
                "is_email_verified": user.is_email_verified
            }
        }

        if created:
            response_data["detail"] = "Registration successful."
            return Response(response_data, status=status.HTTP_201_CREATED)
        else:
            response_data["detail"] = "User already registered."
            return Response(response_data, status=status.HTTP_200_OK)

    except Exception as e:
            logger.error(f"Registration failed: {str(e)}")
            return Response(
                {"detail": "Registration failed. Please try again."}, 
                status=status.HTTP_400_BAD_REQUEST
            )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_email(request):
    """
    Mark user's email as verified after Firebase email verification
    """
    try:
        updated_count = User.objects.filter(
            id=request.user.id
        ).update(is_email_verified=True)
        
        if updated_count:
            return Response({
                "message": "Email verification status updated successfully",
                "is_verified": True
            })
        else:
            return Response({
                "detail": "User not found"
            }, status=status.HTTP_404_NOT_FOUND)

    except Exception as e:
        logger.error(f"Email verification failed: {str(e)}")
        return Response({
            "detail": "Failed to update email verification status"
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """
    Returns user profile information including agency details and role.
    """
    try:
        cache_key = f"user_profile_{request.user.id}"
        profile_data = cache.get(cache_key)
        
        if profile_data is None:
            user = request.user
            
            # Get agency information
            agency = None
            role = None
            
            if hasattr(user, 'owned_agency'):
                agency = {
                    'id': user.owned_agency.id,
                    'name': user.owned_agency.name,
                    'slug': user.owned_agency.slug
                }
            
            # Get user profile if it exists
            if hasattr(user, 'profile'):
                role = user.profile.role
                if not agency and user.profile.agency:
                    agency = {
                        'id': user.profile.agency.id,
                        'name': user.profile.agency.name,
                        'slug': user.profile.agency.slug
                    }
            
            profile_data = {
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "is_email_verified": user.is_email_verified,
                "role": role,
                "agency": agency
            }
            cache.set(cache_key, profile_data, 300)
        
        return Response(profile_data)

    except Exception as e:
        logger.error(f"Profile fetch failed: {str(e)}")
        return Response(
            {"detail": "Failed to fetch user profile"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_verification_email(request):
    """
    Send verification email to the user via Firebase
    """
    try:
        # Rate limiting check - prevent spam
        cache_key = f"verification_email_{request.user.id}"
        last_sent = cache.get(cache_key)

        if last_sent:
            return Response({
                "detail": "Verification email already sent recently. Please wait before requesting another.",
                "retry_after": 60  # seconds
            }, status=status.HTTP_429_TOO_MANY_REQUESTS)
        
        # Get Firebase user
        firebase_user = auth.get_user(request.user.firebase_uid)

        # Check if email is already verified
        if firebase_user.email_verified:
            # Update local database
            User.objects.filter(id=request.user.id).update(is_email_verified=True)
            
            return Response({
                "message": "Email is already verified",
                "is_verified": True
            })
        
        # Validate continue URL
        continue_url = request.data.get('continueUrl', 'http://localhost:3000/auth/verify-email')
        
        # Validate URL format for security
        if not continue_url.startswith(('http://localhost', 'https://localhost', 'https://')):
            continue_url = 'http://localhost:3000/auth/verify-email'

        # Generate email verification link
        action_code_settings = auth.ActionCodeSettings(
            url=continue_url,
            handle_code_in_app=True
        )
        
        # Send verification email
        verification_link = auth.generate_email_verification_link(
            firebase_user.email,
            action_code_settings=action_code_settings
        )

        # Set rate limit cache (1 minute)
        cache.set(cache_key, True, 60)

        # Log the action for audit
        logger.info(f"Verification email sent to user {request.user.id} ({firebase_user.email})")
        
        return Response({
            "message": "Verification email sent successfully",
            "email": firebase_user.email,
            "link": verification_link if request.user.is_staff else None  # Only show link to staff
        })

    except auth.UserNotFoundError:
        logger.error(f"Firebase user not found for user {request.user.id}")
        return Response({
            "detail": "User not found in Firebase. Please contact support."
        }, status=status.HTTP_404_NOT_FOUND)
        
    except auth.FirebaseError as e:
        logger.error(f"Firebase error sending verification email: {str(e)}")
        return Response({
            "detail": "Failed to send verification email. Please try again later."
        }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        
    except Exception as e:
        logger.error(f"Unexpected error sending verification email: {str(e)}")
        return Response({
            "detail": "An unexpected error occurred. Please try again."
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
