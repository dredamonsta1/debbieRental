import { Router } from "express";
import * as repo from "../repositories/customers";

export const customersRouter = Router();

customersRouter.get("/", async (_req, res) => {
  res.json(await repo.listCustomers());
});

customersRouter.get("/:id", async (req, res) => {
  const customer = await repo.getCustomer(req.params.id);
  if (!customer) return res.status(404).json({ error: "Customer not found" });
  res.json(customer);
});

customersRouter.post("/", async (req, res) => {
  const { name, email, phone, license_number } = req.body ?? {};
  if (!name) return res.status(400).json({ error: "name is required" });
  const created = await repo.createCustomer({ name, email, phone, license_number });
  res.status(201).json(created);
});
