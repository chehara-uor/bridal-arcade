/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSession, readJson, sendJson, sessionCookie, wordpressJson, type PortalUser } from "./_session.js";

export default async function handler(request: any, response: any) {
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
    if (!result.response.ok || !wpUser?.id || !wpUser?.email) {
      const unauthorized = result.response.status === 401 || result.response.status === 403;
      return sendJson(response, unauthorized ? 401 : result.response.status >= 400 && result.response.status < 500 ? result.response.status : 502, { message: result.data?.message || (unauthorized ? "That username/email or password is incorrect." : "Unable to authenticate with Bridal Arcade.") });
    }
    const user: PortalUser = {
      id: String(wpUser.id),
      email: String(wpUser.email),
      name: String(wpUser.first_name || wpUser.display_name || wpUser.email),
      roles: Array.isArray(wpUser.roles) ? wpUser.roles.map(String) : [],
      account_type: wpUser.account_type === "business" || wpUser.account_type === "vendor" ? "business" : wpUser.account_type === "individual" ? "individual" : undefined,
    };
    response.setHeader("Set-Cookie", sessionCookie(createSession(user)));
    return sendJson(response, 200, { user });
  } catch {
    return sendJson(response, 500, { message: "Sign-in is temporarily unavailable." });
  }
}
