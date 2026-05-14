/**
 * Thin client around the fiskaltrust POS System API for sending the
 * converted ReceiptRequest to the Greek Middleware sandbox and fetching the
 * generated AADE myDATA payload back via the journal endpoint.
 *
 * Auth pattern lifted from the developer-platform playground (RequestPanel).
 */

const STORAGE_KEY = 'mydata-tool/credentials';

export const DEFAULT_SANDBOX_URL = 'https://possystem-api-sandbox.fiskaltrust.eu/v2';

// Greek AADE journal export — see journal-types.ts in service-developer-platform.
export const AADE_JOURNAL_TYPE = '0x4752200000000001';

export interface MiddlewareCredentials {
  baseUrl: string;
  cashboxId: string;
  accessToken: string;
  posSystemId: string;
}

export const emptyCredentials: MiddlewareCredentials = {
  baseUrl: DEFAULT_SANDBOX_URL,
  cashboxId: '',
  accessToken: '',
  posSystemId: '00000000-0000-0000-0000-000000000000',
};

export function loadCredentials(): MiddlewareCredentials {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyCredentials;
    const parsed = JSON.parse(raw) as Partial<MiddlewareCredentials>;
    return { ...emptyCredentials, ...parsed };
  } catch {
    return emptyCredentials;
  }
}

export function saveCredentials(creds: MiddlewareCredentials): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(creds));
}

export function credentialsAreComplete(creds: MiddlewareCredentials): boolean {
  return Boolean(creds.baseUrl && creds.cashboxId && creds.accessToken);
}

interface RequestArgs {
  creds: MiddlewareCredentials;
  path: string;
  body: unknown;
}

export interface MiddlewareResponse {
  status: number;
  ok: boolean;
  body: string;
  contentType: string;
  durationMs: number;
}

async function postJson({ creds, path, body }: RequestArgs): Promise<MiddlewareResponse> {
  const url = `${creds.baseUrl.replace(/\/$/, '')}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-cashbox-id': creds.cashboxId,
    'x-cashbox-accesstoken': creds.accessToken,
    'x-operation-id': crypto.randomUUID(),
    'x-possystem-id': creds.posSystemId || '00000000-0000-0000-0000-000000000000',
  };

  const start = performance.now();
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
  const durationMs = Math.round(performance.now() - start);
  const text = await response.text();
  return {
    status: response.status,
    ok: response.ok,
    body: text,
    contentType: response.headers.get('content-type') ?? '',
    durationMs,
  };
}

/** POST /sign — fiscalize the ReceiptRequest. */
export function signReceipt(creds: MiddlewareCredentials, receiptJson: string): Promise<MiddlewareResponse> {
  return postJson({ creds, path: '/sign', body: receiptJson });
}

/** POST /journal — fetch the AADE myDATA export for the queue. */
export function fetchAadeJournal(creds: MiddlewareCredentials): Promise<MiddlewareResponse> {
  return postJson({
    creds,
    path: '/journal',
    body: { ftJournalType: AADE_JOURNAL_TYPE },
  });
}

/**
 * Heuristic: pull the InvoicesDoc XML out of whatever the journal endpoint
 * returned. The middleware may return raw XML, JSON-with-Base64, or a multi-
 * record stream. We try the simple cases and surface the rest verbatim.
 */
export function extractInvoicesDocXml(rawBody: string): string | null {
  const trimmed = rawBody.trimStart();
  if (trimmed.startsWith('<?xml') || trimmed.startsWith('<InvoicesDoc')) {
    return rawBody;
  }

  // Try JSON: { Data: "<base64>" } or { Body: "<xml>" }
  try {
    const json = JSON.parse(rawBody);
    const candidates: unknown[] = [json?.Data, json?.Body, json?.body, json?.data];
    for (const c of candidates) {
      if (typeof c !== 'string') continue;
      if (c.trimStart().startsWith('<')) return c;
      // Try base64 decode
      try {
        const decoded = atob(c);
        if (decoded.trimStart().startsWith('<')) return decoded;
      } catch {
        // not base64
      }
    }
  } catch {
    // not JSON
  }

  return null;
}
