'use client';

import { useMemo, useState } from 'react';
import {
  BOLETO_GOLDEN_LINHA_MASKED,
  BOLETO_LAYOUTS_PORTAL_URL,
  BOLETO_OFFICIAL_SOURCE_URL,
  convertCodigoBarrasToLinhaDigitavel,
  convertLinhaToCodigoBarras,
  detectBoletoInputKind,
  formatBoleto,
  validateBoleto,
} from '@br-validators/core';
import { CliCommandHint } from '@/components/molecules/CliCommandHint';
import { DocumentInput } from '@/components/molecules/DocumentInput';
import { OfficialSourceLink } from '@/components/molecules/OfficialSourceLink';
import { ResultRow } from '@/components/molecules/ResultRow';
import { ResultSection } from '@/components/molecules/ResultSection';
import { ValidatorPanel } from '@/components/organisms/ValidatorPanel';

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
    <ValidatorPanel title="Boleto Validator" description="Linha digitável (47) · código de barras (44)">
      <DocumentInput
        id="boleto-input"
        label="Input"
        value={input}
        onChange={(value) => {
          setInput(value);
        }}
        onGenerate={() => {
          setInput(BOLETO_GOLDEN_LINHA_MASKED);
        }}
      />

      <ResultSection>
        <ResultRow label="Detect" value={detectedKind ?? '—'} />
        <ResultRow
          label="Valid"
          value={
            validation
              ? validation.ok
                ? `yes (${validation.inputKind})`
                : `no — ${validation.code}`
              : '—'
          }
        />
        <ResultRow label="Value" value={validation?.ok ? validation.value : '—'} />
        <ResultRow label="Situação" value={validation?.ok ? validation.situacao : '—'} />
        <ResultRow
          label="Converted"
          value={converted?.ok ? `${converted.inputKind}: ${converted.value}` : '—'}
        />
        <ResultRow label="Format" value={formatted?.ok ? formatted.formatted : formatted?.ok === false ? formatted.message : '—'} />
      </ResultSection>

      <OfficialSourceLink href={BOLETO_OFFICIAL_SOURCE_URL} label="Official source: Convenção da Cobrança" />
      <OfficialSourceLink href={BOLETO_LAYOUTS_PORTAL_URL} label="Official source: FEBRABAN Layouts" />
      <CliCommandHint code={cliCommand} />
    </ValidatorPanel>
  );
}
