import axios from "axios";
import type { PortalUser } from "./portal";
import { setAuthToken } from "./client";
export async function sendWidgetOtp(email:string,phone:string):Promise<string>{const response=await axios.post("/api/register/otp-send",{email,phone});return String(response.data.challenge||"");}
export async function verifyOtpAndRegister(input:{name:string;email:string;phone:string;password:string;otp:string;challenge:string}):Promise<PortalUser>{const response=await axios.post("/api/register/widget",input);if(response.data?.token)setAuthToken(String(response.data.token));return response.data.user as PortalUser;}
