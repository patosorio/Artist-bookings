from django.apps import AppConfig


class VenuesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'venues'
    verbose_name = 'Venues'
    
    def ready(self):
        """Initialize app when Django starts."""
        # Import signals if we add any later
        # import venues.signals
        pass
