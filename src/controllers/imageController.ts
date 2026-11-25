import { r2 } from "../s3";

export const imageController = {
  async serveImage(req: Request, url: URL) {
    const path = url.pathname.replace("/products/image/", "");
    const isThumb = url.searchParams.get("thumb") === "true";

    try {
      const imgPipeline = r2.file(path).image();
      if (isThumb) {
        imgPipeline.resize(200, 200, { fit: "inside" });
      }
      const blob = await imgPipeline.webp().blob();
      return new Response(blob, {
        headers: { "Content-Type": "image/webp" },
      });
    } catch (e) {
      return new Response("Image not found", { status: 404 });
    }
  },

  async getUploadUrl(req: Request, url: URL) {
    try {
      const filename = url.searchParams.get("filename");

      let type;

      if (filename) {
        type = filename.slice(filename.lastIndexOf(".")).toLowerCase();
      }

      const allowedTypes = [".jpg", ".png", ".webp"];
      if (!type || !allowedTypes.includes(type)) {
        return new Response("Invalid or missing image type. Allowed: jpg, png, webp", { status: 400 });
      }

      const path = `products/${filename}`;
      const presignedUrl = r2.presign(path, {
        method: "PUT",
        type: `image/${type === "jpg" ? "jpeg" : type}`,
        expiresIn: 3600,
      });

      return Response.json({ uploadUrl: presignedUrl, path });
    } catch (error) {
      return new Response(`Internal Server Error: ${error}`, { status: 500 });
    }
  },

  async deleteImage(req: Request, url: URL) {
    try {
      const filename = url.searchParams.get("filename");
      if (!filename) {
        return new Response("Filename is required", { status: 400 });
      }

      const path = `products/${filename}`;

      // Using Bun's S3Client file handle to delete
      await r2.file(path).delete();

      return Response.json({ message: "Image deleted successfully", path });
    } catch (error) {
      // if (error.message.includes("not found")) {
      //   return new Response("Image not found", { status: 404 });
      // }
      // Check if it's a standard Error object and has a message property
      if (error instanceof Error && error.message.includes("not found")) {
        return new Response("Image not found", { status: 404 });
      }
      return new Response(`Internal Server Error: ${error}`, { status: 500 });
    }
  }
};
