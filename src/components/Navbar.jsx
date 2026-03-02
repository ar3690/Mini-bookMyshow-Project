import { Link, useNavigate } from "react-router-dom";
import { api, ensureCSRF } from "../api";

export default function Navbar({
  user,
  setUser,
  selectedCity,
  setSelectedCity,
  setSelectedMovie,
  setSelectedShowtime,
  setSelectedSeats,
}) {
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await ensureCSRF();   
      await api.post("auth/logout/");
      setUser(null);
      setSelectedCity(null);
      setSelectedMovie(null);
      setSelectedShowtime(null);
      setSelectedSeats([]);
      navigate("/");
    } catch {
      alert("Logout failed");
    }
  };

  const changeCity = () => {
    setSelectedCity(null);
    setSelectedMovie(null);
    setSelectedShowtime(null);
    setSelectedSeats([]);
    navigate("/");
  };

  return (
    <div className="navbar">
      <div className="navbar-brand">
        <Link to="/">BookMyShow</Link>
      </div>

      {selectedCity && (
        <div className="navbar-city">
          <span>{selectedCity.name}</span>
          <button className="change-city-btn" onClick={changeCity}>Change</button>
        </div>
      )}

      <div className="navbar-links">
        <Link to="/">Home</Link>
        {selectedCity && <Link to="/movies">Movies</Link>}
        {user && <Link to="/my-bookings">My Bookings</Link>}

        {user ? (
          <>
            <span className="welcome-text">Hi, {user.username}</span>
            <button className="logout-btn" onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </div>
  );
}