'use client';

import { useMemo, useState } from 'react';
import {
  CNPJ_OFFICIAL_SOURCE_URL,
  formatCnpj,
  stripCnpj,
  validateCnpj,
} from '@br-validators/core';
import { CliCommandHint } from '@/components/molecules/CliCommandHint';
import { DocumentInput } from '@/components/molecules/DocumentInput';
import { OfficialSourceLink } from '@/components/molecules/OfficialSourceLink';
import { ResultRow } from '@/components/molecules/ResultRow';
import { ResultSection } from '@/components/molecules/ResultSection';
import { ValidatorPanel } from '@/components/organisms/ValidatorPanel';
import { generateCnpj } from '@/lib/generators';

export default function CnpjPlaygroundPage() {
  const [input, setInput] = useState('12.ABC.345/01DE-35');

  const stripped = useMemo(() => (input ? stripCnpj(input) : ''), [input]);
  const validation = useMemo(() => (input ? validateCnpj(input) : null), [input]);
  const formatted = useMemo(() => (input ? formatCnpj(input) : null), [input]);

  const cliCommand = input ? `br-validators cnpj format ${stripped || '<value>'}` : '';

  return (
    <ValidatorPanel title="CNPJ Validator" description="Numeric + alphanumeric · RFB modulo 11 (Q14)">
      <DocumentInput
        id="cnpj-input"
        label="Input"
        value={input}
        onChange={(value) => {
          setInput(value);
        }}
        onGenerate={() => {
          setInput(generateCnpj());
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

      <OfficialSourceLink href={CNPJ_OFFICIAL_SOURCE_URL} label="Official source: RFB CNPJ alfanumérico (PDF)" />
      <CliCommandHint code={cliCommand} />
    </ValidatorPanel>
  );
}
