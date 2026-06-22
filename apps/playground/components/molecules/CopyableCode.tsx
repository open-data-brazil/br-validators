'use client';

import { useClipboard } from '@/hooks/useClipboard';
import { Button } from '@/components/atoms/Button';
import { CodeBlock } from '@/components/atoms/CodeBlock';
import styles from './molecules.module.css';

export function CopyableCode({ code, label }: { code: string; label?: string }) {
  const { copied, copy } = useClipboard();
  return (
    <div className={styles.stack}>
      <div className={styles.copyRow}>
        <p className={styles.copyLabel}>{label ?? 'Output'}</p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={async () => {
            await copy(code);
          }}
        >
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
      <CodeBlock code={code} />
    </div>
  );
}
