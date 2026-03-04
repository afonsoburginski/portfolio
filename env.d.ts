declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_APP_URL?: string;

    // Turso (SQLite)
    TURSO_DATABASE_URL: string;
    TURSO_AUTH_TOKEN?: string;

    // Better Auth
    BETTER_AUTH_SECRET: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;

    // Email
    RESEND_API_KEY: string;
    ADMIN_EMAIL?: string;

    // Storage
    BLOB_READ_WRITE_TOKEN?: string;

    // Dashboard
    DASHBOARD_ADMIN_SECRET?: string;

    // Pagamentos
    NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY?: string;
    MERCADOPAGO_ACCESS_TOKEN?: string;
    MERCADOPAGO_CLIENT_ID?: string;
    MERCADOPAGO_CLIENT_SECRET?: string;
    MERCADOPAGO_WEBHOOK_SECRET?: string;
  }
}
