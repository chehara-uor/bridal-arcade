/* eslint-disable @typescript-eslint/no-explicit-any */
import { requireAdministrator, relayError } from "./_admin.js";
import { readJson, sendJson, wordpressJson } from "./_session.js";

export default async function handler(request: any, response: any) {
  if (request.method !== "POST") return sendJson(response, 405, { message: "Method not allowed." });
  const auth = requireAdministrator(request, response);
  if (!auth) return;
  try {
    const body = await readJson(request);
    const status = body.status === "active" || body.status === "inactive" ? body.status : "";
    const targetUserId = Number(body.target_user_id);
    const targetEmail = typeof body.target_email === "string" ? body.target_email.trim() : "";
    if (!status || (!Number.isInteger(targetUserId) && !targetEmail)) return sendJson(response, 400, { message: "A target user and valid status are required." });
    const payload: Record<string, unknown> = { requester_email: body.requester_email, requester_type: body.requester_type, status };
    if (Number.isInteger(targetUserId) && targetUserId > 0) payload.target_user_id = targetUserId;
    else payload.target_email = targetEmail;
    const result = await wordpressJson("/wp-json/bridal/v2/admin/user-status", {
      method: "POST",
      headers: { ...auth.headers, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!result.response.ok) return relayError(response, result.response.status, result.data, "Unable to update this user.");
    return sendJson(response, 200, result.data);
  } catch {
    return sendJson(response, 502, { message: "Unable to update this user." });
  }
}
