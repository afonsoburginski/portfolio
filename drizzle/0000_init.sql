-- Better Auth tables
CREATE TABLE IF NOT EXISTS "user" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "emailVerified" INTEGER NOT NULL DEFAULT 0,
  "image" TEXT,
  "createdAt" INTEGER NOT NULL DEFAULT (unixepoch()),
  "updatedAt" INTEGER NOT NULL DEFAULT (unixepoch()),
  "isAdmin" INTEGER NOT NULL DEFAULT 0,
  "company" TEXT
);

CREATE TABLE IF NOT EXISTS "session" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "expiresAt" INTEGER NOT NULL,
  "token" TEXT NOT NULL UNIQUE,
  "createdAt" INTEGER NOT NULL DEFAULT (unixepoch()),
  "updatedAt" INTEGER NOT NULL DEFAULT (unixepoch()),
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "account" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "accountId" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "accessToken" TEXT,
  "refreshToken" TEXT,
  "idToken" TEXT,
  "accessTokenExpiresAt" INTEGER,
  "refreshTokenExpiresAt" INTEGER,
  "scope" TEXT,
  "password" TEXT,
  "createdAt" INTEGER NOT NULL DEFAULT (unixepoch()),
  "updatedAt" INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS "verification" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "identifier" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "expiresAt" INTEGER NOT NULL,
  "createdAt" INTEGER DEFAULT (unixepoch()),
  "updatedAt" INTEGER DEFAULT (unixepoch())
);

-- App tables
CREATE TABLE IF NOT EXISTS "requests" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "type" TEXT NOT NULL DEFAULT 'feature',
  "priority" INTEGER NOT NULL DEFAULT 2,
  "status" TEXT NOT NULL DEFAULT 'submitted',
  "budget" TEXT,
  "payment_deadline" TEXT,
  "delivery_deadline" TEXT,
  "admin_notes" TEXT,
  "client_notes" TEXT,
  "quoted_at" TEXT,
  "approved_at" TEXT,
  "delivered_at" TEXT,
  "image_url" TEXT,
  "mp_payment_id" TEXT,
  "paid_at" TEXT,
  "paid_manually" INTEGER NOT NULL DEFAULT 0,
  "created_at" TEXT NOT NULL DEFAULT (datetime('now')),
  "updated_at" TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS "request_comments" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "request_id" TEXT NOT NULL REFERENCES "requests"("id") ON DELETE CASCADE,
  "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "is_admin" INTEGER NOT NULL DEFAULT 0,
  "content" TEXT NOT NULL,
  "created_at" TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS "request_tasks" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "request_id" TEXT NOT NULL REFERENCES "requests"("id") ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  "position" REAL NOT NULL DEFAULT 0,
  "due_date" TEXT,
  "status" TEXT NOT NULL DEFAULT 'todo',
  "type" TEXT NOT NULL DEFAULT 'feature',
  "priority" INTEGER NOT NULL DEFAULT 2,
  "value" REAL,
  "created_at" TEXT NOT NULL DEFAULT (datetime('now')),
  "updated_at" TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS "request_stages" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "request_id" TEXT NOT NULL REFERENCES "requests"("id") ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  "amount" REAL NOT NULL,
  "position" REAL NOT NULL DEFAULT 0,
  "is_extra" INTEGER NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "paid_at" TEXT,
  "paid_method" TEXT,
  "mp_payment_id" TEXT,
  "work_status" TEXT NOT NULL DEFAULT 'not_started',
  "started_at" TEXT,
  "due_date" TEXT,
  "finished_at" TEXT,
  "created_at" TEXT NOT NULL DEFAULT (datetime('now')),
  "updated_at" TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS "user_preferences" (
  "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "key" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY ("user_id", "key")
);

CREATE TABLE IF NOT EXISTS "notifications" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "request_id" TEXT NOT NULL REFERENCES "requests"("id") ON DELETE CASCADE,
  "read" INTEGER NOT NULL DEFAULT 0,
  "created_at" TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS "projects" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "long_description" TEXT,
  "category" TEXT NOT NULL DEFAULT 'web',
  "status" TEXT NOT NULL DEFAULT 'production',
  "image" TEXT,
  "link" TEXT,
  "github" TEXT,
  "tags" TEXT NOT NULL DEFAULT '[]',
  "tech_stack" TEXT NOT NULL DEFAULT '[]',
  "features_web" TEXT NOT NULL DEFAULT '[]',
  "features_desktop" TEXT NOT NULL DEFAULT '[]',
  "requirements" TEXT,
  "featured" INTEGER NOT NULL DEFAULT 0,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TEXT NOT NULL DEFAULT (datetime('now')),
  "updated_at" TEXT NOT NULL DEFAULT (datetime('now'))
);
