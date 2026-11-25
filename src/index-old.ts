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

    // 1. Better Auth Handler
    if (url.pathname.startsWith("/api/auth")) {
      return auth.handler(req);
    }

    // 2. Image Routes (Serving, Uploads)
    const imageResponse = await handleImageRoutes(req, url);
    if (imageResponse) {
      return imageResponse;
    }

    // 3. Product Routes (CRUD)
    const productResponse = await handleProductRoutes(req, url);
    if (productResponse) {
      return productResponse;
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`🚀 Server running at http://localhost:${server.port}`);
