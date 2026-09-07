// STKA Admin Environment Configuration
export const API_BASE_URL = (
  typeof import.meta !== "undefined" && import.meta.env && import.meta.env["VITE_API_URL"]
    ? import.meta.env["VITE_API_URL"]
    : "http://localhost:8080"
).replace(/\/$/, "");
