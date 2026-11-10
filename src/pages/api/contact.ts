import type { APIRoute } from 'astro';
import { handleContactSubmission } from '../../lib/contact-mail';

export const prerender = false;

export const POST: APIRoute = async ({ request, clientAddress, site }) => {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    payload = undefined;
  }

  let ip: string | undefined;
  try {
    ip = clientAddress;
  } catch {
    ip = undefined;
  }

  const result = await handleContactSubmission({
    payload,
    origin: request.headers.get('origin'),
    requestOrigin: new URL(request.url).origin,
    siteOrigin: site?.origin,
    ip,
  });

  return Response.json(result.body, { status: result.status });
};
