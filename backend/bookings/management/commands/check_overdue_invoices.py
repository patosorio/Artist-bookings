from django.core.management.base import BaseCommand
from django.utils import timezone
from bookings.models import Booking


class Command(BaseCommand):
    """
    Management command to check and update overdue invoice statuses.
    
    Usage:
        python manage.py check_overdue_invoices
        
    This command should be run daily via cron job or scheduled task.
    """
    
    help = 'Check and update overdue invoice statuses for all bookings'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be updated without making changes',
        )
        
        parser.add_argument(
            '--agency',
            type=str,
            help='Filter by specific agency ID',
        )
    
    def handle(self, *args, **options):
        """Execute the command."""
        dry_run = options['dry_run']
        agency_id = options.get('agency')
        
        today = timezone.now().date()
        
        # Build base queryset
        queryset = Booking.objects.all()
        
        if agency_id:
            queryset = queryset.filter(agency_id=agency_id)
            self.stdout.write(f'Filtering by agency: {agency_id}')
        
        # Find overdue artist fee invoices
        artist_overdue = queryset.filter(
            artist_fee_invoice_status=Booking.InvoiceStatus.SENT,
            artist_fee_invoice_due_date__lt=today
        )
        
        # Find overdue booking fee invoices
        booking_overdue = queryset.filter(
            booking_fee_invoice_status=Booking.InvoiceStatus.SENT,
            booking_fee_invoice_due_date__lt=today
        )
        
        artist_count = artist_overdue.count()
        booking_count = booking_overdue.count()
        
        self.stdout.write(
            self.style.WARNING(
                f'\nFound {artist_count} overdue artist fee invoice(s)'
            )
        )
        self.stdout.write(
            self.style.WARNING(
                f'Found {booking_count} overdue booking fee invoice(s)'
            )
        )
        
        if dry_run:
            self.stdout.write(
                self.style.NOTICE('\n=== DRY RUN MODE - No changes will be made ===\n')
            )
            
            # Show details of what would be updated
            if artist_count > 0:
                self.stdout.write('\nArtist Fee Invoices that would be marked overdue:')
                for booking in artist_overdue:
                    self.stdout.write(
                        f'  - {booking.booking_reference}: '
                        f'{booking.event_name or "No event name"} '
                        f'(Due: {booking.artist_fee_invoice_due_date})'
                    )
            
            if booking_count > 0:
                self.stdout.write('\nBooking Fee Invoices that would be marked overdue:')
                for booking in booking_overdue:
                    self.stdout.write(
                        f'  - {booking.booking_reference}: '
                        f'{booking.event_name or "No event name"} '
                        f'(Due: {booking.booking_fee_invoice_due_date})'
                    )
        else:
            # Actually update the invoices
            artist_updated = artist_overdue.update(
                artist_fee_invoice_status=Booking.InvoiceStatus.OVERDUE
            )
            booking_updated = booking_overdue.update(
                booking_fee_invoice_status=Booking.InvoiceStatus.OVERDUE
            )
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'\n✓ Updated {artist_updated} artist fee invoice(s) to OVERDUE'
                )
            )
            self.stdout.write(
                self.style.SUCCESS(
                    f'✓ Updated {booking_updated} booking fee invoice(s) to OVERDUE'
                )
            )
        
        # Show summary of all overdue invoices
        total_overdue = Booking.objects.filter(
            artist_fee_invoice_status=Booking.InvoiceStatus.OVERDUE
        ).count() + Booking.objects.filter(
            booking_fee_invoice_status=Booking.InvoiceStatus.OVERDUE
        ).count()
        
        self.stdout.write(
            self.style.WARNING(
                f'\nTotal overdue invoices in system: {total_overdue}'
            )
        )
        
        self.stdout.write(self.style.SUCCESS('\n✓ Command completed successfully\n'))