import { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { api, ensureCSRF } from "./api";
import { useCallback } from "react";

import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import Movies from "./components/Movies";
import ShowTimes from "./components/ShowTimes";
import SeatBooking from "./components/SeatBooking";
import Payment from "./components/Payment";
import MyBookings from "./components/MyBookings";

export default function App() {
  const [user, setUser] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      await ensureCSRF();
      const res = await api.get("auth/me/");
      if (res.data?.authenticated) setUser(res.data);
    })();
  }, []);

  const requireLogin = useCallback(() => {
  if (!user) {
    alert("Please login first");
    navigate("/login");
    return false;
  }
  return true;
}, [user, navigate]);

  return (
    <>
      <Navbar
        user={user}
        setUser={setUser}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        setSelectedMovie={setSelectedMovie}
        setSelectedShowtime={setSelectedShowtime}
        setSelectedSeats={setSelectedSeats}
      />

      <Routes>
        <Route path="/" element={<Home setSelectedCity={setSelectedCity} />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/movies"
          element={<Movies selectedCity={selectedCity} setSelectedMovie={setSelectedMovie} />}
        />

        <Route
          path="/showtimes"
          element={
            <ShowTimes
              selectedCity={selectedCity}
              selectedMovie={selectedMovie}
              setSelectedShowtime={setSelectedShowtime}
            />
          }
        />

        <Route
          path="/seats"
          element={
            <SeatBooking
              selectedShowtime={selectedShowtime}
              selectedSeats={selectedSeats}
              setSelectedSeats={setSelectedSeats}
              requireLogin={requireLogin}
            />
          }
        />

        <Route
          path="/payment"
          element={
            <Payment
              selectedShowtime={selectedShowtime}
              selectedSeats={selectedSeats}
              setSelectedSeats={setSelectedSeats}
              requireLogin={requireLogin}
            />
          }
        />

        <Route path="/my-bookings" element={<MyBookings requireLogin={requireLogin} />} />
      </Routes>
    </>
  );
}