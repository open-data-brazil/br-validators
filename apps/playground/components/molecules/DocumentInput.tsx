'use client';

import { Button } from '@/components/atoms/Button';
import { SparklesIcon } from '@/components/atoms/icons';
import { Label } from '@/components/atoms/Label';
import { CopyableInput } from '@/components/molecules/CopyableInput';
import { CopyableTextArea } from '@/components/molecules/CopyableTextArea';
import { GenerateParamFields } from '@/components/molecules/GenerateParamFields';
import { useI18n } from '@/components/providers/I18nProvider';
import type { UfCode } from '@br-validators/core';
import styles from './molecules.module.css';

type Props = {
  id: string;
  label: string;
  labelHint?: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  onGenerateValid?: () => void;
  onGenerateValidFormatted?: () => void;
  multiline?: boolean;
  showGenerate?: boolean;
  showUf?: boolean;
  uf?: UfCode;
  onUfChange?: (uf: UfCode) => void;
  ufLabel?: string;
  supportedUfs?: readonly UfCode[];
  formats?: readonly string[];
  format?: string;
  onFormatChange?: (format: string) => void;
  formatLabel?: string;
};

export function DocumentInput({
  id,
  label,
  labelHint,
  value,
  placeholder,
  onChange,
  onGenerateValid,
  onGenerateValidFormatted,
  multiline = false,
  showGenerate = true,
  showUf = false,
  ufLabel,
  uf,
  onUfChange,
  supportedUfs,
  formats,
  format,
  onFormatChange,
  formatLabel,
}: Props) {
  const { messages } = useI18n();
  const canGenerate = showGenerate && onGenerateValid && onGenerateValidFormatted;
  const showParams = showUf || (canGenerate && formats && formats.length > 0 && onFormatChange);

  return (
    <div className={styles.fieldCard}>
      <Label htmlFor={id}>
        {label}
        {labelHint ? <span className={styles.labelHint}> ({labelHint})</span> : null}
      </Label>

      {showParams ? (
        <GenerateParamFields
          idPrefix={id}
          showUf={showUf}
          ufLabel={ufLabel}
          uf={uf}
          onUfChange={onUfChange}
          supportedUfs={supportedUfs}
          formats={canGenerate ? formats : undefined}
          format={format}
          onFormatChange={canGenerate ? onFormatChange : undefined}
          formatLabel={formatLabel}
        />
      ) : null}

      <div className={styles.inputRow}>
        {multiline ? (
          <CopyableTextArea
            id={id}
            value={value}
            onChange={(event) => {
              onChange(event.target.value);
            }}
          />
        ) : (
          <CopyableInput
            id={id}
            value={value}
            placeholder={placeholder}
            onChange={(event) => {
              onChange(event.target.value);
            }}
          />
        )}
      </div>

      {canGenerate ? (
        <div className={styles.inputActions}>
          <Button type="button" variant="secondary" icon={<SparklesIcon />} onClick={onGenerateValid}>
            {messages.actions.generateValid}
          </Button>
          <Button type="button" variant="secondary" onClick={onGenerateValidFormatted}>
            {messages.actions.generateValidFormatted}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
