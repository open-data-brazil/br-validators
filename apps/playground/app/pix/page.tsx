'use client';

import { useMemo, useState } from 'react';
import {
  PIX_DICT_API_SOURCE_URL,
  PIX_OFFICIAL_SOURCE_URL,
  detectPixKeyType,
  formatPixKey,
  validatePixKey,
} from '@br-validators/core';
import { CliCommandHint } from '@/components/molecules/CliCommandHint';
import { DocumentInput } from '@/components/molecules/DocumentInput';
import { OfficialSourceLink } from '@/components/molecules/OfficialSourceLink';
import { ResultRow } from '@/components/molecules/ResultRow';
import { ResultSection } from '@/components/molecules/ResultSection';
import { QrCodePanel } from '@/components/organisms/QrCodePanel';
import { ValidatorPanel } from '@/components/organisms/ValidatorPanel';
import { generatePixEvp } from '@/lib/generators';

export default function PixPlaygroundPage() {
  const [input, setInput] = useState('pix@bcb.gov.br');

  const detectedType = useMemo(() => (input ? detectPixKeyType(input) : null), [input]);
  const validation = useMemo(() => (input ? validatePixKey(input) : null), [input]);
  const formatted = useMemo(() => (input ? formatPixKey(input) : null), [input]);

  const cliCommand = input
    ? `br-validators pix format ${input.includes(' ') ? `"${input}"` : input}`
    : '';

  return (
    <ValidatorPanel title="PIX Key Validator" description="CPF · CNPJ · email · phone (+55) · EVP">
      <DocumentInput
        id="pix-input"
        label="Input"
        value={input}
        onChange={(value) => {
          setInput(value);
        }}
        onGenerate={() => {
          setInput(generatePixEvp());
        }}
      />

      <ResultSection>
        <ResultRow label="Detect" value={detectedType ?? '—'} />
        <ResultRow
          label="Valid"
          value={
            validation
              ? validation.ok
                ? `yes (${validation.keyType})`
                : `no — ${validation.code}`
              : '—'
          }
        />
        <ResultRow label="Value" value={validation?.ok ? validation.value : '—'} />
        <ResultRow label="Format" value={formatted?.ok ? formatted.formatted : formatted?.ok === false ? formatted.message : '—'} />
      </ResultSection>

      {validation?.ok ? <QrCodePanel value={validation.value} /> : null}
      <OfficialSourceLink href={PIX_OFFICIAL_SOURCE_URL} label="Official source: Manual Iniciação Pix" />
      <OfficialSourceLink href={PIX_DICT_API_SOURCE_URL} label="Official source: DICT API" />
      <CliCommandHint code={cliCommand} />
    </ValidatorPanel>
  );
}
