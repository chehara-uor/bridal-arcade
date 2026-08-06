/* eslint-disable @typescript-eslint/no-explicit-any */
import { readSession, sendJson, wordpressConfig, wordpressJson } from "./_session.js";

export default async function handler(request: any, response: any) {
  if (request.method !== "GET") return sendJson(response, 405, { message: "Method not allowed." });
  const session = readSession(request);
  if (!session) return sendJson(response, 401, { message: "Your session has expired." });

  try {
    const { authorization } = wordpressConfig();
    const query = new URLSearchParams({ owner_email: session.email, limit: "20" });
    const result = await wordpressJson(`/wp-json/lead-tracker/v1/recent-activity?${query}`, {
      headers: { Authorization: authorization },
    });
    if (!result.response.ok) {
      return sendJson(response, result.response.status, { message: "Unable to load recent Lead Tracker activity." });
    }
    return sendJson(response, 200, result.data);
  } catch {
    return sendJson(response, 502, { message: "Unable to connect to Lead Tracker." });
  }
}
