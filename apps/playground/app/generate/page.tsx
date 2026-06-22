'use client';

import Link from 'next/link';
import { useCallback, useState } from 'react';
import {
  generate,
  validateCpf,
  validateCnpj,
  type GeneratableDocumentType,
} from '@br-validators/core';

const TYPES: GeneratableDocumentType[] = [
  'cpf',
  'cnpj',
  'cep',
  'placa',
  'pis-pasep',
  'renavam',
  'cnh',
  'telefone',
  'cartao-credito',
];

export default function GeneratePlaygroundPage() {
  const [type, setType] = useState<GeneratableDocumentType>('cpf');
  const [masked, setMasked] = useState(false);
  const [seed, setSeed] = useState('42');
  const [value, setValue] = useState('');
  const [valid, setValid] = useState<boolean | null>(null);

  const runGenerate = useCallback(() => {
    const parsedSeed = seed.trim() === '' ? undefined : Number(seed);
    const next = generate(type, { masked, seed: parsedSeed });
    setValue(next);
    if (type === 'cpf') {
      setValid(validateCpf(next).ok);
    } else if (type === 'cnpj') {
      setValid(validateCnpj(next).ok);
    } else {
      setValid(true);
    }
  }, [type, masked, seed]);

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <Link href="/" style={{ color: '#7aa2ff', textDecoration: 'none' }}>
        ← All types
      </Link>
      <h1 style={{ fontSize: '1.75rem', margin: '1rem 0 0.5rem' }}>generate()</h1>
      <p style={{ color: '#9aa5bd', marginBottom: '1.5rem' }}>Synthetic test documents only — reuses official DV algorithms</p>

      <label style={labelStyle}>Type</label>
      <select
        value={type}
        onChange={(e) => {
          setType(e.target.value as GeneratableDocumentType);
        }}
        style={inputStyle}
      >
        {TYPES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <input
          type="checkbox"
          checked={masked}
          onChange={(e) => {
            setMasked(e.target.checked);
          }}
        />
        Masked output
      </label>

      <label style={labelStyle}>Seed (optional)</label>
      <input value={seed} onChange={(e) => { setSeed(e.target.value); }} style={inputStyle} />

      <button
        type="button"
        onClick={runGenerate}
        style={{
          marginTop: '1rem',
          padding: '0.75rem 1.25rem',
          borderRadius: 10,
          border: 'none',
          background: '#7aa2ff',
          color: '#0d1117',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Generate
      </button>

      {value ? (
        <section style={panelStyle}>
          <Row label="Value" value={value} />
          {valid !== null ? <Row label="Re-validate" value={valid ? 'pass' : 'fail'} /> : null}
        </section>
      ) : null}
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
