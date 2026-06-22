'use client';

import { useMemo, useState } from 'react';
import {
  PLACA_OFFICIAL_SOURCE_URL,
  convertPlacaToMercosul,
  detectPlacaFormat,
  formatPlaca,
  stripPlaca,
  validatePlaca,
} from '@br-validators/core';
import { CliCommandHint } from '@/components/molecules/CliCommandHint';
import { DocumentInput } from '@/components/molecules/DocumentInput';
import { OfficialSourceLink } from '@/components/molecules/OfficialSourceLink';
import { ResultRow } from '@/components/molecules/ResultRow';
import { ResultSection } from '@/components/molecules/ResultSection';
import { ValidatorPanel } from '@/components/organisms/ValidatorPanel';
import { generatePlaca } from '@/lib/generators';

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

  const cliCommand = input ? `br-validators placa format ${stripped || '<value>'}` : '';

  return (
    <ValidatorPanel title="Placa Validator" description="Legacy + Mercosul · CONTRAN patterns">
      <DocumentInput
        id="placa-input"
        label="Input"
        value={input}
        onChange={(value) => {
          setInput(value);
        }}
        onGenerate={() => {
          setInput(generatePlaca());
        }}
      />

      <ResultSection>
        <ResultRow label="Strip" value={stripped || '—'} />
        <ResultRow label="Format" value={detectedFormat && detectedFormat !== 'unknown' ? detectedFormat : '—'} />
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
        <ResultRow label="Canonical" value={formatted?.ok ? formatted.formatted : formatted?.ok === false ? formatted.message : '—'} />
        <ResultRow
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
      </ResultSection>

      <OfficialSourceLink href={PLACA_OFFICIAL_SOURCE_URL} label="Official source: CONTRAN Resolução 729/2018" />
      <CliCommandHint code={cliCommand} />
    </ValidatorPanel>
  );
}
