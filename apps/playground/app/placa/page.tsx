'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  PLACA_OFFICIAL_SOURCE_URL,
  convertPlacaToMercosul,
  detectPlacaFormat,
  formatPlaca,
  stripPlaca,
  validatePlaca,
} from 'br-validators';

export default function PlacaPlaygroundPage() {
  const [input, setInput] = useState('ABC1D23');

  const stripped = useMemo(() => (input ? stripPlaca(input) : ''), [input]);
  const detectedFormat = useMemo(() => (input ? detectPlacaFormat(input) : null), [input]);
  const validation = useMemo(() => (input ? validatePlaca(input) : null), [input]);
  const formatted = useMemo(() => (input ? formatPlaca(input) : null), [input]);
  const converted = useMemo(
    () => (input && detectedFormat === 'legacy' ? convertPlacaToMercosul(input) : null),
    [input, detectedFormat],
  );

  const cliCommand = input ? `br-validators placa validate ${stripped || '<value>'}` : '';

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <Link href="/" style={{ color: '#7aa2ff', textDecoration: 'none' }}>
        ← All types
      </Link>
      <h1 style={{ fontSize: '1.75rem', margin: '1rem 0 0.5rem' }}>Placa Validator</h1>
      <p style={{ color: '#9aa5bd', marginBottom: '1.5rem' }}>
        Legacy + Mercosul · CONTRAN patterns · does not verify Detran registration
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
        <Row label="Format" value={detectedFormat && detectedFormat !== 'unknown' ? detectedFormat : '—'} />
        <Row
          label="Valid"
          value={
            validation
              ? validation.ok
                ? `yes (${validation.format})`
                : `no — ${validation.code}`
              : '—'
          }
        />
        <Row label="Canonical" value={formatted?.ok ? formatted.formatted : formatted?.ok === false ? formatted.message : '—'} />
        <Row
          label="Convert"
          value={
            detectedFormat === 'legacy'
              ? converted?.ok
                ? converted.formatted
                : converted?.ok === false
                  ? converted.message
                  : '—'
              : 'legacy only'
          }
        />
      </section>

      <p style={{ marginTop: '1.5rem', fontSize: '0.9rem' }}>
        Official source:{' '}
        <a href={PLACA_OFFICIAL_SOURCE_URL} target="_blank" rel="noreferrer" style={{ color: '#7aa2ff' }}>
          CONTRAN Resolução 729/2018
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
    <div style={{ display: 'grid', gridTemplateColumns: '6rem 1fr', gap: '1rem', alignItems: 'start' }}>
      <span style={{ color: '#9aa5bd' }}>{label}</span>
      <code style={{ wordBreak: 'break-all' }}>{value}</code>
    </div>
  );
}
