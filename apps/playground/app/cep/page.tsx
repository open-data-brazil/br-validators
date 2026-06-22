'use client';

import { useMemo, useState } from 'react';
import {
  CEP_OFFICIAL_SOURCE_URL,
  formatCep,
  stripCep,
  validateCep,
} from '@br-validators/core';
import { CliCommandHint } from '@/components/molecules/CliCommandHint';
import { DocumentInput } from '@/components/molecules/DocumentInput';
import { OfficialSourceLink } from '@/components/molecules/OfficialSourceLink';
import { ResultRow } from '@/components/molecules/ResultRow';
import { ResultSection } from '@/components/molecules/ResultSection';
import { ValidatorPanel } from '@/components/organisms/ValidatorPanel';
import { generateCep } from '@/lib/generators';

export default function CepPlaygroundPage() {
  const [input, setInput] = useState('01310-100');

  const stripped = useMemo(() => (input ? stripCep(input) : ''), [input]);
  const validation = useMemo(() => (input ? validateCep(input) : null), [input]);
  const formatted = useMemo(() => (input ? formatCep(input) : null), [input]);

  const cliCommand = input ? `br-validators cep format ${stripped || '<value>'}` : '';

  return (
    <ValidatorPanel title="CEP Validator" description="8-digit format only · no check digit · no registration lookup">
      <DocumentInput
        id="cep-input"
        label="Input"
        value={input}
        onChange={(value) => {
          setInput(value);
        }}
        onGenerate={() => {
          setInput(generateCep());
        }}
      />

      <ResultSection>
        <ResultRow label="Strip" value={stripped || '—'} />
        <ResultRow
          label="Valid"
          value={
            validation
              ? validation.ok
                ? `yes (${validation.format})`
                : `no — ${validation.code}`
              : '—'
          }
        />
        <ResultRow label="Format" value={formatted?.ok ? formatted.formatted : formatted?.ok === false ? formatted.message : '—'} />
      </ResultSection>

      <OfficialSourceLink href={CEP_OFFICIAL_SOURCE_URL} label="Official source: Correios Busca CEP manual" />
      <CliCommandHint code={cliCommand} />
    </ValidatorPanel>
  );
}
