from firebase_admin import auth as firebase_auth
from firebase_admin.auth import InvalidIdTokenError
import logging
from django.contrib.auth import get_user_model

User = get_user_model()

logger = logging.getLogger(__name__)

def verify_firebase_token(id_token: str):
    """
    Verify Firebase ID token and return decoded token data.
    Raises exception if token is invalid.
    """
    try:
        return firebase_auth.verify_id_token(id_token)
    except InvalidIdTokenError as e:
        logger.error(f"Invalid Firebase token: {str(e)}")
        raise Exception("Invalid Firebase token")
    except Exception as e:
        logger.error(f"Failed to verify token: {str(e)}")
        raise Exception(f"Failed to verify token: {str(e)}")