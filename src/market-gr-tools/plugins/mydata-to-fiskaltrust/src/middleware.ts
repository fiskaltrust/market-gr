/**
 * Thin client around the fiskaltrust POS System API for sending the
 * converted ReceiptRequest to the Greek Middleware sandbox.
 */

const SANDBOX_BASE_URL = 'https://possystem-api-sandbox.fiskaltrust.eu/v2';
const SANDBOX_CASHBOX_ID = '31f3defc-275d-4b6e-9f3f-fa09d64c1bb4';
const SANDBOX_ACCESS_TOKEN =
  'BKNrSN7D0zCB8K3ymJNgw2LP/jxSroQqHgG6uYdbKC9ohgli0BeK/Ff6nebU9Av0tdjsuhuerk7E9PRF0G93e48=';

const MYDATA_XML_CAPTION = 'mydata-xml';

export interface MiddlewareResponse {
  status: number;
  ok: boolean;
  body: string;
  contentType: string;
  durationMs: number;
}

export async function signReceipt(receiptJson: string): Promise<MiddlewareResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-cashbox-id': SANDBOX_CASHBOX_ID,
    'x-cashbox-accesstoken': SANDBOX_ACCESS_TOKEN,
    'x-operation-id': crypto.randomUUID(),
  };

  const start = performance.now();
  const response = await fetch(`${SANDBOX_BASE_URL}/sign`, {
    method: 'POST',
    headers,
    body: receiptJson,
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

export function extractMyDataXmlFromSignResponse(rawBody: string): string | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return null;
  }

  const candidates: unknown[] = [
    (parsed as { ftSignatures?: unknown[] })?.ftSignatures,
    (parsed as { ReceiptResponse?: { ftSignatures?: unknown[] } })?.ReceiptResponse?.ftSignatures,
  ];

  for (const signatures of candidates) {
    if (!Array.isArray(signatures)) continue;
    const sig = signatures.find((s) => (s as { Caption?: string })?.Caption === MYDATA_XML_CAPTION);
    const data = (sig as { Data?: string })?.Data;
    if (typeof data === 'string' && data.trim()) return data;
  }
  return null;
}
