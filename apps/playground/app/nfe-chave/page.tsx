'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  NFE_CHAVE_GOLDEN_PRIMARY,
  NFE_CHAVE_MOC_DV_SECTION_URL,
  NFE_CHAVE_MOC_ONLINE_URL,
  NFE_CHAVE_MOC_PDF_URL,
  NFE_CHAVE_OFFICIAL_SOURCE_URL,
  formatNfeChave,
  parseNfeChave,
  stripNfeChave,
  validateNfeChave,
} from '@br-validators/core';

const PARSED_FIELDS = [
  ['cUF', 'UF (IBGE)'],
  ['aamm', 'Emission AAMM'],
  ['cnpj', 'CNPJ'],
  ['mod', 'Model'],
  ['serie', 'Series'],
  ['nNF', 'Number'],
  ['tpEmis', 'Emission type'],
  ['cNF', 'Numeric code'],
  ['cDV', 'Check digit'],
] as const;

export default function NfeChavePlaygroundPage() {
  const [input, setInput] = useState(NFE_CHAVE_GOLDEN_PRIMARY);

  const stripped = useMemo(() => (input ? stripNfeChave(input) : ''), [input]);
  const validation = useMemo(() => (input ? validateNfeChave(input) : null), [input]);
  const parsed = useMemo(() => (input ? parseNfeChave(input) : null), [input]);
  const formatted = useMemo(() => (input ? formatNfeChave(input) : null), [input]);

  const cliCommand = input ? `br-validators nfe-chave parse "${input}" --json` : '';

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <Link href="/" style={{ color: '#7aa2ff', textDecoration: 'none' }}>
        ← All types
      </Link>
      <h1 style={{ fontSize: '1.75rem', margin: '1rem 0 0.5rem' }}>NF-e Chave de Acesso</h1>
      <p style={{ color: '#9aa5bd', marginBottom: '1.5rem' }}>
        44 digits · modulo 11 DV · NF-e (55) / NFC-e (65)
      </p>

      <label style={{ display: 'block', marginBottom: '0.5rem', color: '#9aa5bd' }}>Input</label>
      <input
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
        }}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: '0.85rem 1rem',
          borderRadius: 10,
          border: '1px solid #24304d',
          background: '#141b2f',
          color: '#e8ecf4',
          fontSize: '1rem',
          fontFamily: 'monospace',
        }}
      />

      <section
        style={{
          marginTop: '1.5rem',
          padding: '1.25rem',
          borderRadius: 12,
          background: '#141b2f',
          border: '1px solid #24304d',
          display: 'grid',
          gap: '0.75rem',
        }}
      >
        <Row label="Strip" value={stripped || '—'} />
        <Row
          label="Valid"
          value={
            validation
              ? validation.ok
                ? 'yes'
                : `no — ${validation.code}`
              : '—'
          }
        />
        <Row label="UF" value={validation?.ok && validation.uf ? validation.uf : '—'} />
        <Row
          label="Format"
          value={formatted?.ok ? formatted.formatted : formatted?.ok === false ? formatted.message : '—'}
        />
      </section>

      {parsed?.ok && (
        <section
          style={{
            marginTop: '1.5rem',
            padding: '1.25rem',
            borderRadius: 12,
            background: '#141b2f',
            border: '1px solid #24304d',
          }}
        >
          <h2 style={{ fontSize: '1rem', margin: '0 0 1rem', color: '#9aa5bd' }}>Parsed fields</h2>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {PARSED_FIELDS.map(([key, label]) => (
              <Row key={key} label={label} value={parsed.parsed[key]} />
            ))}
          </div>
        </section>
      )}

      <p style={{ marginTop: '1.5rem', fontSize: '0.9rem' }}>
        Official sources:{' '}
        <a href={NFE_CHAVE_OFFICIAL_SOURCE_URL} target="_blank" rel="noreferrer" style={{ color: '#7aa2ff' }}>
          Portal NF-e (MOC index)
        </a>
        {' · '}
        <a href={NFE_CHAVE_MOC_ONLINE_URL} target="_blank" rel="noreferrer" style={{ color: '#7aa2ff' }}>
          MOC online §2.2.6
        </a>
        {' · '}
        <a href={NFE_CHAVE_MOC_DV_SECTION_URL} target="_blank" rel="noreferrer" style={{ color: '#7aa2ff' }}>
          DV algorithm §2.2.6.2
        </a>
        {' · '}
        <a href={NFE_CHAVE_MOC_PDF_URL} target="_blank" rel="noreferrer" style={{ color: '#7aa2ff' }}>
          MOC 7.0 PDF
        </a>
      </p>

      {cliCommand && (
        <pre
          style={{
            marginTop: '1rem',
            padding: '1rem',
            borderRadius: 10,
            background: '#0f1528',
            border: '1px solid #24304d',
            overflow: 'auto',
            fontSize: '0.85rem',
          }}
        >
          {cliCommand}
        </pre>
      )}
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '8rem 1fr', gap: '1rem', alignItems: 'start' }}>
      <span style={{ color: '#9aa5bd' }}>{label}</span>
      <code style={{ wordBreak: 'break-all' }}>{value}</code>
    </div>
  );
}
