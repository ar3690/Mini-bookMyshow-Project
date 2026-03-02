import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

export default function Home({ setSelectedCity }) {
  const [cities, setCities] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const res = await api.get("cities/");
      setCities(res.data);
    })();
  }, []);

  const pickCity = (city) => {
    setSelectedCity(city);
    navigate("/movies");
  };

  return (
    <div className="home">
      <div className="hero">
        <h1>Welcome to BookMyShow</h1>
        <p>Book your favorite movies</p>
      </div>

      <div className="city-selection">
        <h2>Select Your City</h2>

        <div className="city-grid">
          {cities.map((city) => (
            <div key={city.id} className="city-card" onClick={() => pickCity(city)}>
              <div className="city-icon">🏙️</div>
              <h3>{city.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}