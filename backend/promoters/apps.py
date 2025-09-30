from django.apps import AppConfig


class PromotersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'promoters'
    verbose_name = 'Promoters'
    
    def ready(self):
        """Initialize app when Django starts."""
        # Import signals if we add any later
        # import promoters.signals
        pass
