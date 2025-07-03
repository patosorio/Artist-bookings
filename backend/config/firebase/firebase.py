import os
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials
from pathlib import Path

load_dotenv()

def initialize_firebase():
    """Initialize Firebase Admin SDK"""
    try:
        # Check if already initialized
        if len(firebase_admin._apps) > 0:
            return

        # Get the path to the service account key file
        base_dir = Path(__file__).resolve().parent.parent.parent
        cred_path = os.path.join(base_dir, 'config', 'firebase', 'service-account.json')

        if not os.path.exists(cred_path):
            raise FileNotFoundError(
                f"Firebase service account key not found at {cred_path}. "
                "Please download it from Firebase Console > Project Settings > Service Accounts"
            )

        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
    except Exception as e:
        print(f"Failed to initialize Firebase: {str(e)}")
        raise

def get_firebase_admin_app():
    return firebase_admin.get_app()