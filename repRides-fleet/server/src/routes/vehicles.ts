import { Router } from "express";
import * as repo from "../repositories/vehicles";

export const vehiclesRouter = Router();

vehiclesRouter.get("/", async (req, res) => {
  const available = req.query.available === "true";
  const rows = available ? await repo.listAvailableVehicles() : await repo.listVehicles();
  res.json(rows);
});

vehiclesRouter.get("/:id", async (req, res) => {
  const vehicle = await repo.getVehicle(req.params.id);
  if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });
  res.json(vehicle);
});

vehiclesRouter.post("/", async (req, res) => {
  const {
    make,
    model,
    year,
    plate,
    status,
    photo_url,
    seats,
    transmission,
    features,
    daily_rate,
    weekly_rate,
  } = req.body ?? {};
  if (!make || !model || !year || !plate) {
    return res.status(400).json({ error: "make, model, year, plate are required" });
  }
  const created = await repo.createVehicle({
    make,
    model,
    year,
    plate,
    status,
    photo_url,
    seats,
    transmission,
    features,
    daily_rate,
    weekly_rate,
  });
  res.status(201).json(created);
});

vehiclesRouter.patch("/:id/status", async (req, res) => {
  const { status } = req.body ?? {};
  if (!status) return res.status(400).json({ error: "status is required" });
  const updated = await repo.updateVehicleStatus(req.params.id, status);
  if (!updated) return res.status(404).json({ error: "Vehicle not found" });
  res.json(updated);
});

vehiclesRouter.delete("/:id", async (req, res) => {
  const ok = await repo.deleteVehicle(req.params.id);
  if (!ok) return res.status(404).json({ error: "Vehicle not found" });
  res.status(204).send();
});
