from django.conf import settings
from django.db import models

class City(models.Model):
    name = models.CharField(max_length=100, unique=True)
    def __str__(self):
        return self.name

class Theater(models.Model):
    name = models.CharField(max_length=150)
    city = models.ForeignKey(City, on_delete=models.CASCADE, related_name="theaters")
    def __str__(self):
        return f"{self.name} ({self.city.name})"

class Movie(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    genre = models.CharField(max_length=80, default="Drama")
    language = models.CharField(max_length=50, default="Malayalam")
    poster_url = models.URLField(blank=True, default="")
    duration_mins = models.PositiveIntegerField(default=120)
    theaters = models.ManyToManyField(Theater, related_name="movies")
    def __str__(self):
        return self.title

class Showtime(models.Model):
    theater = models.ForeignKey(Theater, on_delete=models.CASCADE, related_name="showtimes")
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, related_name="showtimes")
    start_time = models.DateTimeField()
    price = models.PositiveIntegerField(default=150)

    total_seats = models.PositiveIntegerField(default=48)
    booked_seats = models.JSONField(default=list, blank=True)  # [1,2,3]

    class Meta:
        unique_together = ("theater", "movie", "start_time")

    def __str__(self):
        return f"{self.movie.title} @ {self.theater.name} - {self.start_time}"

class Payment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    amount = models.PositiveIntegerField()
    status = models.CharField(max_length=20, default="SUCCESS")
    created_at = models.DateTimeField(auto_now_add=True)

class Booking(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="bookings")
    showtime = models.ForeignKey(Showtime, on_delete=models.CASCADE, related_name="bookings")
    seats = models.JSONField(default=list)  # [5,6,7]
    booking_id = models.CharField(max_length=30, unique=True)
    status = models.CharField(max_length=20, default="confirmed")
    payment = models.OneToOneField(Payment, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.booking_id