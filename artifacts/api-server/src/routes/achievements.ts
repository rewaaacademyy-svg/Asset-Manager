import { Router, type IRouter } from "express";
import { db, achievementsTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import {
  CreateAchievementBody,
  UpdateAchievementBody,
  UpdateAchievementParams,
  DeleteAchievementParams,
  ListAchievementsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/achievements", requireAuth, async (req, res): Promise<void> => {
  const query = ListAchievementsQueryParams.safeParse(req.query);
  const studentId = query.success ? query.data.studentId : undefined;

  let rows = await db
    .select()
    .from(achievementsTable)
    .orderBy(desc(achievementsTable.createdAt));

  if (studentId) {
    rows = rows.filter((r) => r.studentId === studentId);
  }

  const users = await db.select().from(usersTable);

  const result = rows.map((r) => {
    const student = users.find((u) => u.id === r.studentId);
    const teacher = r.teacherId ? users.find((u) => u.id === r.teacherId) : null;
    return {
      ...r,
      studentName: student?.name ?? null,
      teacherName: teacher?.name ?? null,
    };
  });

  res.json(result);
});

router.post("/achievements", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateAchievementBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [achievement] = await db.insert(achievementsTable).values(parsed.data).returning();

  const users = await db.select().from(usersTable);
  const student = users.find((u) => u.id === achievement.studentId);
  const teacher = achievement.teacherId ? users.find((u) => u.id === achievement.teacherId) : null;

  res.status(201).json({
    ...achievement,
    studentName: student?.name ?? null,
    teacherName: teacher?.name ?? null,
  });
});

router.patch("/achievements/:id", requireAuth, async (req, res): Promise<void> => {
  const params = UpdateAchievementParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const parsed = UpdateAchievementBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [achievement] = await db
    .update(achievementsTable)
    .set(parsed.data)
    .where(eq(achievementsTable.id, params.data.id))
    .returning();

  if (!achievement) {
    res.status(404).json({ error: "الإنجاز غير موجود" });
    return;
  }

  const users = await db.select().from(usersTable);
  const student = users.find((u) => u.id === achievement.studentId);
  const teacher = achievement.teacherId ? users.find((u) => u.id === achievement.teacherId) : null;

  res.json({
    ...achievement,
    studentName: student?.name ?? null,
    teacherName: teacher?.name ?? null,
  });
});

router.delete("/achievements/:id", requireAuth, async (req, res): Promise<void> => {
  const params = DeleteAchievementParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }
  await db.delete(achievementsTable).where(eq(achievementsTable.id, params.data.id));
  res.json({ success: true });
});

export default router;
