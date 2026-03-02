import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8000/api/",
  withCredentials: true,
});

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

// Attach CSRF token for ALL unsafe methods
api.interceptors.request.use((config) => {
  const method = (config.method || "get").toLowerCase();
  const unsafe = ["post", "put", "patch", "delete"].includes(method);
  if (unsafe) {
    const token = getCookie("csrftoken");
    if (token) config.headers["X-CSRFToken"] = token;
  }
  return config;
});

export async function ensureCSRF() {
  await api.get("csrf/");
}