'use client';

import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import styles from './molecules.module.css';

export interface ExportToolbarProps {
  rowCount: number;
  disabled?: boolean;
  copied: boolean;
  downloadLabel: string;
  copyLabel: string;
  copiedLabel: string;
  rowCountLabel: string;
  onDownload: () => void;
  onCopy: () => void;
}

function formatRowCount(template: string, count: number): string {
  return template.replace('{count}', String(count));
}

export function ExportToolbar({
  rowCount,
  disabled = false,
  copied,
  downloadLabel,
  copyLabel,
  copiedLabel,
  rowCountLabel,
  onDownload,
  onCopy,
}: ExportToolbarProps) {
  const exportDisabled = disabled || rowCount === 0;

  return (
    <div className={styles.exportToolbar}>
      <Badge variant="neutral">{formatRowCount(rowCountLabel, rowCount)}</Badge>
      <div className={styles.exportToolbarActions}>
        <Button type="button" disabled={exportDisabled} onClick={onDownload}>
          {downloadLabel}
        </Button>
        <Button type="button" disabled={exportDisabled} onClick={onCopy}>
          {copied ? copiedLabel : copyLabel}
        </Button>
      </div>
    </div>
  );
}
