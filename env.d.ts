declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_APP_URL?: string;
    BETTER_AUTH_URL?: string;

    BETTER_AUTH_SECRET: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;

    // Postgres
    DATABASE_URL: string;
    PORTFOLIO_MCP_TOKEN?: string;

    // Cloudflare R2 (S3-compatible API)
    R2_ACCOUNT_ID: string;
    R2_ACCESS_KEY_ID: string;
    R2_SECRET_ACCESS_KEY: string;
    R2_BUCKET?: string;
    R2_PUBLIC_URL?: string;

    NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY?: string;
    MERCADOPAGO_ACCESS_TOKEN?: string;
    MERCADOPAGO_CLIENT_ID?: string;
    MERCADOPAGO_CLIENT_SECRET?: string;
    MERCADOPAGO_WEBHOOK_SECRET?: string;
  }
}
