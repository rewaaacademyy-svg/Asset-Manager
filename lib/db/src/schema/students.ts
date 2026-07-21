import { pgTable, text, integer } from "drizzle-orm/pg-core";

// Students are users with role='student', extended with student-specific fields
export const studentsTable = pgTable("students", {
  userId: integer("user_id").primaryKey(),
  level: text("level"),
  teacherId: integer("teacher_id"),
});

export type StudentExtra = typeof studentsTable.$inferSelect;
