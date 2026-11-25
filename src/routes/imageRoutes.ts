import { auth } from "../auth";
import { imageController } from "../controllers/imageController";

async function getSession(req: Request) {
  return await auth.api.getSession({
    headers: req.headers,
  });
}

export async function handleImageRoutes(req: Request, url: URL) {
  // Product Image Serving (Public)
  if (url.pathname.startsWith("/products/image/")) {
    return imageController.serveImage(req, url);
  }

  // Presigned URL for Upload (Authenticated)
  if (url.pathname === "/products/upload-url" && req.method === "GET") {
    const session = await getSession(req);
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }
    return imageController.getUploadUrl(req, url);
  }

  // Delete Image (Authenticated)
  if (url.pathname === "/products/delete-image" && req.method === "DELETE") {
    const session = await getSession(req);
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }
    return imageController.deleteImage(req, url);
  }

}
