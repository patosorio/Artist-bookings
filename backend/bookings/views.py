# bookings/views.py

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Sum, Avg, Count, Case, When, IntegerField
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
from django_filters.rest_framework import DjangoFilterBackend

from .models import Booking, BookingType
from .serializers import (
    BookingTypeSerializer,
    BookingListSerializer,
    BookingDetailSerializer,
    BookingCreateSerializer,
    BookingUpdateSerializer,
    BookingStatsSerializer
)
try:
    from .serializers import EnrichedBookingDetailSerializer
except ImportError:
    EnrichedBookingDetailSerializer = BookingDetailSerializer
from agencies.permissions import IsAgencyMember


class BookingTypeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing booking types.
    
    Endpoints:
    - GET /api/booking-types/ - List all booking types
    - POST /api/booking-types/ - Create new booking type
    - GET /api/booking-types/{id}/ - Retrieve booking type details
    - PUT /api/booking-types/{id}/ - Update booking type
    - PATCH /api/booking-types/{id}/ - Partial update booking type
    - DELETE /api/booking-types/{id}/ - Delete booking type
    """
    
    queryset = BookingType.objects.all()
    serializer_class = BookingTypeSerializer
    permission_classes = [IsAuthenticated, IsAgencyMember]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']
    
    def get_queryset(self):
        """Filter booking types by user's agency."""
        if hasattr(self.request.user, 'userprofile'):
            return BookingType.objects.filter(
                agency=self.request.user.userprofile.agency
            )
        return BookingType.objects.none()
    
    def perform_create(self, serializer):
        """Set agency from user profile on creation."""
        serializer.save(agency=self.request.user.userprofile.agency)


class BookingViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing bookings.
    
    Endpoints:
    - GET /api/bookings/ - List all bookings
    - POST /api/bookings/ - Create new booking
    - GET /api/bookings/{id}/ - Retrieve booking details
    - PUT /api/bookings/{id}/ - Update booking
    - PATCH /api/bookings/{id}/ - Partial update booking
    - DELETE /api/bookings/{id}/ - Delete booking
    
    Custom Actions:
    - GET /api/bookings/stats/ - Get booking statistics
    - GET /api/bookings/upcoming/ - List upcoming bookings
    - GET /api/bookings/calendar/ - Calendar view of bookings
    - GET /api/bookings/{id}/timeline/ - Booking timeline/history
    - POST /api/bookings/{id}/confirm/ - Confirm booking
    - POST /api/bookings/{id}/cancel/ - Cancel booking
    - POST /api/bookings/{id}/send_contract/ - Mark contract as sent
    - POST /api/bookings/{id}/mark_contract_signed/ - Mark contract as signed
    - POST /api/bookings/{id}/send_artist_invoice/ - Send artist fee invoice
    - POST /api/bookings/{id}/mark_artist_paid/ - Mark artist as paid
    - POST /api/bookings/{id}/send_booking_invoice/ - Send booking fee invoice
    - POST /api/bookings/{id}/mark_booking_paid/ - Mark booking fee as paid
    """
    
    permission_classes = [IsAuthenticated, IsAgencyMember]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter
    ]
    search_fields = [
        'booking_reference',
        'event_name',
        'location_city',
        'notes'
    ]
    filterset_fields = [
        'status',
        'contract_status',
        'artist_fee_invoice_status',
        'booking_fee_invoice_status',
        'is_cancelled',
        'is_private',
        'location_country',
        'deal_type'
    ]
    ordering_fields = [
        'booking_date',
        'created_at',
        'guarantee_amount',
        'status'
    ]
    ordering = ['-booking_date']
    
    def get_queryset(self):
        """Filter bookings by user's agency with optimizations."""
        if not hasattr(self.request.user, 'userprofile'):
            return Booking.objects.none()
        
        queryset = Booking.objects.filter(
            agency=self.request.user.userprofile.agency
        ).select_related('booking_type')
        
        # Apply custom filters
        artist_id = self.request.query_params.get('artist_id')
        if artist_id:
            queryset = queryset.filter(artist_id=artist_id)
        
        promoter_id = self.request.query_params.get('promoter_id')
        if promoter_id:
            queryset = queryset.filter(promoter_id=promoter_id)
        
        venue_id = self.request.query_params.get('venue_id')
        if venue_id:
            queryset = queryset.filter(venue_id=venue_id)
        
        # Date range filters
        date_from = self.request.query_params.get('date_from')
        if date_from:
            queryset = queryset.filter(booking_date__gte=date_from)
        
        date_to = self.request.query_params.get('date_to')
        if date_to:
            queryset = queryset.filter(booking_date__lte=date_to)
        
        # Status filters
        show_cancelled = self.request.query_params.get('show_cancelled', 'false')
        if show_cancelled.lower() != 'true':
            queryset = queryset.filter(is_cancelled=False)
        
        return queryset
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'list':
            return BookingListSerializer
        elif self.action == 'create':
            return BookingCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return BookingUpdateSerializer
        elif self.action == 'enriched_detail':
            return EnrichedBookingDetailSerializer
        return BookingDetailSerializer
    
    def perform_create(self, serializer):
        """Set agency from user profile on creation."""
        serializer.save(agency=self.request.user.userprofile.agency)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Get comprehensive booking statistics.
        
        Query Parameters:
        - date_from: Filter stats from this date
        - date_to: Filter stats to this date
        - artist_id: Filter by specific artist
        """
        queryset = self.get_queryset()
        
        # Apply date filters if provided
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        
        if date_from:
            queryset = queryset.filter(booking_date__gte=date_from)
        if date_to:
            queryset = queryset.filter(booking_date__lte=date_to)
        
        # Calculate statistics
        stats = queryset.aggregate(
            total_bookings=Count('id'),
            confirmed_bookings=Count(
                Case(
                    When(status=Booking.BookingStatus.CONFIRMED, then=1),
                    output_field=IntegerField()
                )
            ),
            pending_bookings=Count(
                Case(
                    When(
                        status__in=[
                            Booking.BookingStatus.OPTION,
                            Booking.BookingStatus.HOLD,
                            Booking.BookingStatus.PENDING
                        ],
                        then=1
                    ),
                    output_field=IntegerField()
                )
            ),
            cancelled_bookings=Count(
                Case(
                    When(is_cancelled=True, then=1),
                    output_field=IntegerField()
                )
            ),
            total_revenue=Sum('guarantee_amount') or Decimal('0.00'),
            total_booking_fees=Sum('booking_fee_amount') or Decimal('0.00'),
            avg_guarantee=Avg('guarantee_amount') or Decimal('0.00')
        )
        
        # Calculate overdue invoices
        stats['overdue_invoices'] = queryset.filter(
            Q(artist_fee_invoice_status=Booking.InvoiceStatus.OVERDUE) |
            Q(booking_fee_invoice_status=Booking.InvoiceStatus.OVERDUE)
        ).count()
        
        # Calculate upcoming shows (next 30 days)
        upcoming_date = timezone.now() + timedelta(days=30)
        stats['upcoming_shows'] = queryset.filter(
            booking_date__gte=timezone.now(),
            booking_date__lte=upcoming_date,
            is_cancelled=False
        ).count()
        
        # Calculate pending contracts
        stats['contracts_pending'] = queryset.filter(
            contract_status=Booking.ContractStatus.PENDING
        ).count()
        
        serializer = BookingStatsSerializer(stats)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming bookings (next 90 days by default)."""
        days = int(request.query_params.get('days', 90))
        upcoming_date = timezone.now() + timedelta(days=days)
        
        queryset = self.get_queryset().filter(
            booking_date__gte=timezone.now(),
            booking_date__lte=upcoming_date,
            is_cancelled=False
        ).order_by('booking_date')
        
        serializer = BookingListSerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def calendar(self, request):
        """
        Get bookings formatted for calendar view.
        
        Query Parameters:
        - year: Year to fetch (default: current year)
        - month: Month to fetch (default: current month)
        """
        now = timezone.now()
        year = int(request.query_params.get('year', now.year))
        month = int(request.query_params.get('month', now.month))
        
        queryset = self.get_queryset().filter(
            booking_date__year=year,
            booking_date__month=month
        ).order_by('booking_date')
        
        # Group by date
        calendar_data = {}
        for booking in queryset:
            date_key = booking.booking_date.date().isoformat()
            if date_key not in calendar_data:
                calendar_data[date_key] = []
            
            calendar_data[date_key].append({
                'id': str(booking.id),
                'booking_reference': booking.booking_reference,
                'time': booking.booking_date.time().isoformat(),
                'event_name': booking.event_name,
                'status': booking.status,
                'artist_id': booking.artist_id,
                'venue_id': booking.venue_id,
                'location_city': booking.location_city,
                'is_cancelled': booking.is_cancelled
            })
        
        return Response(calendar_data)
    
    @action(detail=True, methods=['get'])
    def timeline(self, request, pk=None):
        """Get booking timeline showing all status changes and updates."""
        booking = self.get_object()
        
        timeline = []
        
        # Creation
        timeline.append({
            'date': booking.created_at,
            'event': 'Booking Created',
            'type': 'creation',
            'user': booking.created_by.user.get_full_name() if booking.created_by else None
        })
        
        # Contract events
        if booking.contract_sent_date:
            timeline.append({
                'date': booking.contract_sent_date,
                'event': 'Contract Sent',
                'type': 'contract'
            })
        
        if booking.contract_signed_date:
            timeline.append({
                'date': booking.contract_signed_date,
                'event': 'Contract Signed',
                'type': 'contract'
            })
        
        # Artist invoice events
        if booking.artist_fee_invoice_sent_date:
            timeline.append({
                'date': booking.artist_fee_invoice_sent_date,
                'event': 'Artist Invoice Sent',
                'type': 'invoice'
            })
        
        if booking.artist_fee_invoice_paid_date:
            timeline.append({
                'date': booking.artist_fee_invoice_paid_date,
                'event': 'Artist Paid',
                'type': 'payment'
            })
        
        # Booking fee invoice events
        if booking.booking_fee_invoice_sent_date:
            timeline.append({
                'date': booking.booking_fee_invoice_sent_date,
                'event': 'Booking Fee Invoice Sent',
                'type': 'invoice'
            })
        
        if booking.booking_fee_invoice_paid_date:
            timeline.append({
                'date': booking.booking_fee_invoice_paid_date,
                'event': 'Booking Fee Paid',
                'type': 'payment'
            })
        
        # Cancellation
        if booking.cancellation_date:
            timeline.append({
                'date': booking.cancellation_date,
                'event': 'Booking Cancelled',
                'type': 'cancellation',
                'reason': booking.cancellation_reason
            })
        
        # Sort by date
        timeline.sort(key=lambda x: x['date'], reverse=True)
        
        return Response(timeline)
    
    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """Confirm a booking."""
        booking = self.get_object()
        
        if booking.is_cancelled:
            return Response(
                {'error': 'Cannot confirm a cancelled booking.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        booking.status = Booking.BookingStatus.CONFIRMED
        booking.updated_by = request.user.userprofile
        booking.save()
        
        serializer = self.get_serializer(booking)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a booking."""
        booking = self.get_object()
        reason = request.data.get('reason', '')
        
        if not reason:
            return Response(
                {'error': 'Cancellation reason is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        booking.is_cancelled = True
        booking.cancellation_reason = reason
        booking.cancellation_date = timezone.now()
        booking.status = Booking.BookingStatus.CANCELLED
        booking.updated_by = request.user.userprofile
        booking.save()
        
        serializer = self.get_serializer(booking)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def send_contract(self, request, pk=None):
        """Mark contract as sent."""
        booking = self.get_object()
        
        booking.contract_status = Booking.ContractStatus.SENT
        booking.contract_sent_date = timezone.now()
        booking.updated_by = request.user.userprofile
        booking.save()
        
        serializer = self.get_serializer(booking)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_contract_signed(self, request, pk=None):
        """Mark contract as signed."""
        booking = self.get_object()
        
        if not booking.contract_sent_date:
            return Response(
                {'error': 'Contract must be sent before marking as signed.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        booking.contract_status = Booking.ContractStatus.SIGNED
        booking.contract_signed_date = timezone.now()
        booking.updated_by = request.user.userprofile
        booking.save()
        
        serializer = self.get_serializer(booking)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def send_artist_invoice(self, request, pk=None):
        """Send artist fee invoice."""
        booking = self.get_object()
        due_date = request.data.get('due_date')
        
        booking.artist_fee_invoice_status = Booking.InvoiceStatus.SENT
        booking.artist_fee_invoice_sent_date = timezone.now()
        if due_date:
            booking.artist_fee_invoice_due_date = due_date
        booking.updated_by = request.user.userprofile
        booking.save()
        
        serializer = self.get_serializer(booking)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_artist_paid(self, request, pk=None):
        """Mark artist as paid."""
        booking = self.get_object()
        
        if not booking.artist_fee_invoice_sent_date:
            return Response(
                {'error': 'Invoice must be sent before marking as paid.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        booking.artist_fee_invoice_status = Booking.InvoiceStatus.PAID
        booking.artist_fee_invoice_paid_date = timezone.now()
        booking.updated_by = request.user.userprofile
        booking.save()
        
        serializer = self.get_serializer(booking)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def send_booking_invoice(self, request, pk=None):
        """Send booking fee invoice to promoter."""
        booking = self.get_object()
        due_date = request.data.get('due_date')
        
        booking.booking_fee_invoice_status = Booking.InvoiceStatus.SENT
        booking.booking_fee_invoice_sent_date = timezone.now()
        if due_date:
            booking.booking_fee_invoice_due_date = due_date
        booking.updated_by = request.user.userprofile
        booking.save()
        
        serializer = self.get_serializer(booking)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_booking_paid(self, request, pk=None):
        """Mark booking fee as paid."""
        booking = self.get_object()
        
        if not booking.booking_fee_invoice_sent_date:
            return Response(
                {'error': 'Invoice must be sent before marking as paid.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        booking.booking_fee_invoice_status = Booking.InvoiceStatus.PAID
        booking.booking_fee_invoice_paid_date = timezone.now()
        booking.updated_by = request.user.userprofile
        booking.save()
        
        serializer = self.get_serializer(booking)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def enriched_detail(self, request, pk=None):
        """
        Get enriched booking details optimized for frontend detail page.
        Includes all nested data structures in a single response.
        """
        booking = self.get_object()
        serializer = EnrichedBookingDetailSerializer(booking)
        return Response(serializer.data)