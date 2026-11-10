export interface GraphCredentials {
  tenantId: string;
  clientId: string;
  clientSecret: string;
}

export interface GraphMail {
  from: string;
  to: string[];
  subject: string;
  text: string;
  replyTo?: { address: string; name?: string };
}

let cachedToken: { value: string; expiresAt: number } | undefined;

async function getAccessToken({ tenantId, clientId, clientSecret }: GraphCredentials): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.value;

  const response = await fetch(`https://login.microsoftonline.com/${encodeURIComponent(tenantId)}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'https://graph.microsoft.com/.default',
      grant_type: 'client_credentials',
    }),
  });

  if (!response.ok) {
    throw new Error(`Token do Entra ID recusado (HTTP ${response.status}): ${await response.text()}`);
  }

  const data = (await response.json()) as { access_token: string; expires_in: number };
  // Renova um minuto antes de expirar para não usar um token vencido no meio do envio.
  cachedToken = { value: data.access_token, expiresAt: Date.now() + (data.expires_in - 60) * 1000 };
  return data.access_token;
}

export async function sendGraphMail(credentials: GraphCredentials, mail: GraphMail): Promise<void> {
  const token = await getAccessToken(credentials);

  const response = await fetch(`https://graph.microsoft.com/v1.0/users/${encodeURIComponent(mail.from)}/sendMail`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: {
        subject: mail.subject,
        body: { contentType: 'Text', content: mail.text },
        toRecipients: mail.to.map((address) => ({ emailAddress: { address } })),
        replyTo: mail.replyTo ? [{ emailAddress: mail.replyTo }] : [],
      },
      saveToSentItems: true,
    }),
  });

  if (response.status !== 202) {
    throw new Error(`Graph sendMail falhou (HTTP ${response.status}): ${await response.text()}`);
  }
}
