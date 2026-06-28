import { Router } from "express";
import { randomUUID } from "node:crypto";
import { issueOwnerToken, revokeOwnerToken, requireOwner } from "../middleware/owner";

export const adminRouter = Router();

adminRouter.post("/login", async (req, res) => {
  const { password } = req.body ?? {};
  const expected = process.env.OWNER_PASSWORD;

  if (!expected) {
    return res
      .status(503)
      .json({ error: "Owner password not configured on the server" });
  }
  if (typeof password !== "string" || password !== expected) {
    return res.status(401).json({ error: "Invalid password" });
  }

  const token = randomUUID();
  issueOwnerToken(token);
  res.json({ token });
});

adminRouter.post("/logout", requireOwner, async (req, res) => {
  const token = req.header("X-Owner-Token");
  if (token) revokeOwnerToken(token);
  res.status(204).send();
});

adminRouter.get("/session", requireOwner, async (_req, res) => {
  res.json({ ok: true });
});
