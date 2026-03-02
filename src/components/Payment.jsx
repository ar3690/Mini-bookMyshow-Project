import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, ensureCSRF } from "../api";

export default function Payment({ selectedShowtime, selectedSeats, setSelectedSeats, requireLogin }) {
  const [method, setMethod] = useState("upi");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const price = selectedShowtime?.price || 150;

  const total = useMemo(() => {
    return (selectedSeats?.length || 0) * price;
  }, [selectedSeats, price]);

  if (!selectedShowtime || !selectedSeats || selectedSeats.length === 0) {
    return (
      <div className="payment-page">
        <div className="no-shows">Please select seats first.</div>
      </div>
    );
  }

  const pay = async () => {
    if (!requireLogin()) return;
    setLoading(true);
    try {
      await ensureCSRF();
      await api.post("checkout/", {
        showtime_id: selectedShowtime.id,
        seats: selectedSeats,
        amount: total,
      });

      alert("Payment Successful");
      setSelectedSeats([]);
      navigate("/my-bookings");
    } catch (e) {
      alert(e?.response?.data?.detail || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-page">
      <h1>Payment</h1>

      <div className="payment-container">
        <div className="booking-details">
          <h2>Booking Details</h2>

          <div className="detail-row">
            <span>Seats</span>
            <strong>{selectedSeats.join(", ")}</strong>
          </div>

          <div className="detail-row">
            <span>Price per ticket</span>
            <strong>₹{price}</strong>
          </div>

          <div className="detail-row total">
            <span>Total</span>
            <strong>₹{total}</strong>
          </div>
        </div>

        <div className="payment-methods">
          <h2>Select Payment Method</h2>

          <div className="method-options">
            <label className={`method-option ${method === "upi" ? "selected" : ""}`}>
              <input type="radio" checked={method === "upi"} onChange={() => setMethod("upi")} />
              <div className="method-icon">📱</div>
              <div>UPI</div>
            </label>

            <label className={`method-option ${method === "card" ? "selected" : ""}`}>
              <input type="radio" checked={method === "card"} onChange={() => setMethod("card")} />
              <div className="method-icon">💳</div>
              <div>Card</div>
            </label>

            <label className={`method-option ${method === "netbank" ? "selected" : ""}`}>
              <input type="radio" checked={method === "netbank"} onChange={() => setMethod("netbank")} />
              <div className="method-icon">🏦</div>
              <div>Net Banking</div>
            </label>
          </div>
        </div>

        <button className="pay-btn" disabled={loading} onClick={pay}>
          {loading ? "Processing..." : "Pay Now"}
        </button>
      </div>
    </div>
  );
}