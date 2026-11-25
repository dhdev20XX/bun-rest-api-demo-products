CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    image TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('smartphones', 'headphones', 'laptops')),
    detail TEXT NOT NULL
  );
