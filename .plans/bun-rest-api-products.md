# Bun REST API Products Demo Plan

> **Status:** Ready for implementation

## Outcome and boundaries

- **Problem and target:** Create a REST API demo using Bun that showcases authentication with `better-auth`, SQLite storage, Cloudflare R2 image uploads via presigned URLs, and on-the-fly image optimization to WebP using Bun's Image API.
- **In scope:**
  - Authentication using `better-auth` (Email/Password + Username).
  - Product CRUD operations (Create, Read, Update, Delete).
  - Cloudflare R2 integration for image storage.
  - Presigned URLs for frontend image uploads.
  - Image serving endpoint that converts R2 images to WebP.
  - SQLite database using `bun:sqlite`.
  - Database seeding with dummy products.
- **Out of scope:**
  - Frontend implementation.
  - Complex Role-Based Access Control (RBAC) beyond authenticated vs. unauthenticated.
  - Advanced image manipulation (cropping, etc.) beyond WebP conversion.
- **Approach:** Use Bun's built-in APIs (`bun:sqlite`, `S3Client`, `Bun.Image`) and `better-auth` for a lean, high-performance implementation.

## Key files, evidence, and decisions

| File or source | Why it matters | Decision or plan impact |
|---|---|---|
| `auth.ts` | Auth configuration | Use `better-auth` with `username` plugin and `bun:sqlite` adapter. |
| `db.ts` | Database connection | Centralize `bun:sqlite` instance for both auth and product data. |
| `products.ts` | Product logic/routes | Implement CRUD and R2 integration. |
| `index.ts` | Entry point | Configure `Bun.serve` with routes and auth middleware. |
| `seed.ts` | Data initialization | Populate SQLite with dummy products. |
| `bun:sqlite` | Storage | Use built-in SQLite for zero-dependency local DB. |
| `S3Client` | Storage | Use Bun's S3 client for R2 compatibility. |
| `Bun.Image` | Processing | Use `.image().webp()` pipeline for optimized image serving. |

- **Open gate:** Cloudflare R2 credentials (will use environment variables).

## Tasks

#### T1 — Project Setup & Configuration

- **Change:**
  - Initialize Bun project.
  - Install `better-auth`.
  - Set up `.env` for R2 credentials (`R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_ENDPOINT`) and `BETTER_AUTH_SECRET`.
- **Starts at:** Root
- **Verify:**
  - Run `bun install`; expect success.
  - `bun --version` returns valid version.

#### T2 — Database & Auth Setup

- **Change:**
  - Create `db.ts` initializing `new Database("database.sqlite")`.
  - Create `auth.ts` configuring `betterAuth` with `emailAndPassword` enabled and `username()` plugin.
  - Use `bunx --bun auth@latest generate` to create the auth schema.
- **Starts at:** `auth.ts`, `db.ts`
- **Verify:**
  - `database.sqlite` file is created and contains auth tables.

#### T3 — Product Schema & Seeding

- **Change:**
  - Create `products` table: `id` (TEXT PRIMARY KEY), `name` (TEXT), `image` (TEXT), `category` (TEXT), `detail` (TEXT).
  - Add constraint for `category` to be one of ('smartphones', 'headphones', 'laptops').
  - Create `seed.ts` to insert dummy products.
- **Starts at:** `db.ts`
- **Verify:**
  - Run `bun seed.ts`; expect "Database seeded successfully".
  - Check `database.sqlite` for product entries.

#### T4 — Authentication Middleware & Product CRUD

- **Change:**
  - Implement `Bun.serve` routes for Product CRUD.
  - Add authentication check using `auth.api.getSession` (or similar better-auth utility) to protect product endpoints.
  - Endpoints:
    - `GET /products` -> List all.
    - `GET /products/:id` -> Get one.
    - `POST /products` -> Create (Protected).
    - `PUT /products/:id` -> Update (Protected).
    - `DELETE /products/:id` -> Delete (Protected).
- **Starts at:** `index.ts`
- **Verify:**
  - Try `GET /products` (unauthenticated) -> Expect 401/Forbidden.
  - Try `GET /products` (authenticated) -> Expect 200 OK.

#### T5 — Image Upload (Presigned URLs)

- **Change:**
  - Implement `GET /products/upload-url` (Protected).
  - Logic:
    - Generate a unique file path (e.g., `products/${crypto.randomUUID()}`).
    - Use `S3Client.presign(path, { method: "PUT", type: "image/..." })`.
    - Validate that requested type is `jpg`, `png`, or `webp`.
- **Starts at:** `index.ts`
- **Verify:**
  - Call `/products/upload-url` with `?type=jpg`; expect 200 and a URL.
  - Call `/products/upload-url` with `?type=gif`; expect 400.

#### T6 — Optimized Image Serving

- **Change:**
  - Implement `GET /products/image/:path` (Public).
  - Logic:
    - Use `Bun.s3.file(path).image()`.
    - Check for resize parameter (e.g., `?thumb=true`).
    - If `thumb=true`, call `.resize(200, 200)`.
    - Call `.webp().blob()`.
    - Return as `Response` with `Content-Type: image/webp`.
- **Starts at:** `index.ts`
- **Verify:**
  - Request an image via `/products/image/...`; expect full-size WebP.
  - Request an image via `/products/image/...?thumb=true`; expect 200x200 WebP thumbnail.

## Final acceptance

- **Checks:**
  - [ ] User can register with email, password, and username.
  - [ ] Authenticated users can perform full CRUD on products.
  - [ ] Non-authenticated users cannot access product data (except images).
  - [ ] Presigned URLs are generated correctly for allowed image types.
  - [ ] Images are served in WebP format via the API.
- **End state:** A fully functional REST API deployed/running locally on Bun, integrated with SQLite and Cloudflare R2.
- **Deferrals or blockers:** None.
