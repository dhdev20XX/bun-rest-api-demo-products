import { auth } from "../auth";
import { productController } from "../controllers/productController";

async function getSession(req: Request) {
  return await auth.api.getSession({
    headers: req.headers,
  });
}

export async function handleProductRoutes(req: Request, url: URL) {
  // Product CRUD (Authenticated)
  if (url.pathname.startsWith("/products")) {
    const session = await getSession(req);
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    // GET /products
    if (url.pathname === "/products" && req.method === "GET") {
      return productController.listProducts();
    }

    // POST /products
    if (url.pathname === "/products" && req.method === "POST") {
      return productController.createProduct(req);
    }

    // Handle /products/:id routes
    if (url.pathname.startsWith("/products/") && url.pathname !== "/products/") {
      const id = url.pathname.split("/")[2];

      if (!id) {
        return new Response("Product ID missing", { status: 400 });
      }

      if (req.method === "GET") {
        return productController.getProduct(id);
      }

      if (req.method === "PUT") {
        return productController.updateProduct(req, id);
      }

      if (req.method === "PATCH") {
        return productController.patchProduct(req, id);
      }

      if (req.method === "DELETE") {
        return productController.deleteProduct(id);
      }
    }
  }

  return null; // Let index.ts handle it (e.g. 404)
}
