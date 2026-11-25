import { readFileSync } from "node:fs";
import { db } from "./connection";

type Migration = {
  id: string;
  name: string;
  file: string;
};

const migrations: Migration[] = [
  {
    id: "001",
    name: "create_auth_tables",
    file: "001_create_auth_tables.sql",
  },
  {
    id: "002",
    name: "create_app_tables",
    file: "002_create_app_tables.sql",
  },
];

const createMigrationsTableSql = `
  CREATE TABLE IF NOT EXISTS app_migrations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    applied_at TEXT NOT NULL
  );
`;

function ensureMigrationsTable() {
  db.run(createMigrationsTableSql);
}

function readMigrationSql(file: string) {
  return readFileSync(new URL(`./migrations/sql/${file}`, import.meta.url), "utf8");
}

export function runMigrations() {
  ensureMigrationsTable();

  const findAppliedMigration = db.query<{ id: string }, { id: string }>(
    "SELECT id FROM app_migrations WHERE id = $id",
  );

  const insertAppliedMigration = db.query<unknown, { id: string; name: string; appliedAt: string }>(
    `
      INSERT INTO app_migrations (id, name, applied_at)
      VALUES ($id, $name, $appliedAt)
    `,
  );

  for (const migration of migrations) {

    //console.log(migration);
    const applied = findAppliedMigration.get({ id: migration.id });

    if (applied) {
      continue;
    }

    const sql = readMigrationSql(migration.file);

    const applyMigration = db.transaction(() => {
      db.run(sql);
      insertAppliedMigration.run({
        id: migration.id,
        name: migration.name,
        appliedAt: new Date().toISOString(),
      });
    });

    applyMigration();
    console.log(`Applied migration ${migration.id}: ${migration.name}`);
  }
}

if (import.meta.main) {
  runMigrations();
  console.log("Database migrations are up to date.");
}
