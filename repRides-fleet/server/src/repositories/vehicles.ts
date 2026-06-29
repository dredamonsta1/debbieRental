import { randomUUID } from "node:crypto";
import { db } from "../db";
import type { Vehicle, VehicleStatus } from "../types";

export interface VehicleInput {
  make: string;
  model: string;
  year: number;
  plate: string;
  status?: VehicleStatus;
  photo_url?: string | null;
  seats?: number | null;
  transmission?: string | null;
  features?: string | null;
  daily_rate?: number | null;
  weekly_rate?: number | null;
}

export async function listVehicles(): Promise<Vehicle[]> {
  return db.prepare("SELECT * FROM vehicles ORDER BY created_at DESC").all() as Vehicle[];
}

export async function listAvailableVehicles(): Promise<Vehicle[]> {
  return db
    .prepare("SELECT * FROM vehicles WHERE status = 'available' ORDER BY make, model")
    .all() as Vehicle[];
}

export async function getVehicle(id: string): Promise<Vehicle | null> {
  const row = db.prepare("SELECT * FROM vehicles WHERE id = ?").get(id) as Vehicle | undefined;
  return row ?? null;
}

export async function createVehicle(input: VehicleInput): Promise<Vehicle> {
  const id = randomUUID();
  db.prepare(
    `INSERT INTO vehicles
     (id, make, model, year, plate, status, photo_url, seats, transmission, features, daily_rate, weekly_rate)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    input.make,
    input.model,
    input.year,
    input.plate,
    input.status ?? "available",
    input.photo_url ?? null,
    input.seats ?? null,
    input.transmission ?? null,
    input.features ?? null,
    input.daily_rate ?? null,
    input.weekly_rate ?? null
  );
  const created = await getVehicle(id);
  if (!created) throw new Error("Failed to create vehicle");
  return created;
}

export async function updateVehicleStatus(id: string, status: VehicleStatus): Promise<Vehicle | null> {
  db.prepare("UPDATE vehicles SET status = ? WHERE id = ?").run(status, id);
  return getVehicle(id);
}

export async function deleteVehicle(id: string): Promise<boolean> {
  const result = db.prepare("DELETE FROM vehicles WHERE id = ?").run(id);
  return result.changes > 0;
}
