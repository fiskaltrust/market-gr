/**
 * Remote-ESM entry point for the `receipt-cookbook` plugin.
 *
 * All JSX and React hooks live inside the factory closure so the classic JSX
 * transform compiles against the apphost-provided `React`. See
 * docs/plugin-architecture.md for the contract.
 */
import type * as ReactNS from 'react';
import type CodeBlockType from '../../../src/components/CodeBlock';

interface PluginDeps {
  React: typeof ReactNS;
  components: {
    CodeBlock: typeof CodeBlockType;
  };
}

interface PluginExports {
  Component: ReactNS.ComponentType;
}

// ----------------------------------------------------------------------
// Sandbox credentials for the /sign call. Duplicated verbatim from the
// mydata-to-fiskaltrust plugin so each remote plugin stays self-contained
// — the apphost contract is deliberately narrow and does not expose
// "neighbouring plugin internals" via deps.
// ----------------------------------------------------------------------
const SANDBOX_BASE_URL = 'https://possystem-api-sandbox.fiskaltrust.eu/v2';
const SANDBOX_CASHBOX_ID = '31f3defc-275d-4b6e-9f3f-fa09d64c1bb4';
const SANDBOX_ACCESS_TOKEN =
  'BKNrSN7D0zCB8K3ymJNgw2LP/jxSroQqHgG6uYdbKC9ohgli0BeK/Ff6nebU9Av0tdjsuhuerk7E9PRF0G93e48=';

// ----------------------------------------------------------------------
// Case-value reference (hex literals). The values below mirror the
// scenarios in the GR middleware acceptance tests
// (`ReceiptExamples.cs` / `Examples.cs` / `AADECertificationExamples*`).
// Format reminder for ftReceiptCase / ftChargeItemCase / ftPayItemCase:
//   CCCC vlll gggg xxPP
//   ^^^^ ^^^^ ^^^^ ^^^^
//   country / version / global-flags / type
//
// `RECEIPT_REFUND_FLAG` etc. correspond to the .NET enums in
// `fiskaltrust.ifPOS.v2.Cases` — Refund is the bit-32 flag on every case.
// ----------------------------------------------------------------------
const RECEIPT_POS_CASH = '0x4752200000000001';
const RECEIPT_INVOICE_1_1 = '0x4752200000001001';
const RECEIPT_REFUND_FLAG_BIT = '0x0000000100000000';

const CHARGE_GOODS_VAT_24 = '0x4752200000000013';
const CHARGE_GOODS_VAT_13 = '0x4752200000000011';

const PAY_CASH = '0x4752200000000001';
const PAY_DEBIT_CARD = '0x4752200000000004';
const PAY_TIP_FLAG = '0x0000000000400000';
const PAY_REFUND_FLAG_BIT = '0x0000000100000000';

/** OR two 64-bit hex strings and return another 0x-prefixed hex string. */
function hexOr(a: string, b: string): string {
  const av = BigInt(a);
  const bv = BigInt(b);
  return '0x' + (av | bv).toString(16).padStart(16, '0').toUpperCase();
}

// ----------------------------------------------------------------------
// ReceiptRequest model — minimal subset we generate. The shape mirrors
// the JSON the middleware /sign endpoint accepts (PascalCase keys, hex
// strings for the case fields so JSON round-trips don't lose precision
// on long enums).
// ----------------------------------------------------------------------

interface ChargeItem {
  Position: number;
  Description: string;
  Amount: number;
  Quantity: number;
  VATRate: number;
  VATAmount: number;
  ftChargeItemCase: string;
}

interface PayItem {
  Description: string;
  Amount: number;
  Quantity?: number;
  ftPayItemCase: string;
}

interface ReceiptRequest {
  ftCashBoxID: string;
  cbTerminalID: string;
  cbReceiptReference: string;
  cbReceiptMoment: string;
  cbReceiptAmount: number;
  Currency: 'EUR';
  ftReceiptCase: string;
  cbChargeItems: ChargeItem[];
  cbPayItems: PayItem[];
  /** Optional B2B counterpart block, AADE customer party fields. */
  cbCustomer?: string;
}

interface Scenario {
  id: string;
  name: string;
  blurb: string;
  build(): ReceiptRequest;
}

// ----------------------------------------------------------------------
// Scenario library.
// ----------------------------------------------------------------------

function nowIsoUtc(): string {
  return new Date().toISOString();
}

function newReference(): string {
  return crypto.randomUUID();
}

function vatAmount(gross: number, rate: number): number {
  return round2((gross / (100 + rate)) * rate);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

const RETAIL_CASH: Scenario = {
  id: 'retail-cash',
  name: 'Retail receipt — cash',
  blurb: 'A 100,00 € retail receipt paid in cash. ftReceiptCase = PointOfSaleReceipt.',
  build: () => ({
    ftCashBoxID: SANDBOX_CASHBOX_ID,
    cbTerminalID: '1',
    cbReceiptReference: newReference(),
    cbReceiptMoment: nowIsoUtc(),
    cbReceiptAmount: 100,
    Currency: 'EUR',
    ftReceiptCase: RECEIPT_POS_CASH,
    cbChargeItems: [
      {
        Position: 1,
        Description: 'Coffee + pastry',
        Amount: 100,
        Quantity: 1,
        VATRate: 24,
        VATAmount: vatAmount(100, 24),
        ftChargeItemCase: CHARGE_GOODS_VAT_24,
      },
    ],
    cbPayItems: [
      {
        Description: 'Cash',
        Amount: 100,
        ftPayItemCase: PAY_CASH,
      },
    ],
  }),
};

const RETAIL_CARD: Scenario = {
  id: 'retail-card',
  name: 'Retail receipt — debit card',
  blurb: 'A 50,00 € retail receipt paid by debit card. ftReceiptCase = PointOfSaleReceipt.',
  build: () => ({
    ftCashBoxID: SANDBOX_CASHBOX_ID,
    cbTerminalID: '1',
    cbReceiptReference: newReference(),
    cbReceiptMoment: nowIsoUtc(),
    cbReceiptAmount: 50,
    Currency: 'EUR',
    ftReceiptCase: RECEIPT_POS_CASH,
    cbChargeItems: [
      {
        Position: 1,
        Description: 'Take-away meal',
        Amount: 50,
        Quantity: 1,
        VATRate: 24,
        VATAmount: vatAmount(50, 24),
        ftChargeItemCase: CHARGE_GOODS_VAT_24,
      },
    ],
    cbPayItems: [
      {
        Description: 'DebitCard',
        Amount: 50,
        ftPayItemCase: PAY_DEBIT_CARD,
      },
    ],
  }),
};

const B2B_INVOICE: Scenario = {
  id: 'b2b-invoice',
  name: 'B2B invoice (1.1) with counterpart',
  blurb:
    'A 200,00 € B2B sales invoice. ftReceiptCase = SalesInvoice0x1001. `cbCustomer` block carries the counterpart VAT number, country code and name as required by AADE for invoiceType 1.1.',
  build: () => ({
    ftCashBoxID: SANDBOX_CASHBOX_ID,
    cbTerminalID: '1',
    cbReceiptReference: newReference(),
    cbReceiptMoment: nowIsoUtc(),
    cbReceiptAmount: 200,
    Currency: 'EUR',
    ftReceiptCase: RECEIPT_INVOICE_1_1,
    cbCustomer: JSON.stringify(
      {
        CustomerVATNumber: '094458144',
        CustomerCountry: 'GR',
        CustomerName: 'Acme Trading Hellas',
        CustomerStreet: 'Stadiou 1',
        CustomerCity: 'Athens',
        CustomerZip: '10564',
      },
      null,
      2,
    ),
    cbChargeItems: [
      {
        Position: 1,
        Description: 'Consulting services — May',
        Amount: 200,
        Quantity: 1,
        VATRate: 24,
        VATAmount: vatAmount(200, 24),
        ftChargeItemCase: CHARGE_GOODS_VAT_24,
      },
    ],
    cbPayItems: [
      {
        Description: 'On credit',
        Amount: 200,
        ftPayItemCase: PAY_CASH,
      },
    ],
  }),
};

const REFUND: Scenario = {
  id: 'refund',
  name: 'Refund / credit note',
  blurb:
    'A -25,00 € credit note. Amounts and VAT are negative. The Refund flag (bit 32) is set on ftReceiptCase, ftChargeItemCase and ftPayItemCase.',
  build: () => ({
    ftCashBoxID: SANDBOX_CASHBOX_ID,
    cbTerminalID: '1',
    cbReceiptReference: newReference(),
    cbReceiptMoment: nowIsoUtc(),
    cbReceiptAmount: -25,
    Currency: 'EUR',
    ftReceiptCase: hexOr(RECEIPT_POS_CASH, RECEIPT_REFUND_FLAG_BIT),
    cbChargeItems: [
      {
        Position: 1,
        Description: 'Returned item — coffee mug',
        Amount: -25,
        Quantity: 1,
        VATRate: 24,
        VATAmount: -vatAmount(25, 24),
        ftChargeItemCase: hexOr(CHARGE_GOODS_VAT_24, RECEIPT_REFUND_FLAG_BIT),
      },
    ],
    cbPayItems: [
      {
        Description: 'Cash refund',
        Amount: -25,
        ftPayItemCase: hexOr(PAY_CASH, PAY_REFUND_FLAG_BIT),
      },
    ],
  }),
};

const WITH_TIP: Scenario = {
  id: 'with-tip',
  name: 'Receipt with tip',
  blurb:
    'A 40,00 € receipt with a 4,00 € tip. The main PayItem covers the bill; a second PayItem with the Tip flag (gggg=0040) carries the gratuity. The tip amount is negative so it flows out of the payment method.',
  build: () => ({
    ftCashBoxID: SANDBOX_CASHBOX_ID,
    cbTerminalID: '1',
    cbReceiptReference: newReference(),
    cbReceiptMoment: nowIsoUtc(),
    cbReceiptAmount: 40,
    Currency: 'EUR',
    ftReceiptCase: RECEIPT_POS_CASH,
    cbChargeItems: [
      {
        Position: 1,
        Description: 'Dinner for two',
        Amount: 40,
        Quantity: 1,
        VATRate: 24,
        VATAmount: vatAmount(40, 24),
        ftChargeItemCase: CHARGE_GOODS_VAT_24,
      },
    ],
    cbPayItems: [
      {
        Description: 'DebitCard (bill)',
        Amount: 44,
        ftPayItemCase: PAY_DEBIT_CARD,
      },
      {
        Description: 'Tip (gratuity)',
        Amount: -4,
        ftPayItemCase: hexOr(PAY_DEBIT_CARD, PAY_TIP_FLAG),
      },
    ],
  }),
};

const MULTI_VAT: Scenario = {
  id: 'multi-vat',
  name: 'Multi-VAT-rate receipt',
  blurb:
    'Two charge lines on the same receipt: one taxed at 24% (standard rate), one at 13% (reduced rate, e.g. food). Each ChargeItem carries its own ftChargeItemCase reflecting the applicable rate.',
  build: () => ({
    ftCashBoxID: SANDBOX_CASHBOX_ID,
    cbTerminalID: '1',
    cbReceiptReference: newReference(),
    cbReceiptMoment: nowIsoUtc(),
    cbReceiptAmount: 70,
    Currency: 'EUR',
    ftReceiptCase: RECEIPT_POS_CASH,
    cbChargeItems: [
      {
        Position: 1,
        Description: 'Bottle of wine (24% VAT)',
        Amount: 30,
        Quantity: 1,
        VATRate: 24,
        VATAmount: vatAmount(30, 24),
        ftChargeItemCase: CHARGE_GOODS_VAT_24,
      },
      {
        Position: 2,
        Description: 'Cheese platter (13% VAT)',
        Amount: 40,
        Quantity: 1,
        VATRate: 13,
        VATAmount: vatAmount(40, 13),
        ftChargeItemCase: CHARGE_GOODS_VAT_13,
      },
    ],
    cbPayItems: [
      {
        Description: 'Cash',
        Amount: 70,
        ftPayItemCase: PAY_CASH,
      },
    ],
  }),
};

const SCENARIOS: readonly Scenario[] = [
  RETAIL_CASH,
  RETAIL_CARD,
  B2B_INVOICE,
  REFUND,
  WITH_TIP,
  MULTI_VAT,
];

// ----------------------------------------------------------------------
// Sign call.
// ----------------------------------------------------------------------

interface SignState {
  busy: boolean;
  status?: number;
  ok?: boolean;
  body?: string;
  contentType?: string;
  durationMs?: number;
  error?: string;
}

async function signReceipt(receiptJson: string): Promise<SignState> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-cashbox-id': SANDBOX_CASHBOX_ID,
    'x-cashbox-accesstoken': SANDBOX_ACCESS_TOKEN,
    'x-operation-id': crypto.randomUUID(),
  };
  const start = performance.now();
  try {
    const response = await fetch(`${SANDBOX_BASE_URL}/sign`, {
      method: 'POST',
      headers,
      body: receiptJson,
    });
    const durationMs = Math.round(performance.now() - start);
    const body = await response.text();
    return {
      busy: false,
      status: response.status,
      ok: response.ok,
      body,
      contentType: response.headers.get('content-type') ?? '',
      durationMs,
    };
  } catch (err) {
    return {
      busy: false,
      durationMs: Math.round(performance.now() - start),
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// ----------------------------------------------------------------------
// Plugin factory.
// ----------------------------------------------------------------------

export default function createPlugin(deps: PluginDeps): PluginExports {
  const { React, components } = deps;
  const { CodeBlock } = components;
  const { useCallback, useMemo, useState } = React;

  function ReceiptCookbook() {
    const [selectedId, setSelectedId] = useState<string>(SCENARIOS[0].id);
    // Counter that increments on every `Regenerate` press — feeds the
    // memo dependency so `cbReceiptMoment` / `cbReceiptReference` refresh.
    const [generation, setGeneration] = useState(0);
    const [edited, setEdited] = useState<string | null>(null);
    const [signState, setSignState] = useState<SignState>({ busy: false });

    const scenario = SCENARIOS.find((s) => s.id === selectedId) ?? SCENARIOS[0];

    const generatedJson = useMemo(() => {
      const r = scenario.build();
      return JSON.stringify(r, null, 2);
    }, [scenario, generation]);

    const json = edited ?? generatedJson;

    const onSelect = useCallback((id: string) => {
      setSelectedId(id);
      setEdited(null);
      setSignState({ busy: false });
    }, []);

    const regenerate = useCallback(() => {
      setGeneration((g) => g + 1);
      setEdited(null);
      setSignState({ busy: false });
    }, []);

    const copy = useCallback(() => {
      void navigator.clipboard?.writeText(json).catch(() => {
        /* ignore */
      });
    }, [json]);

    const send = useCallback(async () => {
      setSignState({ busy: true });
      const result = await signReceipt(json);
      setSignState(result);
    }, [json]);

    return (
      <>
        <p style={{ marginTop: 0, color: 'var(--fg-muted)', fontSize: 14 }}>
          Pick a scenario on the left to generate a ready-to-send <code>ReceiptRequest</code>{' '}
          JSON on the right. Each generation refreshes <code>cbReceiptMoment</code> and{' '}
          <code>cbReceiptReference</code>. Edit freely before sending.
        </p>
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: '260px minmax(0, 1fr)',
            gap: 16,
            alignItems: 'stretch',
          }}
        >
          <aside
            style={{
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: 8,
              background: 'var(--bg-elev)',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            {SCENARIOS.map((s) => {
              const active = s.id === selectedId;
              return (
                <button
                  key={s.id}
                  onClick={() => onSelect(s.id)}
                  style={{
                    textAlign: 'left',
                    padding: '8px 10px',
                    borderRadius: 6,
                    border: '1px solid transparent',
                    background: active ? 'var(--accent-bg, rgba(78,161,255,0.12))' : 'transparent',
                    color: 'var(--fg)',
                    cursor: 'pointer',
                    fontSize: 13,
                    lineHeight: 1.3,
                  }}
                >
                  <div style={{ fontWeight: active ? 600 : 500 }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginTop: 2 }}>
                    {scenarioSummary(s)}
                  </div>
                </button>
              );
            })}
          </aside>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
            <div className="editor-header" style={{ padding: 0 }}>
              <span>{scenario.name}</span>
              <span style={{ color: 'var(--fg-muted)' }}>{scenario.blurb}</span>
            </div>
            <CodeBlock
              value={json}
              language="json"
              editable
              onChange={(v) => setEdited(v)}
              minHeight={420}
              style={{ flex: 1 }}
            />
            <div className="toolbar">
              <button className="btn btn-secondary" onClick={regenerate}>
                Regenerate
              </button>
              <button className="btn btn-secondary" onClick={copy}>
                Copy JSON
              </button>
              <button
                className="btn"
                onClick={() => void send()}
                disabled={signState.busy}
              >
                {signState.busy ? 'Signing…' : 'Send to /sign'}
              </button>
              <span className="status" style={{ marginLeft: 'auto' }}>
                {signState.status !== undefined && !signState.error && (
                  <>HTTP {signState.status} · {signState.durationMs} ms</>
                )}
              </span>
            </div>
            {signState.error && (
              <p className="status error" style={{ margin: 0 }}>
                {signState.error}
              </p>
            )}
            {signState.body && (
              <div className="editor">
                <div className="editor-header">
                  <span>/sign response</span>
                  <span>{signState.body.length.toLocaleString()} chars</span>
                </div>
                <CodeBlock
                  value={signState.body}
                  language={signState.contentType?.includes('json') ? 'json' : 'plaintext'}
                  minHeight={240}
                />
              </div>
            )}
          </div>
        </section>
      </>
    );
  }

  return { Component: ReceiptCookbook };
}

function scenarioSummary(s: Scenario): string {
  switch (s.id) {
    case 'retail-cash':
      return 'POS · cash · 24% VAT';
    case 'retail-card':
      return 'POS · debit card · 24% VAT';
    case 'b2b-invoice':
      return 'Sales invoice 1.1 · counterpart';
    case 'refund':
      return 'Credit note · Refund flag';
    case 'with-tip':
      return 'POS · DebitCard + Tip flag';
    case 'multi-vat':
      return 'POS · 24% + 13% lines';
    default:
      return '';
  }
}
