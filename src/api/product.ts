import axios from "axios";
import { env } from "process";

const username = import.meta.env.VITE_WP_USERNAME;
const appPassword = import.meta.env.VITE_WP_PASSWORD;
const token = btoa(`${username}:${appPassword}`);

// Vite: import.meta.env.VITE_API_BASE_URL
// CRA: process.env.REACT_APP_API_BASE_URL
const API_BASE_URL =
  (import.meta as any)?.env?.VITE_API_BASE_URL ||
  "https://bridalarcade.lk/";

export interface SendProductStatusPayload {
  product_id: number;
  status: string;
}

export const sendProductStatus = async (payload: SendProductStatusPayload) => {
  const url = `${API_BASE_URL}/wp-json/bridal/v1/update-product-status/`;
  const res = await axios.post(url, payload, {

    headers: { 
        Authorization: `Basic ${token}`,
        "Content-Type": "application/json" },
  });
  return res.data;
};

