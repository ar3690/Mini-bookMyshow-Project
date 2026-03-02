from django.contrib import admin
from .models import City, Theater, Movie, Showtime, Booking, Payment

admin.site.register(City)
admin.site.register(Theater)
admin.site.register(Movie)
admin.site.register(Showtime)
admin.site.register(Booking)
admin.site.register(Payment)