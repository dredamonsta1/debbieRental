import Database, { type Database as BetterSqliteDatabase } from "better-sqlite3";
import { join } from "node:path";

const SCHEMA = `
CREATE TABLE IF NOT EXISTS vehicles (
  id          TEXT PRIMARY KEY,
  make        TEXT NOT NULL,
  model       TEXT NOT NULL,
  year        INTEGER NOT NULL,
  plate       TEXT NOT NULL UNIQUE,
  status      TEXT NOT NULL CHECK (status IN ('available','rented','maintenance')) DEFAULT 'available',
  photo_url   TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS customers (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  email           TEXT,
  phone           TEXT,
  license_number  TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS rentals (
  id          TEXT PRIMARY KEY,
  vehicle_id  TEXT NOT NULL REFERENCES vehicles(id),
  customer_id TEXT NOT NULL REFERENCES customers(id),
  start_at    TEXT NOT NULL,
  due_at      TEXT NOT NULL,
  returned_at TEXT,
  status      TEXT NOT NULL CHECK (status IN ('requested','scheduled','active','returned','overdue')) DEFAULT 'scheduled',
  notes       TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_rentals_vehicle ON rentals(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_rentals_customer ON rentals(customer_id);
CREATE INDEX IF NOT EXISTS idx_rentals_status ON rentals(status);
CREATE INDEX IF NOT EXISTS idx_rentals_due_at ON rentals(due_at);
`;

const dbPath = process.env.DATABASE_PATH ?? join(process.cwd(), "data", "fleet.db");

export const db: BetterSqliteDatabase = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.exec(SCHEMA);

const rentalsTable = db
  .prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='rentals'")
  .get() as { sql: string } | undefined;
if (rentalsTable && !rentalsTable.sql.includes("'requested'")) {
  db.exec(`
    BEGIN;
    ALTER TABLE rentals RENAME TO rentals_old;
    CREATE TABLE rentals (
      id          TEXT PRIMARY KEY,
      vehicle_id  TEXT NOT NULL REFERENCES vehicles(id),
      customer_id TEXT NOT NULL REFERENCES customers(id),
      start_at    TEXT NOT NULL,
      due_at      TEXT NOT NULL,
      returned_at TEXT,
      status      TEXT NOT NULL CHECK (status IN ('requested','scheduled','active','returned','overdue')) DEFAULT 'scheduled',
      notes       TEXT,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );
    INSERT INTO rentals SELECT * FROM rentals_old;
    DROP TABLE rentals_old;
    CREATE INDEX IF NOT EXISTS idx_rentals_vehicle ON rentals(vehicle_id);
    CREATE INDEX IF NOT EXISTS idx_rentals_customer ON rentals(customer_id);
    CREATE INDEX IF NOT EXISTS idx_rentals_status ON rentals(status);
    CREATE INDEX IF NOT EXISTS idx_rentals_due_at ON rentals(due_at);
    COMMIT;
  `);
  console.log("[db] migrated rentals table to include 'requested' status");
}
