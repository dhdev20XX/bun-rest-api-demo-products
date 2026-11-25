const frontendOrigin = "http://localhost:5173";

export function withCors(response: Response, request: Request) {
  const origin = request.headers.get("Origin");

  if (origin !== frontendOrigin) {
    return response;
  }

  const headers = new Headers(response.headers);

  headers.set("Access-Control-Allow-Origin", origin);
  headers.set("Access-Control-Allow-Credentials", "true");
  headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  headers.set("Vary", "Origin");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}