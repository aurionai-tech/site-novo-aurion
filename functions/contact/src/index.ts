import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { sendGraphMail } from './graph-mail.js';

const FALLBACK_MAILBOX = 'contato@aurionai.com.br';
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 15 * 60 * 1000;
const MAX_FIELD_LENGTH = 5000;

const attempts = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (attempts.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) { attempts.set(ip, recent); return true; }
  recent.push(now);
  attempts.set(ip, recent);
  return false;
}

function isAllowedOrigin(origin: string | null, allowedOrigins: string): boolean {
  if (!origin) return false;
  const allowed = new Set(allowedOrigins.split(',').map((o) => o.trim()).filter(Boolean));
  return allowed.has(origin);
}

function field(data: Record<string, unknown>, key: string): string {
  const value = data[key];
  return typeof value === 'string' ? value.trim().slice(0, MAX_FIELD_LENGTH) : '';
}

const fail = (status: number, error: string): HttpResponseInit => ({
  status,
  jsonBody: { ok: false, error },
});

app.http('contact', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'contact',
  handler: async (req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const origin = req.headers.get('origin');
    const allowedOrigins = process.env.CONTACT_ALLOWED_ORIGINS ?? '';

    if (!isAllowedOrigin(origin, allowedOrigins)) return fail(403, 'Origem não autorizada.');

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
    if (isRateLimited(ip)) return fail(429, 'Muitas tentativas. Aguarde alguns minutos e tente de novo.');

    let payload: unknown;
    try { payload = await req.json(); } catch { return fail(400, 'Dados inválidos.'); }

    if (!payload || typeof payload !== 'object') return fail(400, 'Dados inválidos.');
    const data = payload as Record<string, unknown>;

    if (field(data, '_hp')) return { status: 200, jsonBody: { ok: true } };

    const nome = field(data, 'nome').replace(/[\r\n]+/g, ' ').slice(0, 120);
    const email = field(data, 'email');
    const processo = field(data, 'processo');

    if (!nome) return fail(400, 'Informe o seu nome.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return fail(400, 'Informe um e-mail válido.');
    if (!processo) return fail(400, 'Conte como o processo funciona hoje.');
    if (data.lgpd !== true) return fail(400, 'É preciso concordar com a política de privacidade.');

    const tenantId = process.env.MICROSOFT_TENANT_ID;
    const clientId = process.env.MICROSOFT_CLIENT_ID;
    const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;

    if (!tenantId || !clientId || !clientSecret) {
      return fail(503, 'Envio de e-mail indisponível no momento.');
    }

    const mailFrom = process.env.CONTACT_MAIL_FROM || FALLBACK_MAILBOX;
    const mailTo = (process.env.CONTACT_MAIL_TO || FALLBACK_MAILBOX).split(',').map((a) => a.trim()).filter(Boolean);

    const text = [
      'Pedido de diagnóstico enviado pelo site.',
      '',
      `Nome: ${nome}`,
      `Empresa: ${field(data, 'empresa') || 'não informado'}`,
      `E-mail: ${email}`,
      `Telefone / WhatsApp: ${field(data, 'telefone') || 'não informado'}`,
      `Ramo de atuação: ${field(data, 'segmento') || 'não informado'}`,
      `Responsável hoje: ${field(data, 'responsavel') || 'não informado'}`,
      '',
      'Como o processo funciona hoje:',
      processo,
      '',
      'Onde está a maior dor:',
      field(data, 'dor') || 'não informado',
      '',
      'Sistemas ou ferramentas usados:',
      field(data, 'sistemas') || 'não informado',
      '',
      `Consentimento LGPD: sim (${new Date().toISOString()})`,
    ].join('\n');

    try {
      await sendGraphMail(
        { tenantId, clientId, clientSecret },
        { from: mailFrom, to: mailTo, subject: `[Site Aurion] Mensagem de ${nome}`, text, replyTo: { address: email, name: nome } },
      );
    } catch (error) {
      context.error('[contato] Falha ao enviar pela Microsoft Graph:', error);
      return fail(502, 'Não foi possível enviar agora. Tente de novo em instantes.');
    }

    return { status: 200, jsonBody: { ok: true } };
  },
});
