/* eslint-disable @typescript-eslint/no-explicit-any */
// Consolidated to stay under Vercel's Hobby-plan Serverless Function count:
// GET  /api/auth/session -> refresh session (was api/session.ts)
// POST /api/auth/login   -> sign in         (was api/login.ts)
import { createOtpChallenge, createPasswordResetProof, normalizeSriLankanMobile, verifyOtpChallenge, verifyPasswordResetProof } from "../../lib/otp.js";
import { readJson, requireBearer, sendJson, wordpressJson, type PortalUser } from "../../lib/session.js";

const recentResetOtpRequests = new Map<string, number>();

export default async function handler(request: any, response: any) {
  const action = new URL(request.url || "/", "http://localhost").pathname.split("/").pop();
  if (action === "login") return login(request, response);
  if (action === "session") return session(request, response);
  if (action === "reset-verify") return resetVerify(request, response);
  if (action === "reset-otp") return resetOtp(request, response);
  if (action === "reset-password") return resetPassword(request, response);
  return sendJson(response, 404, { message: "Not found." });
}

async function resetVerify(request: any, response: any) {
  if (request.method !== "POST") return sendJson(response, 405, { message: "Method not allowed." });
  try {
    const body = await readJson(request);
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const suppliedPhone = typeof body.phone === "string" ? body.phone.trim() : "";
    const phone = normalizeSriLankanMobile(suppliedPhone);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !phone) return sendJson(response, 400, { message: "A valid email and Sri Lankan mobile number are required." });

    const lastRequest = recentResetOtpRequests.get(phone) || 0;
    if (Date.now() - lastRequest < 60000) return sendJson(response, 429, { message: "Please wait one minute before requesting another code." });

    const verified = await wordpressJson("/wp-json/bridal/v2/reset-password/verify-account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, phone: suppliedPhone }),
    });
    if (verified.response.status === 404) return sendJson(response, 404, { message: "No account found with that email and mobile number." });
    if (!verified.response.ok) return sendJson(response, verified.response.status, { message: verified.data?.message || "Unable to verify your account." });

    const userId = verified.data?.user_id;
    const verificationToken = verified.data?.verification_token;
    if ((typeof userId !== "string" && typeof userId !== "number") || typeof verificationToken !== "string" || !verificationToken) return sendJson(response, 502, { message: "WordPress returned an incomplete verification response." });

    const smsUserId = process.env.SMS_USER_ID;
    const apiKey = process.env.SMS_API_KEY;
    const baseUrl = process.env.SMS_API_BASE_URL?.replace(/\/$/, "");
    const senderId = process.env.SMS_SENDER_ID || "SMSlenzDEMO";
    if (!smsUserId || !apiKey || !baseUrl) throw new Error("SMSLenz is not configured.");
    const endpoint = /\/api\/send-sms$/.test(baseUrl) ? baseUrl : `${baseUrl}/api/send-sms`;
    const { otp, challenge } = createOtpChallenge(email, phone);
    const sms = await fetch(endpoint, {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ user_id: smsUserId, api_key: apiKey, sender_id: senderId, contact: phone, message: `Your Bridal Arcade password reset code is ${otp}. It expires in 5 minutes.` }),
    });
    const smsData = await sms.json().catch(() => null);
    if (!sms.ok || smsData?.success !== true) return sendJson(response, 502, { message: "We couldn't send the verification code. Please try again." });
    recentResetOtpRequests.set(phone, Date.now());
    return sendJson(response, 200, { user_id: userId, verification_token: verificationToken, expires_at: verified.data?.expires_at, otp_challenge: challenge });
  } catch {
    return sendJson(response, 502, { message: "We couldn't verify your account or send the verification code." });
  }
}

async function resetOtp(request: any, response: any) {
  if (request.method !== "POST") return sendJson(response, 405, { message: "Method not allowed." });
  try {
    const body = await readJson(request);
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const phone = normalizeSriLankanMobile(typeof body.phone === "string" ? body.phone : "");
    const userIdValue = typeof body.user_id === "string" || typeof body.user_id === "number" ? body.user_id : "";
    const userId = String(userIdValue);
    const verificationToken = typeof body.verification_token === "string" ? body.verification_token : "";
    const challenge = typeof body.otp_challenge === "string" ? body.otp_challenge : "";
    const otp = typeof body.otp === "string" ? body.otp : "";
    if (!phone || !userId || !verificationToken || !verifyOtpChallenge(challenge, otp, email, phone)) return sendJson(response, 400, { message: "The verification code is invalid or expired." });
    return sendJson(response, 200, { otp_proof: createPasswordResetProof(email, userId, verificationToken) });
  } catch {
    return sendJson(response, 400, { message: "The verification code is invalid or expired." });
  }
}

async function resetPassword(request: any, response: any) {
  if (request.method !== "POST") return sendJson(response, 405, { message: "Method not allowed." });
  try {
    const body = await readJson(request);
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const userIdValue = typeof body.user_id === "string" || typeof body.user_id === "number" ? body.user_id : "";
    const userId = String(userIdValue);
    const verificationToken = typeof body.verification_token === "string" ? body.verification_token : "";
    const otpProof = typeof body.otp_proof === "string" ? body.otp_proof : "";
    const newPassword = typeof body.new_password === "string" ? body.new_password : "";
    const confirmPassword = typeof body.confirm_password === "string" ? body.confirm_password : "";
    if (newPassword.length < 8) return sendJson(response, 400, { message: "Password must contain at least 8 characters." });
    if (newPassword !== confirmPassword) return sendJson(response, 400, { message: "The passwords do not match." });
    if (!verifyPasswordResetProof(otpProof, email, userId, verificationToken)) return sendJson(response, 401, { message: "Your verification has expired. Please verify your account again." });

    const updated = await wordpressJson("/wp-json/bridal/v2/reset-password/set-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, user_id: userIdValue, verification_token: verificationToken, new_password: newPassword, confirm_password: confirmPassword }),
    });
    if (updated.response.status === 401) return sendJson(response, 401, { message: "Your verification has expired. Please verify your account again." });
    if (!updated.response.ok) return sendJson(response, updated.response.status, { message: updated.data?.message || "We couldn't update your password." });
    return sendJson(response, 200, { message: updated.data?.message || "Your password has been reset successfully." });
  } catch {
    return sendJson(response, 502, { message: "We couldn't update your password. Please try again." });
  }
}

async function login(request: any, response: any) {
  if (request.method !== "POST") return sendJson(response, 405, { message: "Method not allowed." });
  try {
    const body = await readJson(request);
    const username = typeof body.username_or_email === "string" ? body.username_or_email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!username || !password) return sendJson(response, 400, { message: "Username/email and password are required." });

    const result = await wordpressJson("/wp-json/bridal/v2/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username_or_email: username, password }),
    });
    const wpUser = result.data?.user;
    const token = result.data?.token;
    if (!result.response.ok || !wpUser?.id || !wpUser?.email || !token) {
      const unauthorized = result.response.status === 401 || result.response.status === 403;
      const message = String(result.data?.message || "");
      const status = result.response.status === 403 && /deactivat/i.test(message) ? 403 : unauthorized ? 401 : result.response.status >= 400 && result.response.status < 500 ? result.response.status : 502;
      return sendJson(response, status, { message: message || (unauthorized ? "That username/email or password is incorrect." : "Unable to authenticate with Bridal Arcade.") });
    }
    const user: PortalUser = {
      id: String(wpUser.id),
      email: String(wpUser.email),
      name: String(wpUser.first_name || wpUser.display_name || wpUser.email),
      roles: Array.isArray(wpUser.roles) ? wpUser.roles.map(String) : [],
      role: typeof wpUser.role === "string" ? wpUser.role : undefined,
      account_type: wpUser.account_type === "business" || wpUser.account_type === "vendor" ? "business" : wpUser.account_type === "individual" ? "individual" : undefined,
      profile_status: wpUser.profile_status === "inactive" ? "inactive" : "active",
      pricing_plan: wpUser.pricing_plan === "basic" || wpUser.pricing_plan === "standard" ? wpUser.pricing_plan : "free",
    };
    return sendJson(response, 200, { token: String(token), expires_at: result.data?.expires_at, user });
  } catch {
    return sendJson(response, 500, { message: "Sign-in is temporarily unavailable." });
  }
}

async function session(request: any, response: any) {
  if (request.method !== "GET") return sendJson(response, 405, { message: "Method not allowed." });
  const authorization = requireBearer(request, response);
  if (!authorization) return;
  try {
    const result = await wordpressJson("/wp-json/bridal/v2/session", { headers: { Authorization: authorization } });
    if (!result.response.ok) return sendJson(response, result.response.status === 401 ? 401 : result.response.status, { message: result.data?.message || "Unable to refresh your session." });
    if (!result.data?.user || !result.data?.token) return sendJson(response, 502, { message: "WordPress returned an incomplete session response." });
    return sendJson(response, 200, { user: result.data.user, token: result.data.token, expires_at: result.data.expires_at });
  } catch { return sendJson(response, 502, { message: "Unable to refresh your session." }); }
}
