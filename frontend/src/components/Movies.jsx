import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

export default function Movies({ selectedCity, setSelectedMovie }) {
  const [movies, setMovies] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!selectedCity) return;
    (async () => {
      const res = await api.get(`cities/${selectedCity.id}/movies/`);
      setMovies(res.data);
    })();
  }, [selectedCity]);

  if (!selectedCity) {
    return (
      <div className="movies-page">
        <h1>Please select a city first</h1>
      </div>
    );
  }

  const pickMovie = (movie) => {
    setSelectedMovie(movie);
    navigate("/showtimes");
  };

  return (
    <div className="movies-page">
      <h1>Movies in {selectedCity.name}</h1>

      <div className="movies-grid">
        {movies.map((m) => (
          <div key={m.id} className="movie-card" onClick={() => pickMovie(m)}>
            <div className="movie-poster">
              <img
                src={m.poster_url || "https://via.placeholder.com/400x600?text=Movie+Poster"}
                alt={m.title}
              />
            </div>
            <div className="movie-info">
              <h3>{m.title}</h3>
              <p className="genre">{m.genre}</p>
              <p className="language">{m.language}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}