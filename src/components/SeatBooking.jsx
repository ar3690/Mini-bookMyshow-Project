import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

function makeSeatMap(total = 48) {
  // 6 rows x 8 cols = 48
  const rows = ["A", "B", "C", "D", "E", "F"];
  const cols = 8;
  const map = [];
  let seatNo = 1;
  for (let r = 0; r < rows.length; r++) {
    const rowSeats = [];
    for (let c = 0; c < cols; c++) {
      if (seatNo <= total) rowSeats.push({ label: rows[r], no: seatNo++ });
    }
    map.push(rowSeats);
  }
  return map;
}

export default function SeatBooking({ selectedShowtime, selectedSeats, setSelectedSeats, requireLogin }) {
  const [freshShowtime, setFreshShowtime] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!selectedShowtime) return;
    (async () => {
      const res = await api.get(`showtimes/${selectedShowtime.id}/`);
      setFreshShowtime(res.data);
    })();
  }, [selectedShowtime]);

  useEffect(() => {
    requireLogin();
  }, [requireLogin]); // one time

  const seatRows = useMemo(() => makeSeatMap(freshShowtime?.total_seats || 48), [freshShowtime]);

  if (!selectedShowtime) {
    return (
      <div className="seat-booking-page">
        <div className="no-shows">Please select a showtime first.</div>
      </div>
    );
  }

  const booked = new Set(freshShowtime?.booked_seats || []);
  const price = freshShowtime?.price || selectedShowtime.price || 150;
  const total = selectedSeats.length * price;

  const toggleSeat = (seatNo) => {
    if (booked.has(seatNo)) return;
    if (selectedSeats.includes(seatNo)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatNo));
    } else {
      setSelectedSeats([...selectedSeats, seatNo]);
    }
  };

  const proceed = () => {
    if (!requireLogin()) return;
    if (selectedSeats.length === 0) return;
    navigate("/payment");
  };

  return (
    <div className="seat-booking-page">
      <div className="booking-header">
        <h1>Select Seats</h1>
        <p>{freshShowtime?.theater_name} • {freshShowtime?.movie_title}</p>
      </div>

      <div className="screen">
        <div className="screen-text">SCREEN THIS WAY</div>
      </div>

      <div className="seats-container">
        {seatRows.map((row, idx) => (
          <div className="seat-row" key={idx}>
            <div className="row-label">{row[0]?.label}</div>
            {row.map((s) => {
              const isBooked = booked.has(s.no);
              const isSel = selectedSeats.includes(s.no);
              const cls = isBooked ? "seat booked" : isSel ? "seat selected" : "seat available";
              return (
                <div key={s.no} className={cls} onClick={() => toggleSeat(s.no)}>
                  {s.no}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="legend">
        <div className="legend-item"><div className="seat available" /> <span>Available</span></div>
        <div className="legend-item"><div className="seat selected" /> <span>Selected</span></div>
        <div className="legend-item"><div className="seat booked" /> <span>Booked</span></div>
      </div>

      <div className="booking-summary">
        <div className="summary-info">
          <p><strong>Seats:</strong> {selectedSeats.length ? selectedSeats.join(", ") : "-"}</p>
          <p><strong>Price:</strong> ₹{price} each</p>
          <p><strong>Total:</strong> ₹{total}</p>
        </div>

        <button className="proceed-btn" disabled={selectedSeats.length === 0} onClick={proceed}>
          Proceed to Pay
        </button>
      </div>
    </div>
  );
}