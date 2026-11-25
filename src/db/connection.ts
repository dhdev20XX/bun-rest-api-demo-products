import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Database } from "bun:sqlite";

const defaultDbPath = fileURLToPath(new URL("../../data/database.sqlite", import.meta.url));

export const dbPath = process.env.DATABASE_PATH ?? defaultDbPath;

mkdirSync(dirname(dbPath), { recursive: true });

export const db = new Database(dbPath, {
  create: true,
  readwrite: true,
  strict: true,
});

db.run("PRAGMA journal_mode = WAL;");
db.run("PRAGMA foreign_keys = ON;");