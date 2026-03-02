import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, ensureCSRF } from "../api";

export default function Login({ setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      await ensureCSRF();
      const res = await api.post("auth/login/", { username, password });
      setUser(res.data);
      navigate("/");
    } catch (e2) {
      setErr(e2?.response?.data?.detail || "Login failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login</h2>

        {err && <div className="error-msg">{err}</div>}

        <form onSubmit={submit}>
          <div className="form-group">
            <label>Username</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <button className="auth-btn" type="submit">Login</button>
        </form>

        <div className="auth-link">
          Don't have an account? <Link to="/register">Register</Link>
        </div>
      </div>
    </div>
  );
}