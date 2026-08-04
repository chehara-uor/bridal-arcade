import axios from "axios";
const username = import.meta.env.VITE_WP_USERNAME;
const appPassword = import.meta.env.VITE_WP_PASSWORD;

// Vite: import.meta.env.VITE_API_BASE_URL
// CRA: process.env.REACT_APP_API_BASE_URL
const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL || "https://bridalarcade.lk").replace(/\/$/, "");

export interface SendProductStatusPayload {
  product_id: number;
  status: string;
}

export const sendProductStatus = async (payload: SendProductStatusPayload) => {
  if (!username || !appPassword) {
    throw new Error("Product updates are not configured. Please contact Bridal Arcade support.");
  }
  if (!Number.isInteger(payload.product_id) || payload.product_id <= 0) {
    throw new Error("This product has an invalid ID and cannot be updated.");
  }
  if (!['publish', 'draft'].includes(payload.status)) {
    throw new Error("This product status is invalid.");
  }
  const token = btoa(`${username}:${appPassword}`);
  const url = `${API_BASE_URL}/wp-json/bridal/v1/update-product-status/`;
  const res = await axios.post(url, payload, {

    headers: { 
        Authorization: `Basic ${token}`,
        "Content-Type": "application/json" },
  });
  return res.data;
};

