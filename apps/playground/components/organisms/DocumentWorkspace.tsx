'use client';

import { useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { validatePixKey, type UfCode } from '@br-validators/core';
import { ActionTabs } from '@/components/molecules/ActionTabs';
import { CliCommandHint } from '@/components/molecules/CliCommandHint';
import { DocumentInput } from '@/components/molecules/DocumentInput';
import { FixesList } from '@/components/molecules/FixesList';
import { ResultRow } from '@/components/molecules/ResultRow';
import { ResultSection } from '@/components/molecules/ResultSection';
import { QrCodePanel } from '@/components/organisms/QrCodePanel';
import { useI18n } from '@/components/providers/I18nProvider';
import { CAPABILITIES, enabledTabs, type ActionTab } from '@/lib/capabilities';
import { buildCliCommand, computeDocumentResults } from '@/lib/document-results';
import type { DocumentSlug } from '@/lib/nav';
import {
  generateValidDocument,
  initialWorkspaceInput,
  randomSeed,
  supportsValidGeneration,
} from '@/lib/playground-generate';
import styles from './organisms.module.css';

type Props = {
  slug: DocumentSlug;
  renderAfter?: (ctx: { input: string }) => ReactNode;
};

export function DocumentWorkspace({ slug, renderAfter }: Props) {
  const panelId = useId();
  const { messages } = useI18n();
  const copy = messages.documents[slug];
  const capabilities = CAPABILITIES[slug];
  const tabs = enabledTabs(capabilities);

  const [input, setInput] = useState(() =>
    initialWorkspaceInput(slug, 'SP', capabilities.generateFormats?.[0]),
  );
  const [activeTab, setActiveTab] = useState<ActionTab>(tabs[0] ?? 'validate');
  const [uf, setUf] = useState<UfCode>('SP');
  const [generateFormat, setGenerateFormat] = useState<string | undefined>(
    capabilities.generateFormats?.[0],
  );

  const ufRef = useRef(uf);
  const generateFormatRef = useRef(generateFormat);
  ufRef.current = uf;
  generateFormatRef.current = generateFormat;

  const results = useMemo(
    () => computeDocumentResults(slug, input, uf),
    [slug, input, uf],
  );

  const cliCommand = useMemo(
    () => buildCliCommand(slug, activeTab, input, results?.stripped ?? '', uf),
    [slug, activeTab, input, results?.stripped, uf],
  );

  const pixValidation = slug === 'pix' && input ? validatePixKey(input) : null;

  const resolveFormat = () => generateFormatRef.current ?? capabilities.generateFormats?.[0];

  const runGenerate = (masked: boolean, overrides?: { uf?: UfCode; format?: string }) => {
    const selectedUf = overrides?.uf ?? ufRef.current;
    const selectedFormat = overrides?.format ?? resolveFormat();

    if (!supportsValidGeneration(slug)) {
      return;
    }

    setInput(
      generateValidDocument(slug, {
        masked,
        seed: randomSeed(),
        format: selectedFormat,
        uf: selectedUf,
      }),
    );
  };

  const canGenerate = supportsValidGeneration(slug);

  const handleUfChange = (next: UfCode) => {
    setUf(next);
    ufRef.current = next;
    if ((slug === 'ie' || slug === 'telefone' || slug === 'titulo-eleitor') && canGenerate) {
      runGenerate(true, { uf: next });
    }
  };

  const handleFormatChange = (format: string) => {
    setGenerateFormat(format);
    generateFormatRef.current = format;
    if (canGenerate) {
      runGenerate(true, { format });
    }
  };

  return (
    <main className={styles.panel}>
      <header>
        <h1 className={styles.title}>{copy.title}</h1>
        <p className={styles.description}>{copy.description}</p>
      </header>

      <DocumentInput
        id={`${panelId}-input`}
        label={copy.inputLabel}
        labelHint={'inputLabelHint' in copy ? copy.inputLabelHint : undefined}
        value={input}
        placeholder={'inputPlaceholder' in copy ? copy.inputPlaceholder : undefined}
        multiline={capabilities.multiline}
        onChange={setInput}
        showGenerate={canGenerate}
        onGenerateValid={canGenerate ? () => { runGenerate(false); } : undefined}
        onGenerateValidFormatted={canGenerate ? () => { runGenerate(true); } : undefined}
        showUf={capabilities.ufSelector}
        supportedUfs={capabilities.supportedUfs}
        ufLabel={slug === 'telefone' ? messages.generate.state : undefined}
        formatLabel={slug === 'cartao' ? messages.generate.brand : undefined}
        uf={uf}
        onUfChange={handleUfChange}
        formats={capabilities.generateFormats}
        format={generateFormat}
        onFormatChange={handleFormatChange}
      />

      <ActionTabs
        tabs={tabs}
        activeTab={activeTab}
        panelId={panelId}
        onChange={setActiveTab}
      />

      {activeTab === 'validate' && results ? (
        <ResultSection title={messages.sections.validation}>
          <ResultRow label={results.validationLabel} value={results.validationDetail} />
          {results.extraRows.map((row) => (
            <ResultRow key={row.label} label={row.label} value={row.value} mono={row.mono} />
          ))}
        </ResultSection>
      ) : null}

      {activeTab === 'strip' && results ? (
        <ResultSection title={messages.sections.strip}>
          <ResultRow label="Stripped" value={results.stripped || '—'} mono />
        </ResultSection>
      ) : null}

      {activeTab === 'format' && results ? (
        <ResultSection title={messages.sections.format}>
          <ResultRow label={results.formattedLabel} value={results.formattedValue} mono />
        </ResultSection>
      ) : null}

      {activeTab === 'sanitize' && results?.sanitizeResult ? (
        <ResultSection title={messages.sections.sanitize}>
          <FixesList
            fixes={results.sanitizeResult.ok ? results.sanitizeResult.fixes : []}
            sanitizedValue={results.sanitizeResult.ok ? results.sanitizeResult.value : undefined}
            ok={results.sanitizeResult.ok}
            message={results.sanitizeResult.ok ? undefined : results.sanitizeResult.message}
          />
        </ResultSection>
      ) : null}

      {renderAfter?.({ input })}

      {capabilities.qrCode && !renderAfter && pixValidation?.ok ? (
        <QrCodePanel value={pixValidation.value} />
      ) : null}

      <CliCommandHint code={cliCommand} />
    </main>
  );
}
