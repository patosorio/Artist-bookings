from django.apps import AppConfig


class BookingsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'bookings'
    verbose_name = 'Bookings Management'

    def ready(self):
        """Initialize app when Django starts."""
        import bookings.signals
