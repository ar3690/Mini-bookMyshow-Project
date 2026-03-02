import uuid
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags

from django.views.decorators.csrf import ensure_csrf_cookie
from django.contrib.auth import authenticate, login, logout
from django.core.mail import send_mail
from django.db import transaction
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from .models import City, Movie, Showtime, Booking, Payment
from .serializers import RegisterSerializer, CitySerializer, MovieSerializer, ShowtimeSerializer, BookingSerializer

@ensure_csrf_cookie
@api_view(["GET"])
@permission_classes([AllowAny])
def csrf_ping(request):
    return Response({"detail": "CSRF cookie set"})

@api_view(["POST"])
@permission_classes([AllowAny])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({"id": user.id, "username": user.username, "email": user.email})
    return Response(serializer.errors, status=400)

@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    user = authenticate(
        request,
        username=request.data.get("username"),
        password=request.data.get("password"),
    )
    if not user:
        return Response({"detail": "Invalid credentials"}, status=400)
    login(request, user)
    return Response({"id": user.id, "username": user.username, "email": user.email})

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    logout(request)
    return Response({"detail": "Logged out"})

@api_view(["GET"])
@permission_classes([AllowAny])
def me_view(request):
    if not request.user.is_authenticated:
        return Response({"authenticated": False})
    return Response({
        "authenticated": True,
        "id": request.user.id,
        "username": request.user.username,
        "email": request.user.email
    })

@api_view(["GET"])
@permission_classes([AllowAny])
def cities_view(request):
    return Response(CitySerializer(City.objects.all().order_by("name"), many=True).data)

@api_view(["GET"])
@permission_classes([AllowAny])
def movies_by_city(request, city_id):
    qs = Movie.objects.filter(theaters__city_id=city_id).distinct().order_by("title")
    return Response(MovieSerializer(qs, many=True).data)

@api_view(["GET"])
@permission_classes([AllowAny])
def showtimes_by_city_movie(request, city_id, movie_id):
    qs = Showtime.objects.filter(theater__city_id=city_id, movie_id=movie_id).select_related("theater", "movie").order_by("start_time")
    return Response(ShowtimeSerializer(qs, many=True).data)

@api_view(["GET"])
@permission_classes([AllowAny])
def showtime_detail(request, showtime_id):
    st = Showtime.objects.select_related("theater", "movie").get(id=showtime_id)
    return Response(ShowtimeSerializer(st).data)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def checkout_view(request):
    """
    Dummy payment:
    { showtime_id: int, seats: [1,2], amount: int }
    """
    showtime_id = request.data.get("showtime_id")
    seats = request.data.get("seats", [])
    amount = int(request.data.get("amount", 0))

    if not showtime_id or not isinstance(seats, list) or len(seats) == 0:
        return Response({"detail": "showtime_id and seats are required"}, status=400)

    seats = sorted(list(set([int(s) for s in seats])))

    with transaction.atomic():
        showtime = Showtime.objects.select_for_update().select_related("theater", "movie").get(id=showtime_id)

        if any(s < 1 or s > showtime.total_seats for s in seats):
            return Response({"detail": "Invalid seat number"}, status=400)

        already = set(showtime.booked_seats or [])
        if any(s in already for s in seats):
            return Response({"detail": "Some selected seats are already booked"}, status=409)

        showtime.booked_seats = sorted(list(already.union(seats)))
        showtime.save()

        payment = Payment.objects.create(user=request.user, amount=amount, status="SUCCESS")
        booking_code = "BMS-" + uuid.uuid4().hex[:10].upper()

        booking = Booking.objects.create(
            user=request.user,
            showtime=showtime,
            seats=seats,
            booking_id=booking_code,
            payment=payment,
            status="confirmed",
        )

    # email confirmation (console)
    if request.user.email:
        subject = f"🎟 Booking Confirmed - {booking.booking_id}"

    html_content = f"""
    <div style="font-family: Arial, sans-serif; padding:20px;">
        <h2 style="color:#e23744;">🎬 Booking Confirmation</h2>
        <p>Hello <strong>{request.user.username}</strong>,</p>
        <p>Your ticket has been successfully booked!</p>

        <hr>

        <p><strong>Booking ID:</strong> {booking.booking_id}</p>
        <p><strong>Movie:</strong> {showtime.movie.title}</p>
        <p><strong>Theater:</strong> {showtime.theater.name}</p>
        <p><strong>City:</strong> {showtime.theater.city.name}</p>
        <p><strong>Showtime:</strong> {showtime.start_time}</p>
        <p><strong>Seats:</strong> {', '.join(map(str, seats))}</p>
        <p><strong>Total Paid:</strong> ₹{amount}</p>

        <hr>

        <p style="color:gray;">Enjoy your movie 🍿</p>
        <p style="color:#e23744;"><strong>BookMyShow</strong></p>
    </div>
    """

    text_content = strip_tags(html_content)

    email = EmailMultiAlternatives(
        subject,
        text_content,
        None,
        [request.user.email]
    )
    email.attach_alternative(html_content, "text/html")
    email.send()

    return Response({"detail": "Payment Successful", "booking_id": booking.booking_id})

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_bookings_view(request):
    qs = Booking.objects.filter(user=request.user).select_related(
        "showtime__movie", "showtime__theater", "showtime__theater__city", "payment"
    ).order_by("-created_at")
    return Response(BookingSerializer(qs, many=True).data)