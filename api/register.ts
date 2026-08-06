/* eslint-disable @typescript-eslint/no-explicit-any */
import { readJson, sendJson, wordpressConfig, wordpressJson } from "./_session.js";
export default async function handler(request: any, response: any) {
  if (request.method !== "POST") return sendJson(response, 405, { message: "Method not allowed." });
  try {
    const body = await readJson(request);
    const { authorization } = wordpressConfig();
    const result = await wordpressJson("/wp-json/wp/v2/users", { method: "POST", headers: { Authorization: authorization, "Content-Type": "application/json" }, body: JSON.stringify({ ...body, role: "bridal_owner" }) });
    if (!result.response.ok) return sendJson(response, result.response.status, { message: result.data?.message || "Unable to create your account." });
    return sendJson(response, 201, { id: result.data?.id });
  } catch { return sendJson(response, 502, { message: "Unable to create your account." }); }
}
