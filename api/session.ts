/* eslint-disable @typescript-eslint/no-explicit-any */
import { requireBearer, sendJson, wordpressJson } from "./_session.js";
export default async function handler(request: any, response: any) {
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
