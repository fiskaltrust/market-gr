import { useState } from 'react';
import { type MiddlewareCredentials, saveCredentials } from './middleware';

interface Props {
  value: MiddlewareCredentials;
  onChange: (creds: MiddlewareCredentials) => void;
}

export function CredentialsPanel({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);

  const update = (patch: Partial<MiddlewareCredentials>) => {
    const next = { ...value, ...patch };
    onChange(next);
    saveCredentials(next);
  };

  return (
    <details open={open} onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
             style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', marginBottom: 12, background: 'var(--bg-elev)' }}>
      <summary style={{ cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
        Greek Middleware credentials {value.cashboxId && value.accessToken ? '✓' : '— required to validate'}
      </summary>

      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 12px', alignItems: 'center', marginTop: 12, fontSize: 13 }}>
        <label htmlFor="cred-base">Sandbox URL</label>
        <input id="cred-base" type="text" value={value.baseUrl}
               onChange={(e) => update({ baseUrl: e.target.value })}
               style={inputStyle} />

        <label htmlFor="cred-cashbox">CashBox ID</label>
        <input id="cred-cashbox" type="text" value={value.cashboxId} placeholder="00000000-0000-0000-0000-000000000000"
               onChange={(e) => update({ cashboxId: e.target.value })}
               style={inputStyle} />

        <label htmlFor="cred-token">Access Token</label>
        <input id="cred-token" type="password" value={value.accessToken} placeholder="Your access token"
               onChange={(e) => update({ accessToken: e.target.value })}
               style={inputStyle} />

        <label htmlFor="cred-pos">POS System ID</label>
        <input id="cred-pos" type="text" value={value.posSystemId}
               onChange={(e) => update({ posSystemId: e.target.value })}
               style={inputStyle} />
      </div>
      <p style={{ fontSize: 12, color: 'var(--fg-muted)', margin: '8px 0 0' }}>
        Stored in your browser's localStorage only. Used to call <code>/sign</code> and <code>/journal</code> on the configured sandbox.
      </p>
    </details>
  );
}

const inputStyle: React.CSSProperties = {
  background: 'var(--bg)',
  color: 'var(--fg)',
  border: '1px solid var(--border)',
  borderRadius: 4,
  padding: '6px 8px',
  fontSize: 13,
  fontFamily: 'inherit',
};
