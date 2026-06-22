'use client';

import { useMemo, useState } from 'react';
import {
  PIS_PASEP_OFFICIAL_SOURCE_URL,
  formatPisPasep,
  stripPisPasep,
  validatePisPasep,
} from '@br-validators/core';
import { CliCommandHint } from '@/components/molecules/CliCommandHint';
import { DocumentInput } from '@/components/molecules/DocumentInput';
import { OfficialSourceLink } from '@/components/molecules/OfficialSourceLink';
import { ResultRow } from '@/components/molecules/ResultRow';
import { ResultSection } from '@/components/molecules/ResultSection';
import { ValidatorPanel } from '@/components/organisms/ValidatorPanel';
import { generatePisPasep } from '@/lib/generators';

export default function PisPlaygroundPage() {
  const [input, setInput] = useState('100.27230.88-8');

  const stripped = useMemo(() => (input ? stripPisPasep(input) : ''), [input]);
  const validation = useMemo(() => (input ? validatePisPasep(input) : null), [input]);
  const formatted = useMemo(() => (input ? formatPisPasep(input) : null), [input]);

  const cliCommand = input ? `br-validators pis-pasep format ${stripped || '<value>'}` : '';

  return (
    <ValidatorPanel title="PIS/PASEP Validator" description="Numeric only · modulo 11 (UC-006)">
      <DocumentInput
        id="pis-input"
        label="Input"
        value={input}
        onChange={(value) => {
          setInput(value);
        }}
        onGenerate={() => {
          setInput(generatePisPasep());
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

      <OfficialSourceLink href={PIS_PASEP_OFFICIAL_SOURCE_URL} label="Official source: SIPREV RV_03 (gov.br)" />
      <CliCommandHint code={cliCommand} />
    </ValidatorPanel>
  );
}
