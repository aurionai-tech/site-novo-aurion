import {
  CONTACT_ALLOWED_ORIGINS,
  CONTACT_MAIL_FROM,
  CONTACT_MAIL_TO,
  MICROSOFT_CLIENT_ID,
  MICROSOFT_CLIENT_SECRET,
  MICROSOFT_TENANT_ID,
} from 'astro:env/server';
import { sendGraphMail } from './microsoft-graph-mail';

const FALLBACK_MAILBOX = 'contato@aurionai.com.br';
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 15 * 60 * 1000;
const MAX_FIELD_LENGTH = 5000;

export interface ContactResult {
  status: number;
  body: { ok: true } | { ok: false; error: string };
}

interface ContactRequest {
  payload: unknown;
  origin: string | null;
  requestOrigin: string;
  siteOrigin?: string;
  ip?: string;
}

// Memória por instância: na Vercel cada instância conta separado, então o limite é aproximado.
const attempts = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (attempts.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) {
    attempts.set(ip, recent);
    return true;
  }
  recent.push(now);
  attempts.set(ip, recent);
  return false;
}

function isAllowedOrigin(origin: string | null, requestOrigin: string, siteOrigin?: string): boolean {
  if (!origin) return false;
  const allowed = new Set([requestOrigin, siteOrigin]);
  for (const extra of CONTACT_ALLOWED_ORIGINS?.split(',') ?? []) allowed.add(extra.trim());
  return allowed.has(origin);
}

function field(data: Record<string, unknown>, key: string): string {
  const value = data[key];
  return typeof value === 'string' ? value.trim().slice(0, MAX_FIELD_LENGTH) : '';
}

const fail = (status: number, error: string): ContactResult => ({ status, body: { ok: false, error } });

export async function handleContactSubmission({
  payload,
  origin,
  requestOrigin,
  siteOrigin,
  ip,
}: ContactRequest): Promise<ContactResult> {
  if (!isAllowedOrigin(origin, requestOrigin, siteOrigin)) return fail(403, 'Origem não autorizada.');
  if (ip && isRateLimited(ip)) return fail(429, 'Muitas tentativas. Aguarde alguns minutos e tente de novo.');

  if (!payload || typeof payload !== 'object') return fail(400, 'Dados inválidos.');
  const data = payload as Record<string, unknown>;

  if (field(data, '_hp')) return { status: 200, body: { ok: true } };

  const nome = field(data, 'nome').replace(/[\r\n]+/g, ' ').slice(0, 120);
  const email = field(data, 'email');
  const processo = field(data, 'processo');

  if (!nome) return fail(400, 'Informe o seu nome.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return fail(400, 'Informe um e-mail válido.');
  if (!processo) return fail(400, 'Conte como o processo funciona hoje.');
  if (data.lgpd !== true) return fail(400, 'É preciso concordar com a política de privacidade.');

  if (!MICROSOFT_TENANT_ID || !MICROSOFT_CLIENT_ID || !MICROSOFT_CLIENT_SECRET) {
    return fail(503, 'Envio de e-mail indisponível no momento.');
  }

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
      { tenantId: MICROSOFT_TENANT_ID, clientId: MICROSOFT_CLIENT_ID, clientSecret: MICROSOFT_CLIENT_SECRET },
      {
        from: CONTACT_MAIL_FROM || FALLBACK_MAILBOX,
        to: (CONTACT_MAIL_TO || FALLBACK_MAILBOX).split(',').map((a) => a.trim()).filter(Boolean),
        subject: `[Site Aurion] Mensagem de ${nome}`,
        text,
        replyTo: { address: email, name: nome },
      },
    );
  } catch (error) {
    console.error('[contato] Falha ao enviar pela Microsoft Graph:', error);
    return fail(502, 'Não foi possível enviar agora. Tente de novo em instantes.');
  }

  return { status: 200, body: { ok: true } };
}
