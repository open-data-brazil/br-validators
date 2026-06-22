'use client';

import { useMemo, useState } from 'react';
import {
  CARTAO_GOLDEN_VISA_MASKED,
  CARTAO_OFFICIAL_SOURCE_URL,
  detectCardBrand,
  formatCartaoCredito,
  stripCartaoCredito,
  validateCartaoCredito,
} from '@br-validators/core';
import { CliCommandHint } from '@/components/molecules/CliCommandHint';
import { DocumentInput } from '@/components/molecules/DocumentInput';
import { OfficialSourceLink } from '@/components/molecules/OfficialSourceLink';
import { ResultRow } from '@/components/molecules/ResultRow';
import { ResultSection } from '@/components/molecules/ResultSection';
import { ValidatorPanel } from '@/components/organisms/ValidatorPanel';
import { generateCreditCard } from '@/lib/generators';

export default function CartaoPlaygroundPage() {
  const [input, setInput] = useState(CARTAO_GOLDEN_VISA_MASKED);

  const stripped = useMemo(() => (input ? stripCartaoCredito(input) : ''), [input]);
  const validation = useMemo(() => (input ? validateCartaoCredito(input) : null), [input]);
  const brand = useMemo(() => (stripped ? detectCardBrand(stripped) : null), [stripped]);
  const formatted = useMemo(() => (input ? formatCartaoCredito(input) : null), [input]);

  const cliCommand = input ? `br-validators cartao-credito format ${stripped || '<value>'}` : '';

  return (
    <ValidatorPanel
      title="Credit Card Validator"
      description="Luhn checksum (ISO/IEC 7812-1) · best-effort brand detection"
    >
      <DocumentInput
        id="cartao-input"
        label="Input"
        value={input}
        onChange={(value) => {
          setInput(value);
        }}
        onGenerate={() => {
          setInput(generateCreditCard());
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
        <ResultRow label="Brand" value={brand ?? '—'} />
        <ResultRow label="Format" value={formatted?.ok ? formatted.formatted : formatted?.ok === false ? formatted.message : '—'} />
      </ResultSection>

      <OfficialSourceLink href={CARTAO_OFFICIAL_SOURCE_URL} label="Official source: ISO/IEC 7812-1:2017" />
      <CliCommandHint code={cliCommand} />
    </ValidatorPanel>
  );
}
