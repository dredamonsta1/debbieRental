import { randomUUID } from "node:crypto";
import { db } from "../db";
import type { Customer } from "../types";

export interface CustomerInput {
  name: string;
  email?: string | null;
  phone?: string | null;
  license_number?: string | null;
}

export async function listCustomers(): Promise<Customer[]> {
  return db.prepare("SELECT * FROM customers ORDER BY name").all() as Customer[];
}

export async function getCustomer(id: string): Promise<Customer | null> {
  const row = db.prepare("SELECT * FROM customers WHERE id = ?").get(id) as Customer | undefined;
  return row ?? null;
}

export async function findCustomerByEmail(email: string): Promise<Customer | null> {
  const row = db
    .prepare("SELECT * FROM customers WHERE email = ? COLLATE NOCASE LIMIT 1")
    .get(email) as Customer | undefined;
  return row ?? null;
}

export async function createCustomer(input: CustomerInput): Promise<Customer> {
  const id = randomUUID();
  db.prepare(
    `INSERT INTO customers (id, name, email, phone, license_number)
     VALUES (?, ?, ?, ?, ?)`
  ).run(id, input.name, input.email ?? null, input.phone ?? null, input.license_number ?? null);
  const created = await getCustomer(id);
  if (!created) throw new Error("Failed to create customer");
  return created;
}
