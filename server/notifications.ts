import 'dotenv/config';
import { Resend } from 'resend';

const NOTIFY_TO = process.env.CONTACT_NOTIFY_TO || 'geral@jrsferros.pt';
const NOTIFY_FROM = process.env.CONTACT_NOTIFY_FROM || 'JRS Ferros <geral@jrsferros.pt>';

export interface ContactRequestEmailData {
  id?: number | string;
  name: string;
  email: string;
  phone: string;
  message: string;
  source?: string;
  createdAt?: string;
}

export interface ContactNotificationResult {
  sent: boolean;
  emailId?: string;
  reason?: 'not_configured' | 'send_failed';
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatReceivedAt(value?: string) {
  const date = value ? new Date(value) : new Date();
  const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;

  return new Intl.DateTimeFormat('pt-PT', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Europe/Lisbon',
  }).format(safeDate);
}

function requestLabel(id?: number | string) {
  return id === undefined ? 'Novo pedido' : `Pedido #${id}`;
}

function sourceLabel(source?: string) {
  return source === 'website' || !source ? 'Website JRS Ferros' : source;
}

function buildHtml(data: ContactRequestEmailData) {
  const receivedAt = formatReceivedAt(data.createdAt);
  const label = requestLabel(data.id);
  const adminUrl = process.env.APP_URL
    ? `${process.env.APP_URL.replace(/\/$/, '')}/admin`
    : undefined;
  const safeName = escapeHtml(data.name);
  const safeEmail = escapeHtml(data.email);
  const safePhone = escapeHtml(data.phone);
  const safeMessage = escapeHtml(data.message).replace(/\r?\n/g, '<br />');
  const safeSource = escapeHtml(sourceLabel(data.source));

  return `<!doctype html>
<html lang="pt">
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  </head>
  <body style="margin:0;background:#f3f5f4;font-family:Arial,Helvetica,sans-serif;color:#17211b;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${label} recebido de ${safeName}.</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f5f4;padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border:1px solid #dde5df;border-radius:14px;overflow:hidden;">
            <tr>
              <td style="background:#183d2c;padding:24px 28px;color:#ffffff;">
                <div style="font-size:12px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#a9d4ba;">JRS Ferros</div>
                <div style="margin-top:8px;font-size:24px;font-weight:700;line-height:1.25;">${label} de orçamento</div>
                <div style="margin-top:7px;font-size:14px;color:#d6e8dd;">Recebido em ${escapeHtml(receivedAt)}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                <p style="margin:0 0 20px;font-size:16px;line-height:1.55;">Foi submetido um novo pedido através do site. Pode responder diretamente a este email para contactar o cliente.</p>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e3e9e5;border-radius:10px;overflow:hidden;">
                  <tr>
                    <td style="padding:16px 18px;background:#f7faf8;border-bottom:1px solid #e3e9e5;">
                      <div style="font-size:11px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:#65766c;">Cliente / Empresa</div>
                      <div style="margin-top:5px;font-size:18px;font-weight:700;color:#17211b;">${safeName}</div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:16px 18px;border-bottom:1px solid #e3e9e5;">
                      <div style="font-size:11px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:#65766c;">Contactos</div>
                      <div style="margin-top:7px;font-size:15px;line-height:1.7;">
                        <a href="mailto:${safeEmail}" style="color:#176b43;text-decoration:none;">${safeEmail}</a><br />
                        <a href="tel:${safePhone}" style="color:#176b43;text-decoration:none;">${safePhone}</a>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:16px 18px;">
                      <div style="font-size:11px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:#65766c;">Pedido</div>
                      <div style="margin-top:8px;font-size:15px;line-height:1.65;color:#27332c;">${safeMessage}</div>
                    </td>
                  </tr>
                </table>

                <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:22px;">
                  <tr>
                    <td style="border-radius:8px;background:#1d7a4d;">
                      <a href="mailto:${safeEmail}" style="display:inline-block;padding:12px 18px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;">Responder ao cliente</a>
                    </td>
                    <td width="10"></td>
                    <td style="border-radius:8px;border:1px solid #cfd9d2;">
                      <a href="tel:${safePhone}" style="display:inline-block;padding:11px 18px;color:#244d38;text-decoration:none;font-size:14px;font-weight:700;">Ligar</a>
                    </td>
                  </tr>
                </table>

                ${adminUrl ? `<p style="margin:20px 0 0;font-size:13px;"><a href="${escapeHtml(adminUrl)}" style="color:#176b43;">Abrir todos os pedidos no painel de administração</a></p>` : ''}
                <p style="margin:26px 0 0;padding-top:18px;border-top:1px solid #e7ece9;font-size:12px;color:#718078;">Origem: ${safeSource}${data.id === undefined ? '' : ` &nbsp;·&nbsp; Referência: #${escapeHtml(String(data.id))}`}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function buildText(data: ContactRequestEmailData) {
  return [
    `${requestLabel(data.id)} de orçamento — JRS Ferros`,
    `Recebido em: ${formatReceivedAt(data.createdAt)}`,
    `Origem: ${sourceLabel(data.source)}`,
    '',
    `Cliente / Empresa: ${data.name}`,
    `Email: ${data.email}`,
    `Telefone: ${data.phone}`,
    '',
    'PEDIDO',
    data.message,
    '',
    'Responda diretamente a este email para contactar o cliente.',
  ].join('\n');
}

/**
 * Envia o aviso ao administrador depois de o pedido estar guardado.
 * Uma falha no Resend é registada, mas não invalida o pedido do cliente.
 */
export async function sendContactNotification(
  data: ContactRequestEmailData,
): Promise<ContactNotificationResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[notifications] RESEND_API_KEY não definido — aviso por email ignorado.');
    return { sent: false, reason: 'not_configured' };
  }

  try {
    const resend = new Resend(apiKey);
    const { data: sentEmail, error } = await resend.emails.send(
      {
        from: NOTIFY_FROM,
        to: [NOTIFY_TO],
        replyTo: data.email,
        subject: `[${requestLabel(data.id)}] ${data.name}`,
        html: buildHtml(data),
        text: buildText(data),
        tags: [{ name: 'category', value: 'contact-request' }],
      },
      data.id === undefined
        ? undefined
        : { idempotencyKey: `contact-request-${data.id}` },
    );

    if (error) {
      console.error('[notifications] Resend não enviou o aviso:', error);
      return { sent: false, reason: 'send_failed' };
    }

    console.info(`[notifications] Aviso enviado para ${NOTIFY_TO} (${sentEmail?.id}).`);
    return { sent: true, emailId: sentEmail?.id };
  } catch (error) {
    console.error('[notifications] Falha ao enviar aviso pelo Resend:', error);
    return { sent: false, reason: 'send_failed' };
  }
}
