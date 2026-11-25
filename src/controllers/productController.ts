import { db } from "../db/connection";

import type { Product } from '../types'

export const productController = {
  async listProducts() {
    //await new Promise(resolve => setTimeout(resolve, 2000));
    try {
      const products = db.query("SELECT * FROM products").all();
      return Response.json(products);
    } catch (error) {
      return new Response(`Internal Server Error: ${error}`, { status: 500 });
    }
  },

  async getProduct(id: string) {
    //await new Promise(resolve => setTimeout(resolve, 2000));
    try {
      const product = db.query("SELECT * FROM products WHERE id = ?").get(id);
      if (!product) return new Response("Product not found", { status: 404 });
      return Response.json(product);
    } catch (error) {
      return new Response(`Internal Server Error: ${error}`, { status: 500 });
    }
  },

  // async createProduct(req: Request) {
  //   try {
  //     const body = (await req.json()) as Omit<Product, "id">;
  //     const { name, image, category, detail } = body;
  //     if (!name || !image || !category || !detail) {
  //       return new Response("Missing fields", { status: 400 });
  //     }
  //     const id = crypto.randomUUID();
  //     db.prepare("INSERT INTO products (id, name, image, category, detail) VALUES (?, ?, ?, ?, ?)")
  //       .run(id, name, image, category, detail);
  //     return Response.json({ id }, { status: 201 });
  //   } catch (error) {
  //     return new Response(`Internal Server Error: ${error}`, { status: 500 });
  //   }
  // },

  async createProduct(req: Request) {
    try {
      const body = (await req.json()) as Omit<Product, "id">;
      const { name, image, category, detail } = body;
      if (!name || !image || !category || !detail) {
        return new Response("Missing fields", { status: 400 });
      }
      const id = crypto.randomUUID();
      const result = db.query(
        "INSERT INTO products (id, name, image, category, detail) VALUES (?, ?, ?, ?, ?) RETURNING *"
      ).get(id, name, image, category, detail);
      return Response.json(result);
    } catch (error) {
      return new Response(`Internal Server Error: ${error}`, { status: 500 });
    }
  },

  // async updateProduct(req: Request, id: string) {
  //   try {
  //     const body = (await req.json()) as Omit<Product, "id">;
  //     const { name, image, category, detail } = body;

  //     const existing = db.query("SELECT * FROM products WHERE id = ?").get(id);
  //     if (!existing) return new Response("Product not found", { status: 404 });

  //    db.prepare("UPDATE products SET name = ?, image = ?, category = ?, detail = ? WHERE id = ?")
  //       .run(name, image, category, detail, id);

  //     return new Response("Updated", { status: 200 });
  //   } catch (error) {
  //     return new Response(`Internal Server Error: ${error}`, { status: 500 });
  //   }
  // },

  async updateProduct(req: Request, id: string) {
    try {
      const body = (await req.json()) as Omit<Product, "id">;
      const { name, image, category, detail } = body;

      // Use RETURNING to get the data back immediately
      const result = db.query(
        "UPDATE products SET name = ?, image = ?, category = ?, detail = ? WHERE id = ? RETURNING *"
      ).get(name, image, category, detail, id);

      if (!result) return new Response("Product not found", { status: 404 });

      return Response.json(result);
    } catch (error) {
      return new Response(`Internal Server Error: ${error}`, { status: 500 });
    }
  },

  /**
     * PATCH /products/:id
     * Partially updates only the fields provided in the body
     */
  async patchProduct(req: Request, id: string) {
    try {
      const body = (await req.json()) as Partial<Omit<Product, "id">>;
      const keys = Object.keys(body);

      if (keys.length === 0) {
        return new Response("No fields provided for update", { status: 400 });
      }

      // Dynamically construct the SET clause and parameter list
      // Example: "UPDATE products SET name = ?, image = ? WHERE id = ? ..."
      const setClause = keys.map(key => `${key} = ?`).join(", ");
      const values = keys.map(key => body[key as keyof Omit<Product, "id">]) as any[];

      // Add the ID to the end of the values for the WHERE clause
      values.push(id);

      const sql = `UPDATE products SET ${setClause} WHERE id = ? RETURNING *`;

      const result = db.query(sql).get(...values);

      if (!result) return new Response("Product not found", { status: 404 });
      return Response.json(result);
    } catch (error) {
      return new Response(`Internal Server Error: ${error}`, { status: 500 });
    }
  },

  async deleteProduct(id: string) {
    try {
      db.prepare("DELETE FROM products WHERE id = ?").run(id);
      return new Response("Deleted", { status: 200 });
    } catch (error) {
      return new Response(`Internal Server Error: ${error}`, { status: 500 });
    }
  }
};
