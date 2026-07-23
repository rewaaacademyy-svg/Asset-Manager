import { Router, type IRouter, type Request, type Response } from "express";
import { db, classesTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import {
  CreateClassBody,
  UpdateClassBody,
  GetClassParams,
  UpdateClassParams,
  DeleteClassParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function enrichClass(cls: typeof classesTable.$inferSelect) {
  const [student] = await db.select().from(usersTable).where(eq(usersTable.id, cls.studentId));
  const [teacher] = await db.select().from(usersTable).where(eq(usersTable.id, cls.teacherId));
  return {
    ...cls,
    studentName: student?.name ?? null,
    teacherName: teacher?.name ?? null,
  };
}

router.get("/classes", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const classes = await db.select().from(classesTable).orderBy(classesTable.dayOfWeek, classesTable.time);
  const users = await db.select().from(usersTable);

  const result = classes.map((cls) => {
    const student = users.find((u) => u.id === cls.studentId);
    const teacher = users.find((u) => u.id === cls.teacherId);
    return {
      ...cls,
      studentName: student?.name ?? null,
      teacherName: teacher?.name ?? null,
    };
  });

  res.json(result);
});

router.post("/classes", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const parsed = CreateClassBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [cls] = await db.insert(classesTable).values(parsed.data).returning();
  const enriched = await enrichClass(cls);
  res.status(201).json(enriched);
});

router.get("/classes/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const params = GetClassParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const [cls] = await db.select().from(classesTable).where(eq(classesTable.id, params.data.id));
  if (!cls) {
    res.status(404).json({ error: "الحصة غير موجودة" });
    return;
  }
  const enriched = await enrichClass(cls);
  res.json(enriched);
});

router.patch("/classes/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const params = UpdateClassParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const parsed = UpdateClassBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [cls] = await db
    .update(classesTable)
    .set(parsed.data)
    .where(eq(classesTable.id, params.data.id))
    .returning();

  if (!cls) {
    res.status(404).json({ error: "الحصة غير موجودة" });
    return;
  }
  const enriched = await enrichClass(cls);
  res.json(enriched);
});

router.delete("/classes/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const params = DeleteClassParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }
  await db.delete(classesTable).where(eq(classesTable.id, params.data.id));
  res.json({ success: true });
});

export default router;
