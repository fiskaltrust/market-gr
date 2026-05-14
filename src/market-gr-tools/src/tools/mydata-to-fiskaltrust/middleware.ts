/**
 * Thin client around the fiskaltrust POS System API for sending the
 * converted ReceiptRequest to the Greek Middleware sandbox and fetching the
 * generated AADE myDATA payload back via the journal endpoint.
 *
 * Auth values come from the developer-platform playground's
 * SANDBOX_CREDENTIALS.GR — the same shared sandbox cashbox the playground
 * uses, so behaviour matches what's seen there.
 */

const SANDBOX_BASE_URL = 'https://possystem-api-sandbox.fiskaltrust.eu/v2';
const SANDBOX_CASHBOX_ID = '31f3defc-275d-4b6e-9f3f-fa09d64c1bb4';
const SANDBOX_ACCESS_TOKEN =
  'BKNrSN7D0zCB8K3ymJNgw2LP/jxSroQqHgG6uYdbKC9ohgli0BeK/Ff6nebU9Av0tdjsuhuerk7E9PRF0G93e48=';

// Greek AADE journal export — see journal-types.ts in service-developer-platform.
export const AADE_JOURNAL_TYPE = '0x4752200000000001';

export interface MiddlewareResponse {
  status: number;
  ok: boolean;
  body: string;
  contentType: string;
  durationMs: number;
}

async function postJson(path: string, body: unknown): Promise<MiddlewareResponse> {
  const url = `${SANDBOX_BASE_URL}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-cashbox-id': SANDBOX_CASHBOX_ID,
    'x-cashbox-accesstoken': SANDBOX_ACCESS_TOKEN,
    'x-operation-id': crypto.randomUUID(),
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
export function signReceipt(receiptJson: string): Promise<MiddlewareResponse> {
  return postJson('/sign', receiptJson);
}

/** POST /journal — fetch the AADE myDATA export for the queue. */
export function fetchAadeJournal(): Promise<MiddlewareResponse> {
  return postJson('/journal', { ftJournalType: AADE_JOURNAL_TYPE });
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
