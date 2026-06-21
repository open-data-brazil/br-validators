'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  BOLETO_LAYOUTS_PORTAL_URL,
  BOLETO_OFFICIAL_SOURCE_URL,
  convertCodigoBarrasToLinhaDigitavel,
  convertLinhaToCodigoBarras,
  detectBoletoInputKind,
  formatBoleto,
  validateBoleto,
} from 'br-validators';

export default function BoletoPlaygroundPage() {
  const [input, setInput] = useState('03399.02579 08991.834006 71742.301014 6 14500000099668');

  const detectedKind = useMemo(() => (input ? detectBoletoInputKind(input) : null), [input]);
  const validation = useMemo(() => (input ? validateBoleto(input) : null), [input]);

  const converted = useMemo(() => {
    if (!validation?.ok) return null;
    if (validation.inputKind === 'linha-digitavel') {
      return convertLinhaToCodigoBarras(input);
    }
    return convertCodigoBarrasToLinhaDigitavel(input);
  }, [input, validation]);

  const formatted = useMemo(() => (input ? formatBoleto(input) : null), [input]);

  const cliCommand = input
    ? `br-validators boleto format ${input.includes(' ') ? `"${input}"` : input}`
    : '';

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <Link href="/" style={{ color: '#7aa2ff', textDecoration: 'none' }}>
        ← All types
      </Link>
      <h1 style={{ fontSize: '1.75rem', margin: '1rem 0 0.5rem' }}>Boleto Validator</h1>
      <p style={{ color: '#9aa5bd', marginBottom: '1.5rem' }}>
        Linha digitável (47) · código de barras (44) — format/check digits only · no bank lookup
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
        <Row label="Detect" value={detectedKind ?? '—'} />
        <Row
          label="Valid"
          value={
            validation
              ? validation.ok
                ? `yes (${validation.inputKind})`
                : `no — ${validation.code}`
              : '—'
          }
        />
        <Row label="Value" value={validation?.ok ? validation.value : '—'} />
        <Row
          label="Converted"
          value={converted?.ok ? `${converted.inputKind}: ${converted.value}` : '—'}
        />
        <Row label="Format" value={formatted?.ok ? formatted.formatted : formatted?.ok === false ? formatted.message : '—'} />
      </section>

      <p style={{ marginTop: '1.5rem', fontSize: '0.9rem' }}>
        Official sources:{' '}
        <a href={BOLETO_OFFICIAL_SOURCE_URL} target="_blank" rel="noreferrer" style={{ color: '#7aa2ff' }}>
          Convenção da Cobrança
        </a>
        {' · '}
        <a href={BOLETO_LAYOUTS_PORTAL_URL} target="_blank" rel="noreferrer" style={{ color: '#7aa2ff' }}>
          FEBRABAN Layouts
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
