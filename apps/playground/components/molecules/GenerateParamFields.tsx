'use client';

import { IE_SUPPORTED_UFS, type UfCode } from '@br-validators/core';
import { Label } from '@/components/atoms/Label';
import { Select } from '@/components/atoms/Select';
import { useI18n } from '@/components/providers/I18nProvider';
import { UF_LABELS } from '@/lib/uf-labels';
import styles from './molecules.module.css';

type Props = {
  idPrefix: string;
  uf?: UfCode;
  onUfChange?: (uf: UfCode) => void;
  showUf?: boolean;
  ufLabel?: string;
  /** UF codes for the selector; defaults to all IE-supported states. */
  supportedUfs?: readonly UfCode[];
  formats?: readonly string[];
  format?: string;
  onFormatChange?: (format: string) => void;
  formatLabel?: string;
};

export function GenerateParamFields({
  idPrefix,
  uf,
  onUfChange,
  showUf = false,
  ufLabel,
  supportedUfs = IE_SUPPORTED_UFS,
  formats,
  format,
  onFormatChange,
  formatLabel,
}: Props) {
  const { messages } = useI18n();
  const showFormat = formats && formats.length > 0 && onFormatChange;

  if (!showUf && !showFormat) {
    return null;
  }

  return (
    <div className={styles.generateParams}>
      {showUf && uf && onUfChange ? (
        <div className={styles.generateParamField}>
          <Label htmlFor={`${idPrefix}-uf`}>{ufLabel ?? messages.common.uf}</Label>
          <Select
            id={`${idPrefix}-uf`}
            value={uf}
            onChange={(event) => {
              onUfChange(event.target.value as UfCode);
            }}
          >
            {supportedUfs.map((code) => (
              <option key={code} value={code}>
                {code} — {UF_LABELS[code]}
              </option>
            ))}
          </Select>
        </div>
      ) : null}
      {showFormat ? (
        <div className={styles.generateParamField}>
          <Label htmlFor={`${idPrefix}-format`}>{formatLabel ?? messages.generate.format}</Label>
          <Select
            id={`${idPrefix}-format`}
            value={format ?? formats[0]}
            onChange={(event) => {
              onFormatChange(event.target.value);
            }}
          >
            {formats.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </div>
      ) : null}
    </div>
  );
}
