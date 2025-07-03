from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import get_user_model
from .firebase_auth import verify_firebase_token
import logging

logger = logging.getLogger(__name__)
User = get_user_model()

class FirebaseAuthentication(BaseAuthentication):
    def authenticate(self, request):
        # Skip authentication for registration endpoint
        if request.path == "/api/v1/auth/register/":
            return None

        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return None

        token = auth_header.split(" ")[1]
        try:
            # Verify the Firebase token
            decoded_token = verify_firebase_token(token)
            firebase_uid = decoded_token["uid"]
            
            # Get the user from our database
            user = User.objects.filter(firebase_uid=firebase_uid).first()
            if not user:
                logger.warning(f"User with Firebase UID {firebase_uid} not found in database")
                raise AuthenticationFailed("User not registered in the system")
            
            # Store the decoded token for use in the view
            request.auth = decoded_token
            return (user, decoded_token)
        except Exception as e:
            logger.error(f"Authentication failed: {str(e)}")
            raise AuthenticationFailed(str(e))

    def authenticate_header(self, request):
        return 'Bearer'