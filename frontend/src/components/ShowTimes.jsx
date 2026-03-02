import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

function onlyDateKey(isoStr) {
  const d = new Date(isoStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function fmtTime(isoStr) {
  const d = new Date(isoStr);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ShowTimes({ selectedCity, selectedMovie, setSelectedShowtime }) {
  const [showtimes, setShowtimes] = useState([]);
  const [activeDate, setActiveDate] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!selectedCity || !selectedMovie) return;
    (async () => {
      const res = await api.get(`cities/${selectedCity.id}/movies/${selectedMovie.id}/showtimes/`);
      setShowtimes(res.data);

      const dates = Array.from(new Set(res.data.map((s) => onlyDateKey(s.start_time))));
      setActiveDate(dates[0] || "");
    })();
  }, [selectedCity, selectedMovie]);

  const dateOptions = useMemo(
    () => Array.from(new Set(showtimes.map((s) => onlyDateKey(s.start_time)))),
    [showtimes]
  );

  const groupedByTheater = useMemo(() => {
    const filtered = activeDate
      ? showtimes.filter((s) => onlyDateKey(s.start_time) === activeDate)
      : showtimes;

    const map = new Map();
    for (const s of filtered) {
      const key = `${s.theater}-${s.theater_name}`;
      if (!map.has(key)) map.set(key, { theater_id: s.theater, theater_name: s.theater_name, items: [] });
      map.get(key).items.push(s);
    }
    return Array.from(map.values());
  }, [showtimes, activeDate]);

  if (!selectedCity || !selectedMovie) {
    return (
      <div className="showtimes-page">
        <div className="no-shows">Please pick a city and movie first.</div>
      </div>
    );
  }

  const pickTime = (st) => {
    setSelectedShowtime(st);
    navigate("/seats");
  };

  return (
    <div className="showtimes-page">
      <div className="movie-header">
        <h1>{selectedMovie.title}</h1>
        <p>{selectedCity.name} • Choose showtime</p>
      </div>

      <div className="date-selector">
        {dateOptions.map((d) => (
          <button
            key={d}
            className={`date-btn ${d === activeDate ? "active" : ""}`}
            onClick={() => setActiveDate(d)}
          >
            {d}
          </button>
        ))}
      </div>

      <div className="theaters-list">
        {groupedByTheater.length === 0 ? (
          <div className="no-shows">No shows available</div>
        ) : (
          groupedByTheater.map((t) => (
            <div key={t.theater_id} className="theater-card">
              <h3>{t.theater_name}</h3>
              <div className="time-slots">
                {t.items.map((s) => (
                  <button key={s.id} className="time-btn" onClick={() => pickTime(s)}>
                    <div>{fmtTime(s.start_time)}</div>
                    <div className="price">₹{s.price}</div>
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}