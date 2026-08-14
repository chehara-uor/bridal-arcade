import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { componentTagger } from "lovable-tagger";

// Every non-underscore-prefixed file in api/ is a Vercel-style serverless handler
// (`(req, res) => ...`, default export). Vite's dev server doesn't know how to run
// those on its own, so this middleware shims the same routing Vercel does in prod,
// including Vercel's `[action].ts` dynamic-segment convention (api/foo/[action].ts
// handles any /api/foo/<anything> and reads the segment out of the URL itself).
// The route table is derived from the filesystem (not hand-maintained) so a new
// api/foo.ts is picked up automatically instead of silently 404ing only in local dev.
function discoverLocalApiRoutes(): { exact: Record<string, string>; dynamic: { prefix: string; modulePath: string }[] } {
  const apiDir = path.resolve(__dirname, "api");
  const exact: Record<string, string> = {};
  const dynamic: { prefix: string; modulePath: string }[] = [];
  const walk = (dir: string, routePrefix: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith("_")) continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) { walk(fullPath, `${routePrefix}/${entry.name}`); continue; }
      if (!entry.name.endsWith(".ts")) continue;
      const modulePath = `/api${fullPath.slice(apiDir.length).replace(/\\/g, "/")}`;
      if (/^\[.+\]\.ts$/.test(entry.name)) dynamic.push({ prefix: `${routePrefix}/`, modulePath });
      else exact[`${routePrefix}/${entry.name.slice(0, -3)}`] = modulePath;
    }
  };
  walk(apiDir, "/api");
  dynamic.sort((a, b) => b.prefix.length - a.prefix.length);
  return { exact, dynamic };
}

function localServerApi(): Plugin {
  return { name: "bridal-arcade-local-api", apply: "serve", configureServer(server) {
    const { exact, dynamic } = discoverLocalApiRoutes();
    server.middlewares.use(async (request, response, next) => {
      const pathname = new URL(request.url || "/", "http://localhost").pathname;
      const modulePath = exact[pathname] ?? dynamic.find((route) => pathname.startsWith(route.prefix))?.modulePath;
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
