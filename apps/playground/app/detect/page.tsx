'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { detect, type DetectResult, CPF_GOLDEN_PRIMARY_MASKED } from '@br-validators/core';

export default function DetectPlaygroundPage() {
  const [input, setInput] = useState(CPF_GOLDEN_PRIMARY_MASKED);
  const [uf, setUf] = useState('');

  const result: DetectResult | null = useMemo(() => (input ? detect(input, uf ? { uf: uf as 'SP' } : {}) : null), [input, uf]);

  const cliCommand = input ? `br-validators detect "${input}"${uf ? ` --uf ${uf}` : ''} --json` : '';

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <Link href="/" style={{ color: '#7aa2ff', textDecoration: 'none' }}>
        ← All types
      </Link>
      <h1 style={{ fontSize: '1.75rem', margin: '1rem 0 0.5rem' }}>detect()</h1>
      <p style={{ color: '#9aa5bd', marginBottom: '1.5rem' }}>
        Unified type detection — priority router over all shipped validators
      </p>

      <label style={{ display: 'block', marginBottom: '0.5rem', color: '#9aa5bd' }}>Input</label>
      <input
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
        }}
        style={inputStyle}
      />

      <label style={{ display: 'block', margin: '1rem 0 0.5rem', color: '#9aa5bd' }}>UF (optional, for IE)</label>
      <input
        value={uf}
        onChange={(e) => {
          setUf(e.target.value.toUpperCase());
        }}
        placeholder="SP"
        style={{ ...inputStyle, maxWidth: 120 }}
      />

      {result && (
        <section style={panelStyle}>
          <Row label="Type" value={result.type} />
          <Row label="Valid" value={result.ok ? 'yes' : 'no'} />
          {result.ok ? (
            <>
              <Row label="Value" value={result.value} />
              {result.format ? <Row label="Format" value={result.format} /> : null}
              {result.meta ? <Row label="Meta" value={JSON.stringify(result.meta)} /> : null}
            </>
          ) : (
            <>
              <Row label="Code" value={result.code} />
              <Row label="Message" value={result.message} />
            </>
          )}
        </section>
      )}

      {cliCommand ? (
        <section style={{ ...panelStyle, marginTop: '1rem' }}>
          <div style={{ color: '#9aa5bd', fontSize: '0.85rem' }}>CLI</div>
          <code style={{ wordBreak: 'break-all' }}>{cliCommand}</code>
        </section>
      ) : null}
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '0.85rem 1rem',
  borderRadius: 10,
  border: '1px solid #24304d',
  background: '#141b2f',
  color: '#e8ecf4',
  fontSize: '1rem',
  fontFamily: 'monospace',
};

const panelStyle: React.CSSProperties = {
  marginTop: '1.5rem',
  padding: '1.25rem',
  borderRadius: 12,
  background: '#141b2f',
  border: '1px solid #24304d',
  display: 'grid',
  gap: '0.75rem',
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem' }}>
      <span style={{ color: '#9aa5bd' }}>{label}</span>
      <span style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>{value}</span>
    </div>
  );
}
