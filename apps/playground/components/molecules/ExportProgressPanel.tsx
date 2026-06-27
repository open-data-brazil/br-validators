'use client';

import { Button } from '@/components/atoms/Button';
import styles from './molecules.module.css';

export interface ExportProgressPanelProps {
  label: string;
  processedRows: number;
  totalRows: number;
  cancelLabel: string;
  onCancel: () => void;
}

export function ExportProgressPanel({
  label,
  processedRows,
  totalRows,
  cancelLabel,
  onCancel,
}: ExportProgressPanelProps) {
  const ratio = totalRows > 0 ? Math.min(processedRows / totalRows, 1) : 0;
  const percent = Math.round(ratio * 100);

  return (
    <div className={styles.exportProgressPanel} role="status" aria-live="polite">
      <div className={styles.exportProgressLabel}>
        {label} ({processedRows}/{totalRows} — {percent}%)
      </div>
      <div className={styles.exportProgressTrack}>
        <div className={styles.exportProgressFill} style={{ width: `${String(percent)}%` }} />
      </div>
      <Button type="button" onClick={onCancel}>
        {cancelLabel}
      </Button>
    </div>
  );
}
