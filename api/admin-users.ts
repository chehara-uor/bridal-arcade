/* eslint-disable @typescript-eslint/no-explicit-any */
import { requireAdministrator, relayError } from "./_admin.js";
import { sendJson, wordpressJson } from "./_session.js";

export default async function handler(request: any, response: any) {
  if (request.method !== "GET") return sendJson(response, 405, { message: "Method not allowed." });
  const auth = requireAdministrator(request, response);
  if (!auth) return;
  try {
    const incoming = new URL(request.url || "/", "http://localhost").searchParams;
    const query = new URLSearchParams();
    for (const key of ["requester_email", "requester_type", "search", "role", "status", "page", "per_page"]) {
      const value = incoming.get(key);
      if (value) query.set(key, value);
    }
    const result = await wordpressJson(`/wp-json/bridal/v2/admin/users?${query}`, { headers: auth.headers });
    if (!result.response.ok) return relayError(response, result.response.status, result.data, "Unable to load users.");
    return sendJson(response, 200, result.data);
  } catch {
    return sendJson(response, 502, { message: "Unable to load users." });
  }
}
