'use client';

import Link from 'next/link';
import { useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { validatePixKey, type UfCode } from '@br-validators/core';
import {
  CheckIcon,
  ChevronRightIcon,
  CopyIcon,
  ExternalLinkIcon,
  FormatIcon,
  HelpCircleIcon,
  InfoIcon,
  LockIcon,
  MagicIcon,
  ShieldIcon,
  TerminalIcon,
  EraserIcon,
} from '@/components/atoms/icons';
import { CopyableInput } from '@/components/molecules/CopyableInput';
import { CopyableTextArea } from '@/components/molecules/CopyableTextArea';
import { FixesList } from '@/components/molecules/FixesList';
import { GenerateParamFields } from '@/components/molecules/GenerateParamFields';
import { QrCodePanel } from '@/components/organisms/QrCodePanel';
import { useI18n } from '@/components/providers/I18nProvider';
import { useClipboard } from '@/hooks/useClipboard';
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

function CopyValueButton({ value, label }: { value: string; label: string }) {
  const { copied, copy } = useClipboard();
  const { messages } = useI18n();

  return (
    <button
      type="button"
      className={styles.copyButton}
      onClick={() => {
        void copy(value);
      }}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
      {copied ? messages.workspace.copied : label}
    </button>
  );
}

function CopyIconButton({ value }: { value: string }) {
  const { copied, copy } = useClipboard();
  const { messages } = useI18n();

  return (
    <button
      type="button"
      className={styles.codeCopy}
      aria-label={copied ? messages.workspace.copied : messages.workspace.copy}
      title={copied ? messages.workspace.copied : messages.workspace.copy}
      onClick={() => {
        void copy(value);
      }}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </button>
  );
}

export function DocumentWorkspace({ slug, renderAfter }: Props) {
  const panelId = useId();
  const { messages } = useI18n();
  const copy = messages.documents[slug];
  const route = messages.routes[slug];
  const typeLabel = route.label;
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
  const hasInput = input.trim().length > 0;
  const isValid = Boolean(
    results &&
      (results.validationDetail.startsWith('yes') || results.validationDetail.startsWith('ok')),
  );
  const withType = (template: string) => template.replace('{type}', typeLabel);

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

  const showParams = Boolean(
    capabilities.ufSelector ||
      (canGenerate && capabilities.generateFormats && capabilities.generateFormats.length > 0),
  );

  const resultValue =
    activeTab === 'format'
      ? results?.formattedValue
      : activeTab === 'strip'
        ? results?.stripped
        : results?.stripped;

  const resultLabel =
    activeTab === 'format'
      ? messages.workspace.formattedLabel
      : activeTab === 'strip'
        ? messages.workspace.strippedLabel
        : withType(messages.workspace.normalizedLabel);

  return (
    <main className={`${styles.panel} ${styles.workspace}`.trim()}>
      <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
        <Link href="/">{messages.workspace.breadcrumbPlayground}</Link>
        <ChevronRightIcon className={styles.breadcrumbSep} />
        <span>{messages.workspace.breadcrumbDocuments}</span>
        <ChevronRightIcon className={styles.breadcrumbSep} />
        <b>{typeLabel}</b>
      </nav>

      <div className={styles.workspaceHero}>
        <div className={styles.workspaceHeroText}>
          <h1 className={styles.title}>{copy.title}</h1>
          <p className={styles.description}>{copy.description}</p>
        </div>
        <a href="#how-it-works" className={styles.howButton}>
          <HelpCircleIcon />
          {messages.workspace.howItWorks}
        </a>
      </div>

      <div className={styles.workspaceGrid}>
        <div className={styles.workspaceMain}>
          <section className={styles.workspaceCard}>
            <div className={styles.panelHeader}>
              <span className={styles.stepBadge}>01</span>
              <h2>{withType(messages.workspace.inputTitle)}</h2>
            </div>
            <p className={styles.panelSubtitle}>{withType(messages.workspace.inputSubtitle)}</p>

            <label className={styles.fieldLabelRow} htmlFor={`${panelId}-input`}>
              <span>{copy.inputLabel}</span>
              <span className={styles.fieldMeta}>{messages.workspace.inputMeta}</span>
            </label>

            {showParams ? (
              <GenerateParamFields
                idPrefix={panelId}
                showUf={capabilities.ufSelector}
                ufLabel={slug === 'telefone' ? messages.generate.state : undefined}
                uf={uf}
                onUfChange={handleUfChange}
                supportedUfs={capabilities.supportedUfs}
                formats={canGenerate ? capabilities.generateFormats : undefined}
                format={generateFormat}
                onFormatChange={handleFormatChange}
                formatLabel={slug === 'cartao' ? messages.generate.brand : undefined}
              />
            ) : null}

            <div className={styles.entryField}>
              {capabilities.multiline ? (
                <CopyableTextArea
                  id={`${panelId}-input`}
                  value={input}
                  placeholder={'inputPlaceholder' in copy ? copy.inputPlaceholder : undefined}
                  onChange={(event) => {
                    setInput(event.target.value);
                  }}
                />
              ) : (
                <CopyableInput
                  id={`${panelId}-input`}
                  value={input}
                  placeholder={'inputPlaceholder' in copy ? copy.inputPlaceholder : undefined}
                  onChange={(event) => {
                    setInput(event.target.value);
                  }}
                />
              )}
            </div>

            <p className={styles.helperText}>
              <InfoIcon />
              {messages.workspace.inputHelper}
            </p>

            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.primaryAction}
                onClick={() => {
                  setActiveTab('validate');
                }}
              >
                <CheckIcon />
                {withType(messages.workspace.validate)}
              </button>
              {canGenerate ? (
                <button
                  type="button"
                  className={styles.secondaryAction}
                  onClick={() => {
                    runGenerate(true);
                  }}
                >
                  <MagicIcon />
                  {messages.workspace.generateExample}
                </button>
              ) : null}
              <button
                type="button"
                className={styles.textAction}
                onClick={() => {
                  setInput('');
                }}
              >
                {messages.workspace.clear}
              </button>
            </div>

            <p className={styles.privacyLine}>
              <LockIcon />
              {messages.workspace.privacyLine}
            </p>
          </section>

          <section className={`${styles.workspaceCard} ${styles.workspaceCardResult}`.trim()}>
            <div className={styles.resultHeader}>
              <div className={styles.panelHeader}>
                <span className={styles.stepBadge}>02</span>
                <h2>
                  {activeTab === 'sanitize'
                    ? messages.workspace.sanitizeTitle
                    : messages.workspace.resultTitle}
                </h2>
              </div>
              <span
                className={`${styles.resultStatus} ${hasInput ? '' : styles.resultStatusNeutral}`.trim()}
              >
                <i
                  className={`${styles.resultDot} ${hasInput ? '' : styles.resultDotNeutral}`.trim()}
                />
                {hasInput ? messages.workspace.resultStatus : messages.workspace.resultPending}
              </span>
            </div>

            {activeTab === 'sanitize' ? (
              results?.sanitizeResult ? (
                <FixesList
                  fixes={results.sanitizeResult.ok ? results.sanitizeResult.fixes : []}
                  sanitizedValue={
                    results.sanitizeResult.ok ? results.sanitizeResult.value : undefined
                  }
                  ok={results.sanitizeResult.ok}
                  message={results.sanitizeResult.ok ? undefined : results.sanitizeResult.message}
                />
              ) : (
                <p className={styles.disclaimer}>{messages.sanitize.noFixes}</p>
              )
            ) : hasInput && results ? (
              <>
                {activeTab === 'validate' ? (
                  <div className={styles.resultBody}>
                    <div
                      className={`${styles.resultIcon} ${isValid ? '' : styles.resultIconInvalid}`.trim()}
                    >
                      {isValid ? <CheckIcon /> : <InfoIcon />}
                    </div>
                    <div>
                      <h3>
                        {withType(
                          isValid
                            ? messages.workspace.validTitle
                            : messages.workspace.invalidTitle,
                        )}
                      </h3>
                      <p>
                        {isValid
                          ? messages.workspace.validDescription
                          : messages.workspace.invalidDescription}
                      </p>
                    </div>
                  </div>
                ) : null}

                <div className={styles.normalized}>
                  <div>
                    <div className={styles.normalizedKey}>{resultLabel}</div>
                    <div className={styles.normalizedValue}>{resultValue || '—'}</div>
                  </div>
                  <CopyValueButton value={resultValue ?? ''} label={messages.workspace.copy} />
                </div>

                {activeTab === 'validate' ? (
                  <>
                    <div className={styles.extraRows}>
                      <div className={styles.extraRow}>
                        <span className={styles.extraRowLabel}>{results.validationLabel}</span>
                        <span className={styles.extraRowValue}>{results.validationDetail}</span>
                      </div>
                      {results.extraRows.map((row) => (
                        <div key={row.label} className={styles.extraRow}>
                          <span className={styles.extraRowLabel}>{row.label}</span>
                          <span className={styles.extraRowValue}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                    <p className={styles.disclaimer}>{messages.workspace.disclaimer}</p>
                  </>
                ) : null}
              </>
            ) : (
              <p className={styles.disclaimer}>{messages.workspace.resultPending}</p>
            )}
          </section>

          {renderAfter?.({ input })}

          {capabilities.qrCode && !renderAfter && pixValidation?.ok ? (
            <QrCodePanel value={pixValidation.value} />
          ) : null}

          <section className={`${styles.workspaceCard} ${styles.workspaceCardCode}`.trim()}>
            <div className={styles.codeHeader}>
              <span className={styles.codeTitle}>
                <TerminalIcon />
                {messages.workspace.developerTitle}
              </span>
              <a
                href="https://github.com/open-data-brazil/br-validators#readme"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.codeLink}
              >
                {messages.workspace.developerLink}
                <ExternalLinkIcon />
              </a>
            </div>
            <div className={styles.codeBox}>
              <span className={styles.codeText}>
                <span className={styles.codePrefix}>$ </span>
                {cliCommand}
              </span>
              <CopyIconButton value={cliCommand} />
            </div>
          </section>
        </div>

        <aside className={styles.workspaceSide}>
          <section className={`${styles.workspaceCard} ${styles.workspaceCardSide}`.trim()}>
            <h2 className={styles.sideTitle}>
              <MagicIcon />
              {messages.workspace.quickActionsTitle}
            </h2>
            <p className={styles.sideDesc}>{withType(messages.workspace.quickActionsDescription)}</p>

            {canGenerate ? (
              <button
                type="button"
                className={styles.quickAction}
                onClick={() => {
                  runGenerate(false);
                }}
              >
                <span className={styles.quickIcon}>
                  <MagicIcon />
                </span>
                {withType(messages.workspace.generateValid)}
                <ChevronRightIcon className={styles.quickChevron} />
              </button>
            ) : null}

            {canGenerate ? (
              <button
                type="button"
                className={styles.quickAction}
                onClick={() => {
                  runGenerate(true);
                }}
              >
                <span className={styles.quickIcon}>
                  <FormatIcon />
                </span>
                {messages.workspace.generateFormatted}
                <ChevronRightIcon className={styles.quickChevron} />
              </button>
            ) : null}

            {capabilities.format ? (
              <button
                type="button"
                className={styles.quickAction}
                onClick={() => {
                  setActiveTab('format');
                }}
              >
                <span className={styles.quickIcon}>
                  <FormatIcon />
                </span>
                {withType(messages.workspace.format)}
                <ChevronRightIcon className={styles.quickChevron} />
              </button>
            ) : null}

            {capabilities.strip ? (
              <button
                type="button"
                className={styles.quickAction}
                onClick={() => {
                  setActiveTab('strip');
                }}
              >
                <span className={styles.quickIcon}>
                  <EraserIcon />
                </span>
                {messages.workspace.strip}
                <ChevronRightIcon className={styles.quickChevron} />
              </button>
            ) : null}

            {capabilities.sanitize ? (
              <button
                type="button"
                className={styles.quickAction}
                onClick={() => {
                  setActiveTab('sanitize');
                }}
              >
                <span className={styles.quickIcon}>
                  <ShieldIcon />
                </span>
                {messages.workspace.sanitize}
                <ChevronRightIcon className={styles.quickChevron} />
              </button>
            ) : null}
          </section>

          <section
            id="how-it-works"
            className={`${styles.workspaceCard} ${styles.workspaceCardSide}`.trim()}
          >
            <h2 className={styles.sideTitle}>
              <InfoIcon />
              {messages.workspace.howTitle}
            </h2>

            <div className={styles.howRow}>
              <span className={styles.howNum}>1</span>
              <div>
                <b>{messages.workspace.howFormatTitle}</b>
                <p>{messages.workspace.howFormatDescription}</p>
              </div>
            </div>
            <div className={styles.howRow}>
              <span className={styles.howNum}>2</span>
              <div>
                <b>{messages.workspace.howDigitsTitle}</b>
                <p>{messages.workspace.howDigitsDescription}</p>
              </div>
            </div>
            <div className={styles.howRow}>
              <span className={styles.howNum}>3</span>
              <div>
                <b>{messages.workspace.howResultTitle}</b>
                <p>{messages.workspace.howResultDescription}</p>
              </div>
            </div>

            <a
              href="https://github.com/open-data-brazil/br-validators#readme"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.howMore}
            >
              {messages.workspace.howMore}
              <ChevronRightIcon />
            </a>
          </section>

          <section className={styles.noteCard}>
            <div className={styles.noteTitle}>
              <ShieldIcon />
              {messages.workspace.privacyTitle}
            </div>
            <p>{messages.workspace.privacyText}</p>
          </section>
        </aside>
      </div>

      <p className={styles.workspaceFooter}>{messages.workspace.footer}</p>
    </main>
  );
}
