import { Router } from "express";
import * as repo from "../repositories/rentals";

export const rentalsRouter = Router();

rentalsRouter.get("/", async (_req, res) => {
  res.json(await repo.listRentals());
});

rentalsRouter.get("/due-soon", async (req, res) => {
  const hours = Number(req.query.hours ?? 24);
  res.json(await repo.listDueSoon(hours));
});

rentalsRouter.get("/:id", async (req, res) => {
  const rental = await repo.getRental(req.params.id);
  if (!rental) return res.status(404).json({ error: "Rental not found" });
  res.json(rental);
});

rentalsRouter.post("/", async (req, res) => {
  const { vehicle_id, customer_id, start_at, due_at, notes } = req.body ?? {};
  if (!vehicle_id || !customer_id || !start_at || !due_at) {
    return res
      .status(400)
      .json({ error: "vehicle_id, customer_id, start_at, due_at are required" });
  }
  const created = await repo.createRental({ vehicle_id, customer_id, start_at, due_at, notes });
  res.status(201).json(created);
});

rentalsRouter.post("/:id/return", async (req, res) => {
  const returned = await repo.returnRental(req.params.id);
  if (!returned) return res.status(404).json({ error: "Rental not found" });
  res.json(returned);
});

rentalsRouter.post("/:id/approve", async (req, res) => {
  const approved = await repo.approveRental(req.params.id);
  if (!approved) return res.status(404).json({ error: "Requested rental not found" });
  res.json(approved);
});

rentalsRouter.post("/:id/reject", async (req, res) => {
  const ok = await repo.rejectRental(req.params.id);
  if (!ok) return res.status(404).json({ error: "Requested rental not found" });
  res.status(204).send();
});
