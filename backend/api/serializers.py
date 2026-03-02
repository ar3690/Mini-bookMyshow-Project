from django.contrib.auth.models import User
from rest_framework import serializers
from .models import City, Theater, Movie, Showtime, Booking

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
        )

class CitySerializer(serializers.ModelSerializer):
    class Meta:
        model = City
        fields = ["id", "name"]

class TheaterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Theater
        fields = ["id", "name", "city"]

class MovieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Movie
        fields = ["id", "title", "description", "genre", "language", "poster_url", "duration_mins"]

class ShowtimeSerializer(serializers.ModelSerializer):
    theater_name = serializers.CharField(source="theater.name", read_only=True)
    movie_title = serializers.CharField(source="movie.title", read_only=True)

    class Meta:
        model = Showtime
        fields = [
            "id", "theater", "theater_name", "movie", "movie_title",
            "start_time", "price", "total_seats", "booked_seats"
        ]

class BookingSerializer(serializers.ModelSerializer):
    movie = serializers.CharField(source="showtime.movie.title", read_only=True)
    theater = serializers.CharField(source="showtime.theater.name", read_only=True)
    city = serializers.CharField(source="showtime.theater.city.name", read_only=True)
    showtime = serializers.DateTimeField(source="showtime.start_time", read_only=True)
    amount = serializers.IntegerField(source="payment.amount", read_only=True)

    class Meta:
        model = Booking
        fields = ["booking_id", "status", "movie", "theater", "city", "showtime", "seats", "amount", "created_at"]