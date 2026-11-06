'use client';

import { useRef, type FocusEvent } from 'react';
import { CheckIcon, CopyIcon } from '@/components/atoms/icons';
import { Input } from '@/components/atoms/Input';
import { useClipboard } from '@/hooks/useClipboard';
import { useI18n } from '@/components/providers/I18nProvider';
import styles from './molecules.module.css';

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'>;

export function CopyableInput(props: Props) {
  const { copied, copy } = useClipboard();
  const { messages } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
    event.target.select();
    props.onFocus?.(event);
  };

  const handleCopy = async () => {
    const value = inputRef.current?.value ?? props.value?.toString() ?? '';
    if (value) {
      await copy(value);
    }
  };

  return (
    <div className={styles.copyableField}>
      <Input
        {...props}
        ref={inputRef}
        onFocus={handleFocus}
        className={styles.copyableFieldControl}
      />
      <button
        type="button"
        className={`${styles.copyableFieldButton}${copied ? ` ${styles.copyableFieldButtonActive}` : ''}`}
        aria-label={copied ? messages.actions.copied : messages.actions.copy}
        title={copied ? messages.actions.copied : messages.actions.copy}
        onClick={() => {
          void handleCopy();
        }}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </button>
    </div>
  );
}
