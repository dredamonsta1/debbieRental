import type { Request, Response, NextFunction } from "express";

const validTokens = new Set<string>();

export function issueOwnerToken(token: string) {
  validTokens.add(token);
}

export function revokeOwnerToken(token: string) {
  validTokens.delete(token);
}

export function isValidOwnerToken(token: string | undefined): token is string {
  if (!token) return false;
  return validTokens.has(token);
}

export function requireOwner(req: Request, res: Response, next: NextFunction) {
  const token = req.header("X-Owner-Token") ?? undefined;
  if (!isValidOwnerToken(token)) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}
