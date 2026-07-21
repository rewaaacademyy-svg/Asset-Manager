import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const classesTable = pgTable("classes", {
  id: serial("id").primaryKey(),
  dayOfWeek: text("day_of_week").notNull(),
  time: text("time").notNull(),
  studentId: integer("student_id").notNull(),
  teacherId: integer("teacher_id").notNull(),
  isOnline: boolean("is_online").notNull().default(false),
  meetingLink: text("meeting_link"),
  status: text("status", { enum: ["scheduled", "completed", "cancelled"] }).notNull().default("scheduled"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertClassSchema = createInsertSchema(classesTable).omit({ id: true, createdAt: true });
export type InsertClass = z.infer<typeof insertClassSchema>;
export type Class = typeof classesTable.$inferSelect;
