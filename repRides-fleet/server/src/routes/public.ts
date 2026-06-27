import { Router } from "express";
import * as customers from "../repositories/customers";
import * as rentals from "../repositories/rentals";
import * as vehicles from "../repositories/vehicles";

export const publicRouter = Router();

publicRouter.get("/vehicles", async (_req, res) => {
  res.json(await vehicles.listAvailableVehicles());
});

publicRouter.post("/rentals/request", async (req, res) => {
  const { customer, vehicle_id, start_at, due_at, notes } = req.body ?? {};

  if (!customer?.name || !vehicle_id || !start_at || !due_at) {
    return res
      .status(400)
      .json({ error: "customer.name, vehicle_id, start_at, due_at are required" });
  }

  const vehicle = await vehicles.getVehicle(vehicle_id);
  if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });
  if (vehicle.status !== "available") {
    return res.status(409).json({ error: "Vehicle is not available" });
  }

  if (Date.parse(due_at) <= Date.parse(start_at)) {
    return res.status(400).json({ error: "Return date must be after pickup date" });
  }

  let cust = customer.email ? await customers.findCustomerByEmail(customer.email) : null;
  if (!cust) {
    cust = await customers.createCustomer({
      name: customer.name,
      email: customer.email ?? null,
      phone: customer.phone ?? null,
      license_number: customer.license_number ?? null,
    });
  }

  const rental = await rentals.requestRental({
    vehicle_id,
    customer_id: cust.id,
    start_at,
    due_at,
    notes: notes ?? null,
  });

  res.status(201).json({ rental, customer: cust });
});
