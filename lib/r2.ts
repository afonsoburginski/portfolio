import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

// Cloudflare R2 accessed over its S3-compatible API. The bucket and the public
// CDN (cdn.afonsodev.com) stay on Cloudflare — only the write path moved from
// the Workers `env.R2` binding to the S3 SDK so it runs in a plain Node server.

const globalForR2 = globalThis as unknown as { _r2Client?: S3Client };

function client(): S3Client {
  if (globalForR2._r2Client) return globalForR2._r2Client;
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("R2 credentials missing (R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY).");
  }
  const c = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
  globalForR2._r2Client = c;
  return c;
}

function bucket(): string {
  return process.env.R2_BUCKET ?? "portfolio";
}

export function r2PublicUrl(): string {
  return process.env.R2_PUBLIC_URL ?? "https://cdn.afonsodev.com";
}

export async function putObject(
  key: string,
  body: Uint8Array | Buffer,
  contentType?: string,
  contentDisposition?: string,
): Promise<void> {
  await client().send(
    new PutObjectCommand({
      Bucket: bucket(),
      Key: key,
      Body: body,
      ContentType: contentType,
      ContentDisposition: contentDisposition,
    }),
  );
}

export async function deleteObject(key: string): Promise<void> {
  await client().send(new DeleteObjectCommand({ Bucket: bucket(), Key: key }));
}
