import { Router, type IRouter, type Request, type Response } from "express";
import { db, attendanceTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { CreateAttendanceBody, ListAttendanceQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/attendance", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const query = ListAttendanceQueryParams.safeParse(req.query);
  const { studentId, classId } = query.success ? query.data : {};

  let rows = await db.select().from(attendanceTable).orderBy(desc(attendanceTable.date));

  if (studentId) rows = rows.filter((r) => r.studentId === studentId);
  if (classId) rows = rows.filter((r) => r.classId === classId);

  const users = await db.select().from(usersTable);

  const result = rows.map((r) => {
    const student = users.find((u) => u.id === r.studentId);
    return { ...r, studentName: student?.name ?? null };
  });

  res.json(result);
});

router.post("/attendance", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const parsed = CreateAttendanceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [record] = await db.insert(attendanceTable).values(parsed.data).returning();
  const [student] = await db.select().from(usersTable).where(eq(usersTable.id, record.studentId));

  res.status(201).json({ ...record, studentName: student?.name ?? null });
});

export default router;
