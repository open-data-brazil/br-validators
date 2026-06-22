'use client';

import { useMemo, useState } from 'react';
import {
  TELEFONE_OFFICIAL_SOURCE_URL,
  formatTelefone,
  stripTelefone,
  validateTelefone,
} from '@br-validators/core';
import { CliCommandHint } from '@/components/molecules/CliCommandHint';
import { DocumentInput } from '@/components/molecules/DocumentInput';
import { OfficialSourceLink } from '@/components/molecules/OfficialSourceLink';
import { ResultRow } from '@/components/molecules/ResultRow';
import { ResultSection } from '@/components/molecules/ResultSection';
import { ValidatorPanel } from '@/components/organisms/ValidatorPanel';
import { generateTelefone } from '@/lib/generators';

export default function TelefonePlaygroundPage() {
  const [input, setInput] = useState('(11) 99999-9999');

  const stripped = useMemo(() => (input ? stripTelefone(input) : ''), [input]);
  const validation = useMemo(() => (input ? validateTelefone(input) : null), [input]);
  const formatted = useMemo(() => (input ? formatTelefone(input) : null), [input]);

  const cliCommand = input ? `br-validators telefone validate "${input}" --json` : '';

  return (
    <ValidatorPanel title="Telefone Validator" description="Anatel DDD · fixo (8-digit) or celular (9-digit)">
      <DocumentInput
        id="telefone-input"
        label="Input"
        value={input}
        onChange={(value) => {
          setInput(value);
        }}
        onGenerate={() => {
          setInput(generateTelefone());
        }}
      />

      <ResultSection>
        <ResultRow label="Strip" value={stripped || '—'} />
        <ResultRow
          label="Valid"
          value={
            validation
              ? validation.ok
                ? `yes (${validation.tipo})`
                : `no — ${validation.code}`
              : '—'
          }
        />
        <ResultRow label="Tipo" value={validation?.ok ? validation.tipo : '—'} />
        <ResultRow label="Format" value={formatted?.ok ? formatted.formatted : formatted?.ok === false ? formatted.message : '—'} />
      </ResultSection>

      <OfficialSourceLink href={TELEFONE_OFFICIAL_SOURCE_URL} label="Official source: Anatel — Plano de Numeração Brasileiro" />
      <CliCommandHint code={cliCommand} />
    </ValidatorPanel>
  );
}
