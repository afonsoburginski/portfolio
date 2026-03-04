import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// ——— Better Auth managed tables (camelCase as required by Better Auth adapter) ———

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("emailVerified", { mode: "boolean" }).notNull().default(false),
  image: text("image"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  isAdmin: integer("isAdmin", { mode: "boolean" }).notNull().default(false),
  company: text("company"),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: integer("accessTokenExpiresAt", { mode: "timestamp" }),
  refreshTokenExpiresAt: integer("refreshTokenExpiresAt", { mode: "timestamp" }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).default(sql`(unixepoch())`),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

// ——— App tables — snake_case TS properties for backward compat ———

export const requests = sqliteTable("requests", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  user_id: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type", {
    enum: ["feature", "bug_fix", "integration", "maintenance", "redesign", "full_system", "other"],
  }).notNull().default("feature"),
  priority: integer("priority").notNull().default(2),
  status: text("status", {
    enum: ["submitted", "reviewing", "quoted", "approved", "rejected", "in_progress", "delivered", "cancelled"],
  }).notNull().default("submitted"),
  budget: text("budget"),
  payment_deadline: text("payment_deadline"),
  delivery_deadline: text("delivery_deadline"),
  admin_notes: text("admin_notes"),
  client_notes: text("client_notes"),
  quoted_at: text("quoted_at"),
  approved_at: text("approved_at"),
  delivered_at: text("delivered_at"),
  image_url: text("image_url"),
  mp_payment_id: text("mp_payment_id"),
  paid_at: text("paid_at"),
  paid_manually: integer("paid_manually", { mode: "boolean" }).notNull().default(false),
  created_at: text("created_at").notNull().default(sql`(datetime('now'))`),
  updated_at: text("updated_at").notNull().default(sql`(datetime('now'))`),
});

export const request_comments = sqliteTable("request_comments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  request_id: text("request_id").notNull().references(() => requests.id, { onDelete: "cascade" }),
  user_id: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  is_admin: integer("is_admin", { mode: "boolean" }).notNull().default(false),
  content: text("content").notNull(),
  created_at: text("created_at").notNull().default(sql`(datetime('now'))`),
});

export const request_tasks = sqliteTable("request_tasks", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  request_id: text("request_id").notNull().references(() => requests.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  position: real("position").notNull().default(0),
  due_date: text("due_date"),
  status: text("status", { enum: ["todo", "in_progress", "done"] }).notNull().default("todo"),
  type: text("type", {
    enum: ["feature", "bug_fix", "integration", "maintenance", "redesign", "full_system", "other"],
  }).notNull().default("feature"),
  priority: integer("priority").notNull().default(2),
  created_at: text("created_at").notNull().default(sql`(datetime('now'))`),
  updated_at: text("updated_at").notNull().default(sql`(datetime('now'))`),
});

export const notifications = sqliteTable("notifications", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  user_id: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  request_id: text("request_id").notNull().references(() => requests.id, { onDelete: "cascade" }),
  read: integer("read", { mode: "boolean" }).notNull().default(false),
  created_at: text("created_at").notNull().default(sql`(datetime('now'))`),
});

// ——— TypeScript types ———

export type User = typeof user.$inferSelect;
export type Request = typeof requests.$inferSelect & { user?: User | null; profiles?: User | null };
export type RequestComment = typeof request_comments.$inferSelect & { user?: User | null; profiles?: User | null };
export type RequestTask = typeof request_tasks.$inferSelect;
export type Notification = typeof notifications.$inferSelect;

export type RequestType = "feature" | "bug_fix" | "integration" | "maintenance" | "redesign" | "full_system" | "other";
export type RequestStatus = "submitted" | "reviewing" | "quoted" | "approved" | "rejected" | "in_progress" | "delivered" | "cancelled";
export type RequestTaskStatus = "todo" | "in_progress" | "done";
