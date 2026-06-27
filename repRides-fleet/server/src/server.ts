import express from "express";
import cors from "cors";
import "dotenv/config";

import { vehiclesRouter } from "./routes/vehicles";
import { customersRouter } from "./routes/customers";
import { rentalsRouter } from "./routes/rentals";
import { publicRouter } from "./routes/public";
import { startReturnReminders } from "./jobs/return-reminders";

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/public", publicRouter);
app.use("/api/vehicles", vehiclesRouter);
app.use("/api/customers", customersRouter);
app.use("/api/rentals", rentalsRouter);

app.listen(PORT, () => {
  console.log(`repRides-fleet server listening on http://localhost:${PORT}`);
  startReturnReminders();
});
