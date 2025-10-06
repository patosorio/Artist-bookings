# bookings/signals.py

from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from django.utils import timezone
from .models import Booking


@receiver(pre_save, sender=Booking)
def update_invoice_statuses(sender, instance, **kwargs):
    """
    Automatically update invoice statuses based on due dates.
    Mark invoices as overdue if past due date and not paid.
    """
    if not instance.pk:
        # Skip for new instances
        return
    
    today = timezone.now().date()
    
    # Check artist fee invoice
    if (instance.artist_fee_invoice_status == Booking.InvoiceStatus.SENT and
        instance.artist_fee_invoice_due_date and
        instance.artist_fee_invoice_due_date < today):
        instance.artist_fee_invoice_status = Booking.InvoiceStatus.OVERDUE
    
    # Check booking fee invoice
    if (instance.booking_fee_invoice_status == Booking.InvoiceStatus.SENT and
        instance.booking_fee_invoice_due_date and
        instance.booking_fee_invoice_due_date < today):
        instance.booking_fee_invoice_status = Booking.InvoiceStatus.OVERDUE


@receiver(pre_save, sender=Booking)
def auto_complete_booking(sender, instance, **kwargs):
    """
    Automatically mark booking as completed if:
    - Booking date has passed
    - Contract is signed
    - All invoices are paid
    - Not cancelled
    """
    if (instance.booking_date < timezone.now() and
        instance.contract_status == Booking.ContractStatus.SIGNED and
        instance.artist_fee_invoice_status == Booking.InvoiceStatus.PAID and
        instance.booking_fee_invoice_status == Booking.InvoiceStatus.PAID and
        not instance.is_cancelled and
        instance.status != Booking.BookingStatus.COMPLETED):
        instance.status = Booking.BookingStatus.COMPLETED


@receiver(post_save, sender=Booking)
def log_booking_changes(sender, instance, created, **kwargs):
    """
    Log important booking changes for audit trail.
    This is a placeholder for future audit logging implementation.
    """
    if created:
        # Log booking creation
        # TODO: Implement audit logging system
        pass
    else:
        # Log booking updates
        # TODO: Track what fields changed
        pass


@receiver(pre_save, sender=Booking)
def validate_cancellation(sender, instance, **kwargs):
    """
    Ensure cancellation fields are properly set when cancelling.
    """
    if instance.is_cancelled:
        if not instance.cancellation_date:
            instance.cancellation_date = timezone.now()
        if instance.status != Booking.BookingStatus.CANCELLED:
            instance.status = Booking.BookingStatus.CANCELLED


@receiver(pre_save, sender=Booking)
def sync_invoice_dates(sender, instance, **kwargs):
    """
    Automatically set invoice sent dates when status changes to 'sent'.
    """
    if not instance.pk:
        return
    
    # Get the old instance from database
    try:
        old_instance = Booking.objects.get(pk=instance.pk)
    except Booking.DoesNotExist:
        return
    
    # Artist fee invoice
    if (instance.artist_fee_invoice_status == Booking.InvoiceStatus.SENT and
        old_instance.artist_fee_invoice_status != Booking.InvoiceStatus.SENT and
        not instance.artist_fee_invoice_sent_date):
        instance.artist_fee_invoice_sent_date = timezone.now()
    
    # Booking fee invoice
    if (instance.booking_fee_invoice_status == Booking.InvoiceStatus.SENT and
        old_instance.booking_fee_invoice_status != Booking.InvoiceStatus.SENT and
        not instance.booking_fee_invoice_sent_date):
        instance.booking_fee_invoice_sent_date = timezone.now()
    
    # Contract
    if (instance.contract_status == Booking.ContractStatus.SENT and
        old_instance.contract_status != Booking.ContractStatus.SENT and
        not instance.contract_sent_date):
        instance.contract_sent_date = timezone.now()
    
    if (instance.contract_status == Booking.ContractStatus.SIGNED and
        old_instance.contract_status != Booking.ContractStatus.SIGNED and
        not instance.contract_signed_date):
        instance.contract_signed_date = timezone.now()