import axios from "axios";
import type { PortalUser } from "./portal";
import { clearAuthToken, setAuthToken } from "./client";
export async function sendWidgetOtp(email:string,phone:string):Promise<string>{const response=await axios.post("/api/register/otp-send",{email,phone});return String(response.data.challenge||"");}
export async function verifyOtpAndRegister(input:{name:string;email:string;phone:string;password:string;otp:string;challenge:string}):Promise<PortalUser>{
  // The widget can share sessionStorage with an earlier portal session. Never let
  // that token leak into the newly-created account's product submission.
  clearAuthToken();
  const response=await axios.post("/api/register/widget",input);
  const registeredUser=response.data?.user as PortalUser | undefined;

  // Product creation requires the token issued by /login. Always sign in after
  // registration instead of relying on an optional registration response token.
  const login=await axios.post("/api/auth/login",{
    username_or_email:input.email,
    password:input.password,
  });
  const token=login.data?.token;
  const user=(login.data?.user as PortalUser | undefined) || registeredUser;

  if(!token||!user?.id||!user.email)throw new Error("The account was created, but a login session could not be started. Please sign in and try again.");
  setAuthToken(String(token));
  return user;
}
