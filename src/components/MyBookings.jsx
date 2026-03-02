import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

function fmtDateTime(dt) {
  const d = new Date(dt);
  return d.toLocaleString();
}

export default function MyBookings({ requireLogin }) {
  const [bookings, setBookings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!requireLogin()) return;
    (async () => {
      const res = await api.get("my-bookings/");
      setBookings(res.data);
    })();
  }, [requireLogin]);

  return (
    <div className="my-bookings-page">
      <h1>My Bookings</h1>

      {bookings.length === 0 ? (
        <div className="no-bookings">
          <p>No bookings found.</p>
          <button onClick={() => navigate("/")}>Book Now</button>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map((b) => (
            <div className="booking-card" key={b.booking_id}>
              <div className="booking-status">
                <span className={`status-badge ${b.status}`}>{b.status}</span>
              </div>

              <div className="booking-info">
                <h3>{b.movie}</h3>
                <p><strong>Theater:</strong> {b.theater}</p>
                <p><strong>City:</strong> {b.city}</p>
                <p><strong>Showtime:</strong> {fmtDateTime(b.showtime)}</p>
                <p><strong>Seats:</strong> {b.seats.join(", ")}</p>
                <p className="amount"><strong>Amount:</strong> ₹{b.amount}</p>
              </div>

              <div className="booking-id">
                Booking ID: {b.booking_id}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}