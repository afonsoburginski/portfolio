import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@afonsodev.com";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://afonsodev.com";

const TYPE_LABELS: Record<string, string> = {
  feature:     "Nova funcionalidade",
  bug_fix:     "Correção de bug",
  integration: "Integração",
  maintenance: "Manutenção",
  redesign:    "Redesign / UI",
  full_system: "Sistema completo / SaaS",
  other:       "Outro",
};

const PRIORITY_LABELS: Record<number, string> = {
  1: "Baixa",
  2: "Média",
  3: "Alta",
};

export async function sendNewRequestNotification(params: {
  requestId: string;
  title: string;
  description: string;
  type: string;
  priority: number;
  clientName: string;
  clientEmail: string;
}) {
  const { requestId, title, description, type, priority, clientName, clientEmail } = params;
  const adminUrl = `${APP_URL}/dashboard/admin/requests/${requestId}`;

  await resend.emails.send({
    from: "Afonsodev <noreply@afonsodev.com>",
    to: ADMIN_EMAIL,
    subject: `📥 Novo pedido: ${title}`,
    html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#18181b;border-radius:12px;overflow:hidden;border:1px solid #27272a;">

          <tr>
            <td style="padding:24px 32px;border-bottom:1px solid #27272a;">
              <span style="font-size:13px;font-weight:600;color:#a1a1aa;letter-spacing:0.08em;text-transform:uppercase;">Afonsodev · Dashboard</span>
            </td>
          </tr>

          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:0.06em;">Novo pedido recebido</p>
              <h1 style="margin:0 0 24px;font-size:22px;font-weight:700;color:#fafafa;line-height:1.3;">${title}</h1>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="padding:0 12px 0 0;width:50%;">
                    <div style="background:#27272a;border-radius:8px;padding:14px 16px;">
                      <p style="margin:0 0 4px;font-size:11px;color:#71717a;text-transform:uppercase;letter-spacing:0.06em;">Tipo</p>
                      <p style="margin:0;font-size:14px;font-weight:600;color:#e4e4e7;">${TYPE_LABELS[type] ?? type}</p>
                    </div>
                  </td>
                  <td style="padding:0 0 0 12px;width:50%;">
                    <div style="background:#27272a;border-radius:8px;padding:14px 16px;">
                      <p style="margin:0 0 4px;font-size:11px;color:#71717a;text-transform:uppercase;letter-spacing:0.06em;">Prioridade</p>
                      <p style="margin:0;font-size:14px;font-weight:600;color:#e4e4e7;">${PRIORITY_LABELS[priority] ?? "Média"}</p>
                    </div>
                  </td>
                </tr>
              </table>

              <div style="background:#27272a;border-radius:8px;padding:14px 16px;margin-bottom:20px;">
                <p style="margin:0 0 4px;font-size:11px;color:#71717a;text-transform:uppercase;letter-spacing:0.06em;">Cliente</p>
                <p style="margin:0;font-size:14px;font-weight:600;color:#e4e4e7;">${clientName}</p>
                <p style="margin:4px 0 0;font-size:12px;color:#a1a1aa;">${clientEmail}</p>
              </div>

              <div style="border-left:3px solid #3f3f46;padding:0 0 0 16px;margin-bottom:28px;">
                <p style="margin:0 0 6px;font-size:11px;color:#71717a;text-transform:uppercase;letter-spacing:0.06em;">Descrição</p>
                <p style="margin:0;font-size:14px;color:#a1a1aa;line-height:1.6;">${description.slice(0, 300)}${description.length > 300 ? "…" : ""}</p>
              </div>

              <a href="${adminUrl}"
                style="display:inline-block;background:#ffffff;color:#09090b;font-size:14px;font-weight:700;padding:12px 24px;border-radius:8px;text-decoration:none;letter-spacing:-0.01em;">
                Ver pedido no admin →
              </a>
            </td>
          </tr>

          <tr>
            <td style="padding:16px 32px;border-top:1px solid #27272a;">
              <p style="margin:0;font-size:12px;color:#52525b;">Este email foi enviado automaticamente pelo dashboard de Afonsodev.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  });
}
