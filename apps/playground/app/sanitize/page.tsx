'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { sanitize, type SanitizableDocumentType } from '@br-validators/core';

const TYPES: SanitizableDocumentType[] = [
  'cpf',
  'cnpj',
  'cep',
  'placa',
  'pis-pasep',
  'telefone',
  'cnh',
  'renavam',
  'titulo-eleitor',
  'nfe-chave',
  'boleto',
  'cartao-credito',
  'inscricao-estadual',
  'inscricao-estadual-produtor-rural',
];

export default function SanitizePlaygroundPage() {
  const [type, setType] = useState<SanitizableDocumentType>('cpf');
  const [input, setInput] = useState('  123.456.789-09 ');
  const [uf, setUf] = useState('SP');

  const result = useMemo(
    () => sanitize(input, type, type === 'inscricao-estadual' ? { uf: uf as 'SP' } : {}),
    [input, type, uf],
  );

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <Link href="/" style={{ color: '#7aa2ff', textDecoration: 'none' }}>
        ← All types
      </Link>
      <h1 style={{ fontSize: '1.75rem', margin: '1rem 0 0.5rem' }}>sanitize()</h1>
      <p style={{ color: '#9aa5bd', marginBottom: '1.5rem' }}>ETL fixes then validate — never bypasses DV</p>

      <label style={labelStyle}>Type</label>
      <select
        value={type}
        onChange={(e) => {
          setType(e.target.value as SanitizableDocumentType);
        }}
        style={inputStyle}
      >
        {TYPES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      {type === 'inscricao-estadual' ? (
        <>
          <label style={labelStyle}>UF</label>
          <input value={uf} onChange={(e) => { setUf(e.target.value.toUpperCase()); }} style={inputStyle} />
        </>
      ) : null}

      <label style={labelStyle}>Messy input</label>
      <input value={input} onChange={(e) => { setInput(e.target.value); }} style={inputStyle} />

      <section style={panelStyle}>
        <Row label="OK" value={result.ok ? 'yes' : 'no'} />
        {result.ok ? (
          <>
            <Row label="Value" value={result.value} />
            <Row label="Fixes" value={result.fixes.join(', ') || '—'} />
          </>
        ) : (
          <>
            <Row label="Code" value={result.code} />
            <Row label="Message" value={result.message} />
          </>
        )}
      </section>
    </main>
  );
}

const labelStyle: React.CSSProperties = { display: 'block', margin: '1rem 0 0.5rem', color: '#9aa5bd' };

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
    <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '0.5rem' }}>
      <span style={{ color: '#9aa5bd' }}>{label}</span>
      <span style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>{value}</span>
    </div>
  );
}
