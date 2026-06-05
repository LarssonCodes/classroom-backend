import { integer, pgTable, timestamp, varchar, pgEnum, text, jsonb, index, unique, check } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { user, session, account } from "./auth.js";

const timestamps = {
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().$onUpdate(() => new Date()).notNull(),
};

export type Schedule = {
    day: string;
    startTime: string;
    endTime: string;
};

export const department = pgTable('department', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    code: varchar('code', { length: 50 }).notNull().unique(),
    name: varchar('name', { length: 50 }).notNull(),
    description: varchar('description', { length: 200 }),
    ...timestamps
});

export const subjects = pgTable('subjects', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    departmentId: integer('department_id').notNull().references(() => department.id, { onDelete: 'restrict' }),
    code: varchar('code', { length: 50 }).notNull().unique(),
    name: varchar('name', { length: 50 }).notNull(),
    description: varchar('description', { length: 200 }),
    ...timestamps
});

export const classStatusEnum = pgEnum("class_status", ["active", "inactive", "archived"]);

export const classes = pgTable('classes', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    subjectId: integer('subject_id').notNull().references(() => subjects.id, { onDelete: 'cascade' }),
    teacherId: text('teacher_id').notNull().references(() => user.id, { onDelete: 'restrict' }),
    inviteCode: varchar('invite_code', { length: 20 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    bannerCldPubId: text('banner_cld_pub_id'),
    bannerUrl: text('banner_url'),
    description: text('description'),
    capacity: integer('capacity').default(50).notNull(),
    status: classStatusEnum('status').default('active').notNull(),
    schedules: jsonb('schedules').$type<Schedule[]>().default([]).notNull(),
    ...timestamps
}, (table) => [
    index("classes_subject_id_idx").on(table.subjectId),
    index("classes_teacher_id_idx").on(table.teacherId),
    check("classes_capacity_check", sql`${table.capacity} >= 1`),
]);

export const enrollments = pgTable('enrollments', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    studentId: text('student_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    classId: integer('class_id').notNull().references(() => classes.id, { onDelete: 'cascade' }),
    ...timestamps
}, (table) => [
    unique("enrollments_student_class_uniq").on(table.studentId, table.classId),
    index("enrollments_student_id_idx").on(table.studentId),
    index("enrollments_class_id_idx").on(table.classId),
]);

export const departmentsRelations = relations(department, ({ many }) => ({
    subjects: many(subjects),
}));

export const subjectsRelations = relations(subjects, ({ one, many }) => ({
    department: one(department, {
        fields: [subjects.departmentId],
        references: [department.id],
    }),
    classes: many(classes),
}));

export const classesRelations = relations(classes, ({ one, many }) => ({
    subject: one(subjects, {
        fields: [classes.subjectId],
        references: [subjects.id],
    }),
    teacher: one(user, {
        fields: [classes.teacherId],
        references: [user.id],
    }),
    enrollments: many(enrollments),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
    student: one(user, {
        fields: [enrollments.studentId],
        references: [user.id],
    }),
    class: one(classes, {
        fields: [enrollments.classId],
        references: [classes.id],
    }),
}));

export const userRelations = relations(user, ({ many }) => ({
    sessions: many(session),
    accounts: many(account),
    classes: many(classes),
    enrollments: many(enrollments),
}));

export type Department = typeof department.$inferSelect;
export type NewDepartments = typeof department.$inferInsert;

export type Subject = typeof subjects.$inferSelect;
export type NewSubject = typeof subjects.$inferInsert;

export type Class = typeof classes.$inferSelect;
export type NewClass = typeof classes.$inferInsert;

export type Enrollment = typeof enrollments.$inferSelect;
export type NewEnrollment = typeof enrollments.$inferInsert;