/* eslint-disable @typescript-eslint/no-explicit-any */
import { readSession, sendJson, wordpressConfig, wordpressJson } from "./_session.js";
export default async function handler(request: any, response: any) {
  if (request.method !== "GET") return sendJson(response, 405, { message: "Method not allowed." });
  const session = readSession(request);
  if (!session) return sendJson(response, 401, { message: "Your session has expired." });
  try {
    const { authorization } = wordpressConfig();
    const result = await wordpressJson(`/wp-json/bridal/v1/productlist?email=${encodeURIComponent(session.email)}`, { headers: { Authorization: authorization } });
    return sendJson(response, result.response.ok ? 200 : result.response.status, result.data);
  } catch { return sendJson(response, 502, { message: "Unable to load products." }); }
}
