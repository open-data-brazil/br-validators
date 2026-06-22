'use client';

import { useMemo, useState } from 'react';
import {
  CPF_OFFICIAL_SOURCE_URL,
  formatCpf,
  stripCpf,
  validateCpf,
} from '@br-validators/core';
import { CliCommandHint } from '@/components/molecules/CliCommandHint';
import { DocumentInput } from '@/components/molecules/DocumentInput';
import { OfficialSourceLink } from '@/components/molecules/OfficialSourceLink';
import { ResultRow } from '@/components/molecules/ResultRow';
import { ResultSection } from '@/components/molecules/ResultSection';
import { ValidatorPanel } from '@/components/organisms/ValidatorPanel';
import { generateCpf } from '@/lib/generators';

export default function CpfPlaygroundPage() {
  const [input, setInput] = useState('123.456.789-09');

  const stripped = useMemo(() => (input ? stripCpf(input) : ''), [input]);
  const validation = useMemo(() => (input ? validateCpf(input) : null), [input]);
  const formatted = useMemo(() => (input ? formatCpf(input) : null), [input]);

  const cliCommand = input ? `br-validators cpf format ${stripped || '<value>'}` : '';

  return (
    <ValidatorPanel title="CPF Validator" description="Numeric only · RFB modulo 11 (UC-001)">
      <DocumentInput
        id="cpf-input"
        label="Input"
        value={input}
        onChange={(value) => {
          setInput(value);
        }}
        onGenerate={() => {
          setInput(generateCpf());
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

      <OfficialSourceLink href={CPF_OFFICIAL_SOURCE_URL} label="Official source: RFB CPF portal" />
      <CliCommandHint code={cliCommand} />
    </ValidatorPanel>
  );
}
