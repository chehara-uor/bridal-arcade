/* eslint-disable @typescript-eslint/no-explicit-any */
import { createOtpChallenge, normalizeSriLankanMobile } from "./_otp.js";
import { readJson, sendJson } from "./_session.js";
const recentRequests = new Map<string, number>();
export default async function handler(request: any, response: any) {
  if (request.method !== "POST")
    return sendJson(response, 405, { message: "Method not allowed." });
  try {
    const body = await readJson(request);
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const phone = normalizeSriLankanMobile(
      typeof body.phone === "string" ? body.phone : "",
    );
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !phone)
      return sendJson(response, 400, {
        message: "A valid email and Sri Lankan mobile number are required.",
      });
    const last = recentRequests.get(phone) || 0;
    if (Date.now() - last < 60000)
      return sendJson(response, 429, {
        message: "Please wait one minute before requesting another code.",
      });
    const userId = process.env.SMS_USER_ID,
      apiKey = process.env.SMS_API_KEY,
      base = process.env.SMS_API_BASE_URL?.replace(/\/$/, ""),
      senderId = process.env.SMS_SENDER_ID || "SMSlenzDEMO";
    if (!userId || !apiKey || !base)
      throw new Error("SMSLenz is not configured.");
    const endpoint = /\/api\/send-sms$/.test(base)
      ? base
      : `${base}/api/send-sms`;
    const { otp, challenge } = createOtpChallenge(email, phone);
    const sms = await fetch(endpoint, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        user_id: userId,
        api_key: apiKey,
        sender_id: senderId,
        contact: phone,
        message: `Your Bridal Arcade verification code is ${otp}. It expires in 5 minutes.`,
      }),
    });
    const data = await sms.json().catch(() => null);
    if (!sms.ok || data?.success !== true)
      return sendJson(response, 502, {
        message: "SMSLenz could not send the verification code.",
      });
    recentRequests.set(phone, Date.now());
    return sendJson(response, 200, { challenge, expires_in: 300 });
  } catch {
    return sendJson(response, 502, {
      message: "We couldn't send the verification code. Please try again.",
    });
  }
}
