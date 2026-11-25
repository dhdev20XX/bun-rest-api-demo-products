# Bun REST API Products Demo

A high-performance REST API demo built with [Bun](https://bun.sh), showcasing authentication with `better-auth`, SQLite storage, and Cloudflare R2 image integration.

## Features

- **Authentication**: Email/Password and Username registration using `better-auth`.
- **Product Management**: Full CRUD for products (Name, Image, Category, Detail).
- **Cloudflare R2**: 
  - Direct image uploads via presigned URLs.
  - On-the-fly image optimization to WebP using Bun's Image API.
  - Dynamic thumbnail generation (200x200).
- **Database**: Zero-dependency local storage using `bun:sqlite`.

## Getting Started

### Prerequisites

- Bun installed (`curl -fsSL https://bun.sh/install | bash`)
- A Cloudflare R2 bucket and API credentials.

### Setup

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd bun-rest-api-products
   ```

2. **Install Dependencies**
   ```bash
   bun install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   BETTER_AUTH_SECRET=your_super_secret_key_at_least_32_chars
   BETTER_AUTH_URL=http://localhost:3000
   R2_ACCESS_KEY_ID=your_access_key_id
   R2_SECRET_ACCESS_KEY=your_secret_access_key
   R2_BUCKET=your_bucket_name
   R2_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
   ```

4. **Database Initialization**
   Initialize the authentication schema, run app migrations, and seed the database with dummy products:
   ```bash
   # Generate Better Auth schema
   bun run generate

   # Apply Better Auth migrations
   bun run migrate

   # Apply application-specific migrations
   bun run db:migrate

   # Seed the database
   bun run seed
   ```

### Running the Application

```bash
# Development mode (with hot-reload)
bun run dev

# Production mode
bun run start
```

## API Documentation

### Authentication
All authentication routes are handled by `better-auth` at `/api/auth/*`. The API uses HTTP-only cookies for session management.

#### Sign Up
- **Endpoint**: `POST /api/auth/sign-up/email`
- **Body**: 
  ```json
  {
    "email": "user@example.com",
    "password": "strong-password",
    "username": "unique_username"
  }
  ```

#### Sign In
- **Endpoint**: `POST /api/auth/sign-in/email`
- **Body**: 
  ```json
  {
    "email": "user@example.com",
    "password": "strong-password"
  }
  ```
- **Response**: Sets a session cookie in the browser/client.

#### Sign Out
- **Endpoint**: `POST /api/auth/sign-out`
- **Description**: Clears the session cookie.

#### Session Check
- **Endpoint**: `GET /api/auth/get-session`
- **Description**: Returns the current user's session and profile if authenticated.


### Product Endpoints
*Requires authentication*

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/products` | List all products |
| `GET` | `/products/:id` | Get details for a specific product |
| `POST` | `/products` | Create a new product (JSON body: `name`, `image`, `category`, `detail`) |
| `PUT` | `/products/:id` | Update a product (JSON body: `name`, `image`, `category`, `detail`) |
| `DELETE` | `/products/:id` | Delete a product |

### Image Endpoints

#### Get Upload URL
*Requires authentication*
- **Endpoint**: `GET /products/upload-url?filename=image.jpg`
- **Description**: Generates a presigned PUT URL for Cloudflare R2. Filename must end with `.jpg`, `.png`, or `.webp`.
- **Response**: `{ "uploadUrl": "...", "path": "products/image.jpg" }`

#### Delete Image
*Requires authentication*
- **Endpoint**: `DELETE /products/delete-image?filename=image.jpg`
- **Description**: Deletes the image from R2.
- **Response**: `{ "message": "Image deleted successfully", "path": "products/image.jpg" }`

#### Serve Image
*Public*
- **Endpoint**: `GET /products/image/:path`
- **Query Params**: `thumb=true` (Optional: resizes image to 200x200)
- **Description**: Serves the requested image from R2 converted to WebP format.

## Project Structure

```text
.
├── src/
│   ├── controllers/    # Business logic for products and images
│   │   ├── imageController.ts
│   │   └── productController.ts
│   ├── db/             # Database connection and migrations
│   │   ├── connection.ts
│   │   ├── migrate.ts
│   │   └── migrations/
│   ├── routes/         # Route handlers for products and images
│   │   ├── imageRoutes.ts
│   │   └── productRoutes.ts
│   ├── index.ts        # Server entry point
│   ├── auth.ts         # Better Auth configuration
│   ├── s3.ts           # Cloudflare R2 configuration
│   ├── seed.ts         # Database seeding script
│   └── types.ts        # Shared TypeScript types
├── .env           # Environment variables
├── package.json        # Scripts and dependencies
└── README.md           # Instructions
```
