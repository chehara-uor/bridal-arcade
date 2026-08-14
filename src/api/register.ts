import axios from "axios";
import { setAuthToken } from "./client";
export interface RegistrationResult {
  message: string;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    account_type: "individual" | "business";
    roles: string[];
    role?: string;
    profile_status: "active" | "inactive";
  };
  token?: string;
  expires_at?: string | number;
}
export async function registerUser(userData: Record<string, unknown>): Promise<RegistrationResult> {
  const result = (await axios.post("/api/register", userData)).data as RegistrationResult;
  if (result.token) setAuthToken(result.token);
  return result;
}
