/* eslint-disable @typescript-eslint/no-explicit-any */
import { readJson, sendJson, wordpressJson } from "./_session.js";

export default async function handler(request: any, response: any) {
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
