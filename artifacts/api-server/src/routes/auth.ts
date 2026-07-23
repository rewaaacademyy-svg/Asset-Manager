import { Router, type IRouter, type Request, type Response } from "express";
import { db, usersTable } from "@workspace/db";
import { eq, or } from "drizzle-orm";
import { createSession, deleteSession, requireAuth, getCurrentUser } from "../middlewares/auth";
import { LoginBody } from "@workspace/api-zod";

const router: IRouter = Router();

function checkPassword(input: string, stored: string): boolean {
  return input === stored;
}

router.post("/auth/login", async (req: Request, res: Response): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { identifier, password } = parsed.data;

  const [user] = await db
    .select()
    .from(usersTable)
    .where(or(eq(usersTable.email, identifier), eq(usersTable.phone, identifier)));

  if (!user || !checkPassword(password, user.passwordHash)) {
    res.status(401).json({ error: "بيانات الدخول غير صحيحة" });
    return;
  }

  // createSession is now async — persists to DB
  const token = await createSession(user.id);

  res.cookie("rewaa_session", token, {
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    sameSite: "lax",
  });

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      age: user.age,
      createdAt: user.createdAt,
    },
    role: user.role,
    token,
  });
});

router.post("/auth/logout", async (req: Request, res: Response): Promise<void> => {
  const token = req.cookies?.["rewaa_session"] || req.headers.authorization?.replace("Bearer ", "");
  if (token) await deleteSession(token as string);
  res.clearCookie("rewaa_session");
  res.json({ success: true });
});

router.get("/auth/me", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const user = getCurrentUser(req)!;
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    age: user.age,
    createdAt: user.createdAt,
  });
});

export default router;
