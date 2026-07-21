import { Router, type IRouter } from "express";
import { db, usersTable, studentsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import {
  CreateStudentBody,
  UpdateStudentBody,
  GetStudentParams,
  UpdateStudentParams,
  DeleteStudentParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function getStudentWithTeacher(userId: number) {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user || user.role !== "student") return null;

  const [extra] = await db.select().from(studentsTable).where(eq(studentsTable.userId, userId));

  let teacherName: string | null = null;
  if (extra?.teacherId) {
    const [teacher] = await db.select().from(usersTable).where(eq(usersTable.id, extra.teacherId));
    teacherName = teacher?.name ?? null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    age: user.age,
    role: "student" as const,
    level: extra?.level ?? null,
    teacherId: extra?.teacherId ?? null,
    teacherName,
    createdAt: user.createdAt,
  };
}

router.get("/students", requireAuth, async (req, res): Promise<void> => {
  const users = await db.select().from(usersTable).where(eq(usersTable.role, "student"));
  const extras = await db.select().from(studentsTable);
  const teachers = await db.select().from(usersTable).where(eq(usersTable.role, "teacher"));

  const result = users.map((u) => {
    const extra = extras.find((e) => e.userId === u.id);
    const teacher = teachers.find((t) => t.id === extra?.teacherId);
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      age: u.age,
      role: "student" as const,
      level: extra?.level ?? null,
      teacherId: extra?.teacherId ?? null,
      teacherName: teacher?.name ?? null,
      createdAt: u.createdAt,
    };
  });

  res.json(result);
});

router.post("/students", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateStudentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name, email, phone, password, age, level, teacherId } = parsed.data;

  const [user] = await db
    .insert(usersTable)
    .values({ name, email: email ?? null, phone: phone ?? null, passwordHash: password, role: "student", age: age ?? null })
    .returning();

  await db.insert(studentsTable).values({ userId: user.id, level: level ?? null, teacherId: teacherId ?? null });

  const result = await getStudentWithTeacher(user.id);
  res.status(201).json(result);
});

router.get("/students/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetStudentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const student = await getStudentWithTeacher(params.data.id);
  if (!student) {
    res.status(404).json({ error: "الطالب غير موجود" });
    return;
  }
  res.json(student);
});

router.patch("/students/:id", requireAuth, async (req, res): Promise<void> => {
  const params = UpdateStudentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const parsed = UpdateStudentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name, email, phone, age, level, teacherId } = parsed.data;

  const updateData: Record<string, any> = {};
  if (name !== undefined) updateData.name = name;
  if (email !== undefined) updateData.email = email;
  if (phone !== undefined) updateData.phone = phone;
  if (age !== undefined) updateData.age = age;

  if (Object.keys(updateData).length > 0) {
    await db.update(usersTable).set(updateData).where(eq(usersTable.id, params.data.id));
  }

  const extraUpdate: Record<string, any> = {};
  if (level !== undefined) extraUpdate.level = level;
  if (teacherId !== undefined) extraUpdate.teacherId = teacherId;

  if (Object.keys(extraUpdate).length > 0) {
    await db.update(studentsTable).set(extraUpdate).where(eq(studentsTable.userId, params.data.id));
  }

  const student = await getStudentWithTeacher(params.data.id);
  if (!student) {
    res.status(404).json({ error: "الطالب غير موجود" });
    return;
  }
  res.json(student);
});

router.delete("/students/:id", requireAuth, async (req, res): Promise<void> => {
  const params = DeleteStudentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }
  await db.delete(studentsTable).where(eq(studentsTable.userId, params.data.id));
  await db.delete(usersTable).where(eq(usersTable.id, params.data.id));
  res.json({ success: true });
});

export default router;
