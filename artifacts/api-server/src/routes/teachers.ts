import { Router, type IRouter } from "express";
import { db, usersTable, teachersTable, studentsTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import {
  CreateTeacherBody,
  UpdateTeacherBody,
  GetTeacherParams,
  UpdateTeacherParams,
  DeleteTeacherParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function getTeacherWithCount(userId: number) {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user || user.role !== "teacher") return null;

  const [extra] = await db.select().from(teachersTable).where(eq(teachersTable.userId, userId));

  const [{ value: studentCount }] = await db
    .select({ value: count() })
    .from(studentsTable)
    .where(eq(studentsTable.teacherId, userId));

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: "teacher" as const,
    specialization: extra?.specialization ?? null,
    studentCount: Number(studentCount),
    createdAt: user.createdAt,
  };
}

router.get("/teachers", requireAuth, async (req, res): Promise<void> => {
  const users = await db.select().from(usersTable).where(eq(usersTable.role, "teacher"));
  const extras = await db.select().from(teachersTable);
  const studentCounts = await db
    .select({ teacherId: studentsTable.teacherId, cnt: count() })
    .from(studentsTable)
    .groupBy(studentsTable.teacherId);

  const result = users.map((u) => {
    const extra = extras.find((e) => e.userId === u.id);
    const sc = studentCounts.find((s) => s.teacherId === u.id);
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: "teacher" as const,
      specialization: extra?.specialization ?? null,
      studentCount: Number(sc?.cnt ?? 0),
      createdAt: u.createdAt,
    };
  });

  res.json(result);
});

router.post("/teachers", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateTeacherBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name, email, phone, password, specialization } = parsed.data;

  const [user] = await db
    .insert(usersTable)
    .values({ name, email: email ?? null, phone: phone ?? null, passwordHash: password, role: "teacher" })
    .returning();

  await db.insert(teachersTable).values({ userId: user.id, specialization: specialization ?? null });

  const result = await getTeacherWithCount(user.id);
  res.status(201).json(result);
});

router.get("/teachers/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetTeacherParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const teacher = await getTeacherWithCount(params.data.id);
  if (!teacher) {
    res.status(404).json({ error: "المعلم غير موجود" });
    return;
  }
  res.json(teacher);
});

router.patch("/teachers/:id", requireAuth, async (req, res): Promise<void> => {
  const params = UpdateTeacherParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const parsed = UpdateTeacherBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name, email, phone, specialization } = parsed.data;

  const updateData: Record<string, any> = {};
  if (name !== undefined) updateData.name = name;
  if (email !== undefined) updateData.email = email;
  if (phone !== undefined) updateData.phone = phone;

  if (Object.keys(updateData).length > 0) {
    await db.update(usersTable).set(updateData).where(eq(usersTable.id, params.data.id));
  }

  if (specialization !== undefined) {
    await db.update(teachersTable).set({ specialization }).where(eq(teachersTable.userId, params.data.id));
  }

  const teacher = await getTeacherWithCount(params.data.id);
  if (!teacher) {
    res.status(404).json({ error: "المعلم غير موجود" });
    return;
  }
  res.json(teacher);
});

router.delete("/teachers/:id", requireAuth, async (req, res): Promise<void> => {
  const params = DeleteTeacherParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }
  await db.delete(teachersTable).where(eq(teachersTable.userId, params.data.id));
  await db.delete(usersTable).where(eq(usersTable.id, params.data.id));
  res.json({ success: true });
});

export default router;
