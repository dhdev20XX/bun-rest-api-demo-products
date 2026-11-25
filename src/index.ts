import { runMigrations } from "./db/migrate";
import { handleProductRoutes } from "./routes/productRoutes";
import { handleImageRoutes } from "./routes/imageRoutes";

runMigrations();

import { auth } from "./auth";
import { withCors } from "./http/cors";

const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);

    if (req.method === "OPTIONS") {
      return withCors(new Response(null, { status: 204 }), req);
    }

    // 1. Better Auth Handler
    if (url.pathname.startsWith("/api/auth")) {
      const response = await auth.handler(req);
      return withCors(response, req);
    }

    // 2. Image Routes (Serving, Uploads)
    const imageResponse = await handleImageRoutes(req, url);
    if (imageResponse) {
      return withCors(imageResponse, req);
    }

    // 3. Product Routes (CRUD)
    const productResponse = await handleProductRoutes(req, url);
    if (productResponse) {
      return withCors(productResponse, req);
    }

    const notFoundResponse = new Response("Not Found", { status: 404 });
    return withCors(notFoundResponse, req);
  },
});

console.log(`🚀 Server running at http://localhost:${server.port}`);
