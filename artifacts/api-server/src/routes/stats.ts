import { Router, type IRouter } from "express";
import { db, usersTable, classesTable, achievementsTable, attendanceTable } from "@workspace/db";
import { eq, count, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { GetStudentParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/stats/dashboard", requireAuth, async (req, res): Promise<void> => {
  const [{ value: totalStudents }] = await db
    .select({ value: count() })
    .from(usersTable)
    .where(eq(usersTable.role, "student"));

  const [{ value: totalTeachers }] = await db
    .select({ value: count() })
    .from(usersTable)
    .where(eq(usersTable.role, "teacher"));

  const [{ value: totalClasses }] = await db.select({ value: count() }).from(classesTable);
  const [{ value: totalAchievements }] = await db.select({ value: count() }).from(achievementsTable);

  // Simple day-of-week based counts
  const now = new Date();
  const dayNames = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
  const todayArabic = dayNames[now.getDay()];

  const allClasses = await db.select().from(classesTable);
  const classesToday = allClasses.filter((c) => c.dayOfWeek === todayArabic && c.status === "scheduled").length;

  // This week = next 7 days
  const classesThisWeek = allClasses.filter((c) => c.status === "scheduled").length;

  // Achievements by grade
  const allAchievements = await db
    .select()
    .from(achievementsTable)
    .orderBy(desc(achievementsTable.createdAt));

  const gradeMap: Record<string, number> = {};
  for (const a of allAchievements) {
    gradeMap[a.grade] = (gradeMap[a.grade] || 0) + 1;
  }
  const achievementsByGrade = Object.entries(gradeMap).map(([grade, cnt]) => ({ grade, count: cnt }));

  const users = await db.select().from(usersTable);
  const recentAchievements = allAchievements.slice(0, 5).map((a) => {
    const student = users.find((u) => u.id === a.studentId);
    const teacher = a.teacherId ? users.find((u) => u.id === a.teacherId) : null;
    return { ...a, studentName: student?.name ?? null, teacherName: teacher?.name ?? null };
  });

  res.json({
    totalStudents: Number(totalStudents),
    totalTeachers: Number(totalTeachers),
    totalClasses: Number(totalClasses),
    totalAchievements: Number(totalAchievements),
    classesToday,
    classesThisWeek,
    achievementsByGrade,
    recentAchievements,
  });
});

router.get("/stats/student/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetStudentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const studentId = params.data.id;

  const achievements = await db
    .select()
    .from(achievementsTable)
    .where(eq(achievementsTable.studentId, studentId))
    .orderBy(desc(achievementsTable.createdAt));

  const classes = await db
    .select()
    .from(classesTable)
    .where(eq(classesTable.studentId, studentId));

  const attendanceRecords = await db
    .select()
    .from(attendanceTable)
    .where(eq(attendanceTable.studentId, studentId));

  const attended = attendanceRecords.filter((a) => a.present).length;
  const total = attendanceRecords.length;
  const completionRate = total > 0 ? Math.round((attended / total) * 100) : 0;

  const users = await db.select().from(usersTable);

  const enrichedAchievements = achievements.map((a) => {
    const student = users.find((u) => u.id === a.studentId);
    const teacher = a.teacherId ? users.find((u) => u.id === a.teacherId) : null;
    return { ...a, studentName: student?.name ?? null, teacherName: teacher?.name ?? null };
  });

  const enrichedClasses = classes.map((c) => {
    const student = users.find((u) => u.id === c.studentId);
    const teacher = users.find((u) => u.id === c.teacherId);
    return { ...c, studentName: student?.name ?? null, teacherName: teacher?.name ?? null };
  });

  const upcomingClasses = enrichedClasses.filter((c) => c.status === "scheduled");

  res.json({
    studentId,
    totalAchievements: achievements.length,
    totalClasses: classes.length,
    attendedClasses: attended,
    completionRate,
    lastAchievement: enrichedAchievements[0] ?? null,
    upcomingClasses: upcomingClasses.slice(0, 3),
  });
});

export default router;
