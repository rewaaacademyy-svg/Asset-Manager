import { pgTable, text, integer } from "drizzle-orm/pg-core";

// Teachers are users with role='teacher', extended with teacher-specific fields
export const teachersTable = pgTable("teachers", {
  userId: integer("user_id").primaryKey(),
  specialization: text("specialization"),
});

export type TeacherExtra = typeof teachersTable.$inferSelect;
