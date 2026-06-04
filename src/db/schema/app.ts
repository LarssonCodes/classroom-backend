import {integer, pgTable, timestamp, varchar} from "drizzle-orm/pg-core";
import {relations} from "drizzle-orm";

const timestamps = {
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().$onUpdate(()=>new Date()).notNull(),
}

export const department = pgTable('department',{
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    code:varchar('code',{length: 50}).notNull().unique(),
    name:varchar('name',{length: 50}).notNull(),
    description:varchar('description',{length: 200}),
    ...timestamps
});

export const subjects = pgTable('subjects',{
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    departmentId:integer('department_id').notNull().references(()=> department.id, { onDelete: 'restrict'}),
    code:varchar('code',{length: 50}).notNull().unique(),
    name:varchar('name',{length: 50}).notNull(),
    description:varchar('description',{length: 200}),
    ...timestamps
});

export const departmentsRelations = relations(department, ({ many }) => ({
    subjects: many(subjects),
}));

export const subjectsRelations = relations(subjects, ({ one, many }) => ({
    department: one(department, {
        fields: [subjects.departmentId],
        references: [department.id],
    }),
}));

export type Department = typeof department.$inferSelect;
export type NewDepartments = typeof department.$inferInsert;

export type Subject = typeof subjects.$inferSelect;
export type NewSubject = typeof subjects.$inferInsert;