/* eslint-disable @typescript-eslint/no-explicit-any */
// Consolidated to stay under Vercel's Hobby-plan Serverless Function count:
// POST /api/register/self      (was api/register.ts)          - bride/vendor self-registration
// POST /api/register/otp-send  (was api/vendor-otp-send.ts)    - send widget OTP
// POST /api/register/widget    (was api/widget-register.ts)    - verify OTP + register (vendor widget)
import { createOtpChallenge, normalizeSriLankanMobile, verifyOtpChallenge } from "../../lib/otp.js";
import { readJson, sendJson, wordpressJson, type PortalUser } from "../../lib/session.js";

const recentOtpRequests = new Map<string, number>();

export default async function handler(request: any, response: any) {
  const action = new URL(request.url || "/", "http://localhost").pathname.split("/").pop();
  switch (action) {
    case "self": return self(request, response);
    case "otp-send": return otpSend(request, response);
    case "widget": return widget(request, response);
    default: return sendJson(response, 404, { message: "Not found." });
  }
}

async function self(request: any, response: any) {
  if (request.method !== "POST") return sendJson(response, 405, { message: "Method not allowed." });
  try {
    const body = await readJson(request);
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const firstName = typeof body.first_name === "string" ? body.first_name.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const accountType = body.account_type === "individual" || body.account_type === "business" ? body.account_type : "";

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return sendJson(response, 400, { message: "A valid email address is required." });
    if (password.length < 8) return sendJson(response, 400, { message: "Password must contain at least 8 characters." });
    if (!firstName) return sendJson(response, 400, { message: "First name is required." });
    if (!phone) return sendJson(response, 400, { message: "Phone number is required." });
    if (!accountType) return sendJson(response, 400, { message: "Account type must be individual or business." });

    const result = await wordpressJson("/wp-json/bridal/v2/self-register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, first_name: firstName, phone, account_type: accountType }),
    });
    if (!result.response.ok) return sendJson(response, result.response.status, { message: result.data?.message || "Unable to create your account." });

    const wpUser = result.data?.user;
    if (!wpUser?.id || !wpUser?.email) return sendJson(response, 502, { message: "WordPress returned an incomplete registration response." });
    return sendJson(response, 201, {
      message: String(result.data?.message || "User registered."),
      user: {
        id: Number(wpUser.id),
        username: String(wpUser.username || ""),
        email: String(wpUser.email),
        first_name: String(wpUser.first_name || firstName),
        account_type: wpUser.account_type === "business" ? "business" : "individual",
        roles: Array.isArray(wpUser.roles) ? wpUser.roles.map(String) : [],
        role: typeof wpUser.role === "string" ? wpUser.role : undefined,
        profile_status: wpUser.profile_status === "inactive" ? "inactive" : "active",
      },
      token: result.data?.token,
      expires_at: result.data?.expires_at,
    });
  } catch {
    return sendJson(response, 502, { message: "Unable to connect to Bridal Arcade registration." });
  }
}

async function otpSend(request: any, response: any) {
  if (request.method !== "POST") return sendJson(response, 405, { message: "Method not allowed." });
  try {
    const body = await readJson(request);
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const phone = normalizeSriLankanMobile(typeof body.phone === "string" ? body.phone : "");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !phone) return sendJson(response, 400, { message: "A valid email and Sri Lankan mobile number are required." });
    const last = recentOtpRequests.get(phone) || 0;
    if (Date.now() - last < 60000) return sendJson(response, 429, { message: "Please wait one minute before requesting another code." });
    const userId = process.env.SMS_USER_ID, apiKey = process.env.SMS_API_KEY, base = process.env.SMS_API_BASE_URL?.replace(/\/$/, ""), senderId = process.env.SMS_SENDER_ID || "SMSlenzDEMO";
    if (!userId || !apiKey || !base) throw new Error("SMSLenz is not configured.");
    const endpoint = /\/api\/send-sms$/.test(base) ? base : `${base}/api/send-sms`;
    const { otp, challenge } = createOtpChallenge(email, phone);
    const sms = await fetch(endpoint, {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ user_id: userId, api_key: apiKey, sender_id: senderId, contact: phone, message: `Your Bridal Arcade verification code is ${otp}. It expires in 5 minutes.` }),
    });
    const data = await sms.json().catch(() => null);
    if (!sms.ok || data?.success !== true) return sendJson(response, 502, { message: "SMSLenz could not send the verification code." });
    recentOtpRequests.set(phone, Date.now());
    return sendJson(response, 200, { challenge, expires_in: 300 });
  } catch {
    return sendJson(response, 502, { message: "We couldn't send the verification code. Please try again." });
  }
}

async function widget(request: any, response: any) {
  if (request.method !== "POST") return sendJson(response, 405, { message: "Method not allowed." });
  try {
    const body = await readJson(request);
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const phone = normalizeSriLankanMobile(typeof body.phone === "string" ? body.phone : "");
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const otp = typeof body.otp === "string" ? body.otp : "";
    const challenge = typeof body.challenge === "string" ? body.challenge : "";
    if (!phone || !verifyOtpChallenge(challenge, otp, email, phone)) return sendJson(response, 400, { message: "The verification code is invalid or expired." });
    if (name.length < 2 || password.length < 8) return sendJson(response, 400, { message: "Valid account details are required." });
    const registered = await wordpressJson("/wp-json/bridal/v2/self-register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, first_name: name, phone, account_type: "individual" }),
    });
    if (!registered.response.ok) return sendJson(response, registered.response.status, { message: registered.data?.message || "Unable to create your account." });
    const wpUser = registered.data?.user;
    if (!wpUser?.id || !wpUser?.email) return sendJson(response, 502, { message: "WordPress returned an incomplete registration response." });
    const user: PortalUser = {
      id: String(wpUser.id),
      email: String(wpUser.email),
      name: String(wpUser.first_name || name),
      roles: Array.isArray(wpUser.roles) ? wpUser.roles.map(String) : [],
      role: typeof wpUser.role === "string" ? wpUser.role : undefined,
      account_type: "individual",
      profile_status: wpUser.profile_status === "inactive" ? "inactive" : "active",
    };
    return sendJson(response, 201, { user, token: registered.data?.token, expires_at: registered.data?.expires_at });
  } catch {
    return sendJson(response, 502, { message: "Unable to complete your verified registration." });
  }
}
