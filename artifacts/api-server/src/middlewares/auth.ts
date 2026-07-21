import { type Request, type Response, type NextFunction } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

// Simple session-based auth using a session store in memory
// In production, use a proper session store
const sessions = new Map<string, { userId: number; expiresAt: Date }>();

export function createSession(userId: number): string {
  const token = Math.random().toString(36).slice(2) + Date.now().toString(36);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  sessions.set(token, { userId, expiresAt });
  return token;
}

export function deleteSession(token: string): void {
  sessions.delete(token);
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token = req.cookies?.["rewaa_session"] || req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const session = sessions.get(token);
  if (!session || session.expiresAt < new Date()) {
    sessions.delete(token);
    res.status(401).json({ error: "Session expired" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, session.userId));
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  (req as any).currentUser = user;
  next();
}

export function getCurrentUser(req: Request) {
  return (req as any).currentUser as typeof usersTable.$inferSelect | undefined;
}
