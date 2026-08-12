import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

const localApiRoutes: Record<string, string> = {
  "/api/login": "/api/login.ts", "/api/session": "/api/session.ts", "/api/logout": "/api/logout.ts",
  "/api/dashboard": "/api/dashboard.ts", "/api/recent-activity": "/api/recent-activity.ts",
  "/api/products": "/api/products.ts", "/api/orders": "/api/orders.ts",
  "/api/product-status": "/api/product-status.ts", "/api/register": "/api/register.ts",
  "/api/vendor-product": "/api/vendor-product.ts",
  "/api/vendor-otp-send": "/api/vendor-otp-send.ts", "/api/widget-register": "/api/widget-register.ts",
};

function localServerApi(): Plugin {
  return { name: "bridal-arcade-local-api", apply: "serve", configureServer(server) {
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
