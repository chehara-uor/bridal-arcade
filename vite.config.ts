import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { componentTagger } from "lovable-tagger";

// Every non-underscore-prefixed file in api/ is a Vercel-style serverless handler
// (`(req, res) => ...`, default export). Vite's dev server doesn't know how to run
// those on its own, so this middleware shims the same routing Vercel does in prod.
// The route table is derived from the filesystem (not hand-maintained) so a new
// api/foo.ts is picked up automatically instead of silently 404ing only in local dev.
function discoverLocalApiRoutes(): Record<string, string> {
  const apiDir = path.resolve(__dirname, "api");
  const routes: Record<string, string> = {};
  for (const entry of fs.readdirSync(apiDir)) {
    if (!entry.endsWith(".ts") || entry.startsWith("_")) continue;
    const name = entry.slice(0, -3);
    routes[`/api/${name}`] = `/api/${entry}`;
  }
  return routes;
}

function localServerApi(): Plugin {
  return { name: "bridal-arcade-local-api", apply: "serve", configureServer(server) {
    const localApiRoutes = discoverLocalApiRoutes();
    server.middlewares.use(async (request, response, next) => {
      const modulePath = localApiRoutes[new URL(request.url || "/", "http://localhost").pathname];
      if (!modulePath) return next();
      try { const apiModule = await server.ssrLoadModule(modulePath); await apiModule.default(request, response); }
      catch (error) { server.config.logger.error(error instanceof Error ? error.stack || error.message : String(error)); if (!response.headersSent) { response.statusCode = 500; response.setHeader("Content-Type", "application/json"); response.end(JSON.stringify({ message: "The local API server encountered an error." })); } }
    });
  } };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const serverEnv = loadEnv(mode, process.cwd(), "");
  for (const key of ["WORDPRESS_API_URL", "WORDPRESS_API_USERNAME", "WORDPRESS_API_PASSWORD", "AUTH_SECRET", "SMS_USER_ID", "SMS_API_KEY", "SMS_API_BASE_URL", "SMS_SENDER_ID"]) if (serverEnv[key]) process.env[key] = serverEnv[key];
  return ({
  server: {
    host: "127.0.0.1",
    port: 8080,
  },
  plugins: [
    react(),
    localServerApi(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  });
});
