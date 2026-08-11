import axios from "axios";
export interface RegistrationResult {
  message: string;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    account_type: "individual" | "business";
    roles: string[];
  };
}
export async function registerUser(userData: Record<string, unknown>): Promise<RegistrationResult> {
  return (await axios.post("/api/register", userData, { withCredentials: true })).data as RegistrationResult;
}
