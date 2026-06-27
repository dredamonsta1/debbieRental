import { randomUUID } from "node:crypto";
import { db } from "../db";
import type { Rental, RentalStatus } from "../types";

export interface RentalInput {
  vehicle_id: string;
  customer_id: string;
  start_at: string;
  due_at: string;
  notes?: string | null;
}

export async function listRentals(): Promise<Rental[]> {
  return db.prepare("SELECT * FROM rentals ORDER BY start_at DESC").all() as Rental[];
}

export async function getRental(id: string): Promise<Rental | null> {
  const row = db.prepare("SELECT * FROM rentals WHERE id = ?").get(id) as Rental | undefined;
  return row ?? null;
}

export async function createRental(input: RentalInput): Promise<Rental> {
  const id = randomUUID();
  const startMs = Date.parse(input.start_at);
  const status: RentalStatus = startMs <= Date.now() ? "active" : "scheduled";

  const tx = db.transaction(() => {
    db.prepare(
      `INSERT INTO rentals (id, vehicle_id, customer_id, start_at, due_at, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(id, input.vehicle_id, input.customer_id, input.start_at, input.due_at, status, input.notes ?? null);

    if (status === "active") {
      db.prepare("UPDATE vehicles SET status = 'rented' WHERE id = ?").run(input.vehicle_id);
    }
  });
  tx();

  const created = await getRental(id);
  if (!created) throw new Error("Failed to create rental");
  return created;
}

export async function returnRental(id: string): Promise<Rental | null> {
  const rental = await getRental(id);
  if (!rental) return null;

  const returnedAt = new Date().toISOString();
  const tx = db.transaction(() => {
    db.prepare(
      "UPDATE rentals SET returned_at = ?, status = 'returned' WHERE id = ?"
    ).run(returnedAt, id);
    db.prepare("UPDATE vehicles SET status = 'available' WHERE id = ?").run(rental.vehicle_id);
  });
  tx();

  return getRental(id);
}

export async function listDueSoon(withinHours = 24): Promise<Rental[]> {
  const cutoffMs = Date.now() + withinHours * 60 * 60 * 1000;
  const rows = db
    .prepare(
      `SELECT * FROM rentals
       WHERE status IN ('active','scheduled')
       ORDER BY due_at ASC`
    )
    .all() as Rental[];
  return rows.filter((r) => Date.parse(r.due_at) <= cutoffMs);
}

export async function markOverdue(): Promise<number> {
  const nowMs = Date.now();
  const rows = db
    .prepare(
      `SELECT id, due_at FROM rentals
       WHERE status IN ('active','scheduled') AND returned_at IS NULL`
    )
    .all() as { id: string; due_at: string }[];
  const overdueIds = rows.filter((r) => Date.parse(r.due_at) < nowMs).map((r) => r.id);
  if (overdueIds.length === 0) return 0;
  const stmt = db.prepare("UPDATE rentals SET status = 'overdue' WHERE id = ?");
  const tx = db.transaction((ids: string[]) => {
    for (const id of ids) stmt.run(id);
  });
  tx(overdueIds);
  return overdueIds.length;
}
