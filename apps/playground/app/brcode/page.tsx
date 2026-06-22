'use client';

import { useMemo, useState } from 'react';
import {
  BRCODE_GOLDEN_STATIC_EVP,
  BRCODE_OFFICIAL_SOURCE_URL,
  parseBrCode,
  validateBrCode,
} from '@br-validators/core';
import { CliCommandHint } from '@/components/molecules/CliCommandHint';
import { DocumentInput } from '@/components/molecules/DocumentInput';
import { OfficialSourceLink } from '@/components/molecules/OfficialSourceLink';
import { ResultRow } from '@/components/molecules/ResultRow';
import { ResultSection } from '@/components/molecules/ResultSection';
import { ValidatorPanel } from '@/components/organisms/ValidatorPanel';

export default function BrCodePlaygroundPage() {
  const [input, setInput] = useState(BRCODE_GOLDEN_STATIC_EVP);

  const parsed = useMemo(() => (input ? parseBrCode(input) : null), [input]);
  const validated = useMemo(() => (input ? validateBrCode(input) : null), [input]);

  const cliCommand = input ? `br-validators brcode parse "${input}" --json` : '';

  return (
    <ValidatorPanel title="BR Code Parser" description="Bacen EMV TLV + CRC16-CCITT">
      <DocumentInput
        id="brcode-input"
        label="Payload"
        value={input}
        onChange={(value) => {
          setInput(value);
        }}
        onGenerate={() => {
          setInput(BRCODE_GOLDEN_STATIC_EVP);
        }}
        multiline
      />

      <ResultSection>
        <ResultRow
          label="Parse"
          value={parsed ? (parsed.ok ? 'ok' : `no — ${parsed.code}`) : '—'}
        />
        <ResultRow
          label="Validate"
          value={validated ? (validated.ok ? 'ok (static key)' : `no — ${validated.code}`) : '—'}
        />
        <ResultRow label="Merchant" value={parsed?.ok ? parsed.merchantName : '—'} />
        <ResultRow label="City" value={parsed?.ok ? parsed.merchantCity : '—'} />
        <ResultRow label="Amount" value={parsed?.ok ? parsed.amount ?? '—' : '—'} />
        <ResultRow label="TXID" value={parsed?.ok ? parsed.txid ?? '—' : '—'} />
        <ResultRow label="PIX key" value={parsed?.ok ? parsed.pixKey ?? parsed.pixInitiationUrl ?? '—' : '—'} />
        <ResultRow label="Key type" value={parsed?.ok ? parsed.pixKeyType ?? 'url' : '—'} />
      </ResultSection>

      <OfficialSourceLink href={BRCODE_OFFICIAL_SOURCE_URL} label="Official source: Bacen — Manual BR Code" />
      <CliCommandHint code={cliCommand} />
    </ValidatorPanel>
  );
}
