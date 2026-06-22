import { pgTable, text, integer, doublePrecision, boolean, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// App date columns are stored as ISO-8601 strings (the app writes them via
// `new Date().toISOString()` and reads them with `new Date(str)`), so they stay
// `text` in Postgres. This default reproduces that exact ISO format for rows
// that rely on the column default instead of an explicit value.
const nowIso = () =>
  sql`(to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'))`;

// ——— Better Auth managed tables (camelCase as required by Better Auth adapter) ———
// These use real `timestamp`/`boolean` columns because the Better Auth pg adapter
// expects Date/boolean semantics.

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  isAdmin: boolean("isAdmin").notNull().default(false),
  company: text("company"),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

// ——— App tables — snake_case TS properties for backward compat ———

export const requests = pgTable("requests", {
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
  paid_manually: boolean("paid_manually").notNull().default(false),
  share_token: text("share_token").unique(),
  discount_amount: doublePrecision("discount_amount").notNull().default(0),
  discount_reason: text("discount_reason"),
  created_at: text("created_at").notNull().default(nowIso()),
  updated_at: text("updated_at").notNull().default(nowIso()),
});

export const request_comments = pgTable("request_comments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  request_id: text("request_id").notNull().references(() => requests.id, { onDelete: "cascade" }),
  user_id: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  is_admin: boolean("is_admin").notNull().default(false),
  content: text("content").notNull(),
  created_at: text("created_at").notNull().default(nowIso()),
});

export const request_attachments = pgTable("request_attachments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  request_id: text("request_id").notNull().references(() => requests.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  name: text("name").notNull(),
  mime_type: text("mime_type"),
  size: integer("size"),
  kind: text("kind", { enum: ["image", "file"] }).notNull().default("file"),
  category: text("category"), // null | "contract" — distingue anexos especiais (contratos gerados por IA, etc.)
  position: doublePrecision("position").notNull().default(0),
  created_at: text("created_at").notNull().default(nowIso()),
});

export const request_tasks = pgTable("request_tasks", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  request_id: text("request_id").notNull().references(() => requests.id, { onDelete: "cascade" }),
  // Amarração etapa ↔ parcela: cada etapa (task) pertence a uma parcela (stage) de pagamento.
  // onDelete set null para a etapa sobreviver se a parcela for removida.
  stage_id: text("stage_id").references((): import("drizzle-orm/pg-core").AnyPgColumn => request_stages.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  position: doublePrecision("position").notNull().default(0),
  due_date: text("due_date"),
  status: text("status", { enum: ["todo", "in_progress", "done"] }).notNull().default("todo"),
  type: text("type", {
    enum: ["feature", "bug_fix", "integration", "maintenance", "redesign", "full_system", "other"],
  }).notNull().default("feature"),
  priority: integer("priority").notNull().default(2),
  value: doublePrecision("value"),
  created_at: text("created_at").notNull().default(nowIso()),
  updated_at: text("updated_at").notNull().default(nowIso()),
});

export const request_stages = pgTable("request_stages", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  request_id: text("request_id").notNull().references(() => requests.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  amount: doublePrecision("amount").notNull(),
  position: doublePrecision("position").notNull().default(0),
  is_extra: boolean("is_extra").notNull().default(false),
  status: text("status", { enum: ["pending", "paid", "cancelled"] }).notNull().default("pending"),
  paid_at: text("paid_at"),
  paid_method: text("paid_method", { enum: ["mp", "manual"] }),
  mp_payment_id: text("mp_payment_id"),
  work_status: text("work_status", { enum: ["not_started", "in_progress", "done"] }).notNull().default("not_started"),
  started_at: text("started_at"),
  due_date: text("due_date"),
  finished_at: text("finished_at"),
  created_at: text("created_at").notNull().default(nowIso()),
  updated_at: text("updated_at").notNull().default(nowIso()),
});

export const user_preferences = pgTable("user_preferences", {
  user_id: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  key: text("key").notNull(),
  value: text("value").notNull(),
  updated_at: text("updated_at").notNull().default(nowIso()),
}, (t) => ({
  pk: primaryKey({ columns: [t.user_id, t.key] }),
}));

export const notifications = pgTable("notifications", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  user_id: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  request_id: text("request_id").notNull().references(() => requests.id, { onDelete: "cascade" }),
  read: boolean("read").notNull().default(false),
  created_at: text("created_at").notNull().default(nowIso()),
});

// ——— Projects ———

export const projects = pgTable("projects", {
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
  featured: boolean("featured").notNull().default(false),
  sort_order: integer("sort_order").notNull().default(0),
  // Case‑study fields (added 0007). Free‑text strings + JSON‑encoded arrays.
  subtitle: text("subtitle"),
  role: text("role"),
  timeline: text("timeline"),
  stack: text("stack"),
  live_url: text("live_url"),
  github_url: text("github_url"),
  story: text("story"),
  image2: text("image2"),
  revenue_note: text("revenue_note"),
  extra_images: text("extra_images").notNull().default("[]"),
  objectives: text("objectives").notNull().default("[]"),
  highlights: text("highlights").notNull().default("[]"),
  outcomes: text("outcomes").notNull().default("[]"),
  challenges: text("challenges").notNull().default("[]"),
  sections: text("sections").notNull().default("[]"),
  created_at: text("created_at").notNull().default(nowIso()),
  updated_at: text("updated_at").notNull().default(nowIso()),
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
