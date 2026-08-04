// api/registerUser.ts
import axios from "axios";

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL || "https://bridalarcade.lk").replace(/\/$/, "");


export async function registerUser(userData: Record<string, unknown>) {
  const username = import.meta.env.VITE_WP_USERNAME;
  const appPassword = import.meta.env.VITE_WP_PASSWORD;

  if (!username || !appPassword) {
    throw new Error("Missing WordPress credentials in environment variables.");
  }

  const token = btoa(`${username}:${appPassword}`);

  const response = await axios.post(`${API_BASE_URL}/wp-json/wp/v2/users`, userData, {
    headers: {
      Authorization: `Basic ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response.data;
}
