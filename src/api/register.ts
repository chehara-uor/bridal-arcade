import axios from "axios";
export async function registerUser(userData: Record<string, unknown>) {
  return (await axios.post("/api/register", userData, { withCredentials: true })).data;
}
