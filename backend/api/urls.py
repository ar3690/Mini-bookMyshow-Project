from django.urls import path
from .views import (
    csrf_ping, register_view, login_view, logout_view, me_view,
    cities_view, movies_by_city, showtimes_by_city_movie,
    showtime_detail, checkout_view, my_bookings_view
)

urlpatterns = [
    path("csrf/", csrf_ping),

    path("auth/register/", register_view),
    path("auth/login/", login_view),
    path("auth/logout/", logout_view),
    path("auth/me/", me_view),

    path("cities/", cities_view),
    path("cities/<int:city_id>/movies/", movies_by_city),
    path("cities/<int:city_id>/movies/<int:movie_id>/showtimes/", showtimes_by_city_movie),
    path("showtimes/<int:showtime_id>/", showtime_detail),

    path("checkout/", checkout_view),
    path("my-bookings/", my_bookings_view),
]