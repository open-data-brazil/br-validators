'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  IE_DF_OFFICIAL_SOURCE_URL,
  IE_MT_OFFICIAL_SOURCE_URL,
  IE_SP_GOLDEN,
  IE_SP_OFFICIAL_SOURCE_URL,
  formatInscricaoEstadual,
  stripInscricaoEstadual,
  validateInscricaoEstadual,
  type UfCode,
} from 'br-validators';

const UF_OPTIONS: { code: UfCode; label: string; sample: string; source: string }[] = [
  { code: 'SP', label: 'São Paulo', sample: IE_SP_GOLDEN, source: IE_SP_OFFICIAL_SOURCE_URL },
  { code: 'MT', label: 'Mato Grosso', sample: '00130000019', source: IE_MT_OFFICIAL_SOURCE_URL },
  { code: 'DF', label: 'Distrito Federal', sample: '0730000100109', source: IE_DF_OFFICIAL_SOURCE_URL },
];

export default function IePlaygroundPage() {
  const [uf, setUf] = useState<UfCode>('SP');
  const [input, setInput] = useState(IE_SP_GOLDEN);

  const ufMeta = UF_OPTIONS.find((o) => o.code === uf) ?? UF_OPTIONS[0];

  const stripped = useMemo(() => (input ? stripInscricaoEstadual(input) : ''), [input]);
  const validation = useMemo(
    () => (input ? validateInscricaoEstadual(input, { uf }) : null),
    [input, uf],
  );
  const formatted = useMemo(
    () => (input ? formatInscricaoEstadual(input, { uf }) : null),
    [input, uf],
  );

  const cliCommand = input
    ? `br-validators ie validate ${stripped || '<value>'} --uf ${uf}`
    : '';

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <Link href="/" style={{ color: '#7aa2ff', textDecoration: 'none' }}>
        ← All types
      </Link>
      <h1 style={{ fontSize: '1.75rem', margin: '1rem 0 0.5rem' }}>Inscrição Estadual</h1>
      <p style={{ color: '#9aa5bd', marginBottom: '1.5rem' }}>
        Check digits only · SP, MT, DF (UC-009) — no SEFAZ registration lookup
      </p>

      <label style={{ display: 'block', marginBottom: '0.5rem', color: '#9aa5bd' }}>UF</label>
      <select
        value={uf}
        onChange={(e) => {
          const next = e.target.value as UfCode;
          setUf(next);
          const meta = UF_OPTIONS.find((o) => o.code === next);
          if (meta) setInput(meta.sample);
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
          marginBottom: '1rem',
        }}
      >
        {UF_OPTIONS.map((o) => (
          <option key={o.code} value={o.code}>
            {o.code} — {o.label}
          </option>
        ))}
      </select>

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
                ? `yes (${validation.uf})`
                : `no — ${validation.code}`
              : '—'
          }
        />
        <Row
          label="Format"
          value={
            formatted?.ok
              ? formatted.formatted
              : formatted?.ok === false
                ? formatted.message
                : '—'
          }
        />
      </section>

      <p style={{ marginTop: '1.5rem', fontSize: '0.9rem' }}>
        Official source ({uf}):{' '}
        <a href={ufMeta.source} target="_blank" rel="noreferrer" style={{ color: '#7aa2ff' }}>
          SEFAZ / SINTEGRA
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
