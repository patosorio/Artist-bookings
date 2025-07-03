from django.apps import AppConfig


class AuthenticationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'authentication'

    def ready(self):
        """Initialize Firebase Admin SDK when Django starts"""
        from config.firebase.firebase import initialize_firebase
        initialize_firebase()
