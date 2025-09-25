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

export interface BankPayload {
  bank_name: string;
  bank_account_name: string;
  bank_account_num: string;
  bank_location: string;
}

export const sendBankDetails = async (payload: BankPayload, userId: number) => {
  const url = `${API_BASE_URL}/wp-json/bridal/v2/bankdetails?user_id=${userId}`;
  const res = await axios.post(url, payload, {
    headers: {
      Authorization: `Basic ${token}`,
      "Content-Type": "application/json"
    },
  });
  return res.data;
};

export const getBankDetails = async (userId: number) => {
  const url = `${API_BASE_URL}/wp-json/bridal/v2/bankdetails?user_id=${userId}`;
  const res = await axios.get(url, {
    headers: {
      Authorization: `Basic ${token}`,
      "Content-Type": "application/json"
    },
  });
  return res.data;
};
