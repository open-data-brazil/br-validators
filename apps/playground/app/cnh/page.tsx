'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  CNH_GOLDEN_PRIMARY,
  CNH_OFFICIAL_SOURCE_URL,
  CNH_SENATRAN_VALIDAR_URL,
  formatCnh,
  stripCnh,
  validateCnh,
} from '@br-validators/core';

export default function CnhPlaygroundPage() {
  const [input, setInput] = useState(CNH_GOLDEN_PRIMARY);

  const stripped = useMemo(() => (input ? stripCnh(input) : ''), [input]);
  const validation = useMemo(() => (input ? validateCnh(input) : null), [input]);
  const formatted = useMemo(() => (input ? formatCnh(input) : null), [input]);

  const cliCommand = input ? `br-validators cnh validate "${input}" --json` : '';

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <Link href="/" style={{ color: '#7aa2ff', textDecoration: 'none' }}>
        ← All types
      </Link>
      <h1 style={{ fontSize: '1.75rem', margin: '1rem 0 0.5rem' }}>CNH Validator</h1>
      <p style={{ color: '#9aa5bd', marginBottom: '1.5rem' }}>
        Registro Nacional · 11 contiguous digits (no CPF-style mask) · modulo 11 desconto
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
        <Row label="Format" value={formatted?.ok ? formatted.formatted : formatted?.ok === false ? formatted.message : '—'} />
      </section>

      <p style={{ marginTop: '1.5rem', fontSize: '0.9rem' }}>
        Official sources:{' '}
        <a href={CNH_OFFICIAL_SOURCE_URL} target="_blank" rel="noreferrer" style={{ color: '#7aa2ff' }}>
          CONTRAN Resolução 511/2014
        </a>
        {' · '}
        <a href={CNH_SENATRAN_VALIDAR_URL} target="_blank" rel="noreferrer" style={{ color: '#7aa2ff' }}>
          SENATRAN — Validar CNH (plain 11 digits)
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
