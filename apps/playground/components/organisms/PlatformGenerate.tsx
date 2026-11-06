'use client';

import { useMemo, useState } from 'react';
import {
  generate,
  validateCpf,
  validateCnpj,
  validateCep,
  validatePlaca,
  validatePisPasep,
  validateRenavam,
  validateCnh,
  validateTelefone,
  validateCartaoCredito,
  validateInscricaoEstadual,
  validateTituloEleitor,
  validatePixKey,
  validateNfeChave,
  validateBrCode,
  validateBoleto,
  validateArrecadacao,
  validateIeSpRural,
  detectCardBrand,
  type GeneratableDocumentType,
  type GeneratableCardBrand,
  type GenerateOptions,
  type UfCode,
} from '@br-validators/core';
import { Label } from '@/components/atoms/Label';
import { Input } from '@/components/atoms/Input';
import { Select } from '@/components/atoms/Select';
import Link from 'next/link';
import { CopyableInput } from '@/components/molecules/CopyableInput';
import { GenerateParamFields } from '@/components/molecules/GenerateParamFields';
import { formatPlacaDisplay } from '@/lib/format-display';
import { CliCommandHint } from '@/components/molecules/CliCommandHint';
import { ResultRow } from '@/components/molecules/ResultRow';
import { ResultSection } from '@/components/molecules/ResultSection';
import { Button } from '@/components/atoms/Button';
import { useI18n } from '@/components/providers/I18nProvider';
import {
  findPlatformGeneratable,
  PLATFORM_GENERATABLE,
  platformGeneratableLabel,
} from '@/lib/platform-generate-types';
import styles from './organisms.module.css';

function confirmValid(type: GeneratableDocumentType, value: string, uf: UfCode): boolean {
  switch (type) {
    case 'cpf':
      return validateCpf(value).ok;
    case 'cnpj':
      return validateCnpj(value).ok;
    case 'cep':
      return validateCep(value).ok;
    case 'placa':
      return validatePlaca(value).ok;
    case 'pis-pasep':
      return validatePisPasep(value).ok;
    case 'renavam':
      return validateRenavam(value).ok;
    case 'cnh':
      return validateCnh(value).ok;
    case 'telefone':
      return validateTelefone(value).ok;
    case 'cartao-credito':
      return validateCartaoCredito(value).ok;
    case 'inscricao-estadual':
      return validateInscricaoEstadual(value, { uf }).ok;
    case 'titulo-eleitor':
      return validateTituloEleitor(value).ok;
    case 'pix':
      return validatePixKey(value).ok;
    case 'nfe-chave':
      return validateNfeChave(value).ok;
    case 'brcode':
      return validateBrCode(value).ok;
    case 'boleto':
      return validateBoleto(value).ok;
    case 'boleto-arrecadacao':
      return validateArrecadacao(value).ok;
    case 'inscricao-estadual-produtor-rural':
      return validateIeSpRural(value).ok;
    default:
      return false;
  }
}

function buildGenerateOptions(
  entry: ReturnType<typeof findPlatformGeneratable>,
  masked: boolean,
  format: string | undefined,
  uf: UfCode,
  seed: number | undefined,
): GenerateOptions {
  const options: GenerateOptions = {
    masked,
    uf: entry?.ufSelector ? uf : undefined,
    seed,
  };

  if (!format || !entry?.formats) {
    return options;
  }

  if (entry.brandSelector) {
    options.brand = format as GeneratableCardBrand;
    return options;
  }

  options.format = format as GenerateOptions['format'];
  return options;
}

function formatOutput(type: GeneratableDocumentType, value: string, masked: boolean): string {
  if (type === 'placa' && masked) {
    return formatPlacaDisplay(value);
  }
  return value;
}

function buildCliCommand(
  type: GeneratableDocumentType,
  entry: ReturnType<typeof findPlatformGeneratable>,
  uf: UfCode,
  format: string | undefined,
  seed: number | undefined,
): string {
  const parts = ['br-validators', 'generate', type, '--json'];
  if (entry?.ufSelector) {
    parts.push('--uf', uf);
  }
  if (format && entry?.brandSelector) {
    parts.push('--brand', format);
  } else if (format && entry?.formats && !entry.brandSelector) {
    parts.push('--format', format);
  }
  if (seed !== undefined) {
    parts.push('--seed', String(seed));
  }
  return parts.join(' ');
}

function parseSeedInput(raw: string): number | undefined {
  const trimmed = raw.trim();
  if (!trimmed) {
    return undefined;
  }
  const parsed = Number(trimmed);
  if (!Number.isInteger(parsed) || parsed < 0) {
    return undefined;
  }
  return parsed;
}

export function PlatformGenerate() {
  const { messages } = useI18n();
  const copy = messages.platform.generate;
  const [type, setType] = useState<GeneratableDocumentType>('cpf');
  const [output, setOutput] = useState('');
  const [uf, setUf] = useState<UfCode>('SP');
  const [format, setFormat] = useState<string | undefined>();
  const [seedInput, setSeedInput] = useState('');
  const seed = parseSeedInput(seedInput);

  const selected = findPlatformGeneratable(type);
  const formats = selected?.formats;
  const showUf = Boolean(selected?.ufSelector);

  const valid = useMemo(
    () => (output ? confirmValid(type, output, uf) : null),
    [type, output, uf],
  );

  const runGenerate = (masked: boolean, nextUf = uf, nextFormat = format) => {
    const entry = findPlatformGeneratable(type);
    let value = generate(type, buildGenerateOptions(entry, masked, nextFormat, nextUf, seed));
    value = formatOutput(type, value, masked);
    setOutput(value);
  };

  const handleTypeChange = (next: GeneratableDocumentType) => {
    setType(next);
    const nextEntry = findPlatformGeneratable(next);
    setFormat(nextEntry?.formats?.[0]);
    setOutput('');
  };

  const handleUfChange = (next: UfCode) => {
    setUf(next);
    if (output && showUf) {
      runGenerate(true, next, format);
    }
  };

  const handleFormatChange = (nextFormat: string) => {
    setFormat(nextFormat);
    if (output) {
      runGenerate(true, uf, nextFormat);
    }
  };

  const cliCommand = buildCliCommand(type, selected, uf, format, seed);

  const brandMatches =
    output && selected?.brandSelector && format
      ? detectCardBrand(output.replace(/\s/g, '')) === format
      : null;

  return (
    <main className={styles.panel}>
      <header>
        <h1 className={styles.title}>{copy.title}</h1>
        <p className={styles.description}>{copy.description}</p>
      </header>

      <div>
        <Label htmlFor="generate-type">{copy.typeLabel}</Label>
        <Select
          id="generate-type"
          value={type}
          onChange={(e) => {
            handleTypeChange(e.target.value as GeneratableDocumentType);
          }}
        >
          {PLATFORM_GENERATABLE.map((item) => (
            <option key={item.value} value={item.value}>
              {platformGeneratableLabel(messages, item)}
            </option>
          ))}
        </Select>
      </div>

      {type === 'cpf' ? (
        <p className={styles.description}>
          {copy.cpfAlphaPending}{' '}
          <Link href="/official-sources">{copy.cpfAlphaLink}</Link>.
        </p>
      ) : null}

      <div>
        <Label htmlFor="generate-seed">{copy.seedLabel}</Label>
        <Input
          id="generate-seed"
          type="number"
          min={0}
          step={1}
          value={seedInput}
          placeholder="42"
          onChange={(event) => {
            setSeedInput(event.target.value);
          }}
        />
        <p className={styles.description}>{copy.seedHint}</p>
      </div>

      <GenerateParamFields
        idPrefix="platform-generate"
        showUf={showUf}
        uf={uf}
        onUfChange={handleUfChange}
        formats={formats}
        format={format ?? formats?.[0]}
        onFormatChange={handleFormatChange}
        formatLabel={selected?.brandSelector ? messages.generate.brand : undefined}
      />

      <div className={styles.generateActions}>
        <Button type="button" variant="secondary" onClick={() => { runGenerate(false); }}>
          {messages.actions.generateValid}
        </Button>
        <Button type="button" variant="primary" onClick={() => { runGenerate(true); }}>
          {messages.actions.generateValidFormatted}
        </Button>
      </div>

      {output ? (
        <ResultSection title={messages.sections.output}>
          <div className={styles.outputField}>
            <Label htmlFor="generate-output">{messages.common.value}</Label>
            <CopyableInput id="generate-output" value={output} readOnly aria-label={messages.common.value} />
          </div>
          <ResultRow label={messages.common.valid} value={valid ? 'yes' : 'no'} />
          {brandMatches !== null ? (
            <ResultRow label="Brand" value={brandMatches ? format ?? '—' : 'mismatch'} />
          ) : null}
        </ResultSection>
      ) : null}

      <CliCommandHint code={cliCommand} />
    </main>
  );
}
