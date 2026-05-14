import { sqliteTable, text, integer, real, primaryKey } from "drizzle-orm/sqlite-core";
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

export const request_attachments = sqliteTable("request_attachments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  request_id: text("request_id").notNull().references(() => requests.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  name: text("name").notNull(),
  mime_type: text("mime_type"),
  size: integer("size"),
  kind: text("kind", { enum: ["image", "file"] }).notNull().default("file"),
  position: real("position").notNull().default(0),
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
  value: real("value"),
  created_at: text("created_at").notNull().default(sql`(datetime('now'))`),
  updated_at: text("updated_at").notNull().default(sql`(datetime('now'))`),
});

export const request_stages = sqliteTable("request_stages", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  request_id: text("request_id").notNull().references(() => requests.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  amount: real("amount").notNull(),
  position: real("position").notNull().default(0),
  is_extra: integer("is_extra", { mode: "boolean" }).notNull().default(false),
  status: text("status", { enum: ["pending", "paid", "cancelled"] }).notNull().default("pending"),
  paid_at: text("paid_at"),
  paid_method: text("paid_method", { enum: ["mp", "manual"] }),
  mp_payment_id: text("mp_payment_id"),
  work_status: text("work_status", { enum: ["not_started", "in_progress", "done"] }).notNull().default("not_started"),
  started_at: text("started_at"),
  due_date: text("due_date"),
  finished_at: text("finished_at"),
  created_at: text("created_at").notNull().default(sql`(datetime('now'))`),
  updated_at: text("updated_at").notNull().default(sql`(datetime('now'))`),
});

export const user_preferences = sqliteTable("user_preferences", {
  user_id: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  key: text("key").notNull(),
  value: text("value").notNull(),
  updated_at: text("updated_at").notNull().default(sql`(datetime('now'))`),
}, (t) => ({
  pk: primaryKey({ columns: [t.user_id, t.key] }),
}));

export const notifications = sqliteTable("notifications", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  user_id: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  request_id: text("request_id").notNull().references(() => requests.id, { onDelete: "cascade" }),
  read: integer("read", { mode: "boolean" }).notNull().default(false),
  created_at: text("created_at").notNull().default(sql`(datetime('now'))`),
});

// ——— Projects ———

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  long_description: text("long_description"),
  category: text("category", {
    enum: ["web", "mobile", "desktop", "full_system", "other"],
  }).notNull().default("web"),
  status: text("status", {
    enum: ["development", "production", "archived"],
  }).notNull().default("production"),
  image: text("image"),
  link: text("link"),
  github: text("github"),
  tags: text("tags").notNull().default("[]"),
  tech_stack: text("tech_stack").notNull().default("[]"),
  features_web: text("features_web").notNull().default("[]"),
  features_desktop: text("features_desktop").notNull().default("[]"),
  requirements: text("requirements"),
  featured: integer("featured", { mode: "boolean" }).notNull().default(false),
  sort_order: integer("sort_order").notNull().default(0),
  created_at: text("created_at").notNull().default(sql`(datetime('now'))`),
  updated_at: text("updated_at").notNull().default(sql`(datetime('now'))`),
});

// ——— TypeScript types ———

export type User = typeof user.$inferSelect;
export type Request = typeof requests.$inferSelect & { user?: User | null; profiles?: User | null };
export type RequestComment = typeof request_comments.$inferSelect & { user?: User | null; profiles?: User | null };
export type RequestAttachment = typeof request_attachments.$inferSelect;
export type RequestTask = typeof request_tasks.$inferSelect;
export type RequestStage = typeof request_stages.$inferSelect;
export type Notification = typeof notifications.$inferSelect;

export type RequestType = "feature" | "bug_fix" | "integration" | "maintenance" | "redesign" | "full_system" | "other";
export type RequestStatus = "submitted" | "reviewing" | "quoted" | "approved" | "rejected" | "in_progress" | "delivered" | "cancelled";
export type RequestTaskStatus = "todo" | "in_progress" | "done";

export type Project = typeof projects.$inferSelect;
export type ProjectCategory = "web" | "mobile" | "desktop" | "full_system" | "other";
export type ProjectStatus = "development" | "production" | "archived";
