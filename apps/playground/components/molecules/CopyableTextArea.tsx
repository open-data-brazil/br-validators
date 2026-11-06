'use client';

import { useRef, type FocusEvent } from 'react';
import { CheckIcon, CopyIcon } from '@/components/atoms/icons';
import { TextArea } from '@/components/atoms/TextArea';
import { useClipboard } from '@/hooks/useClipboard';
import { useI18n } from '@/components/providers/I18nProvider';
import styles from './molecules.module.css';

type Props = Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'>;

export function CopyableTextArea(props: Props) {
  const { copied, copy } = useClipboard();
  const { messages } = useI18n();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const handleFocus = (event: FocusEvent<HTMLTextAreaElement>) => {
    event.target.select();
    props.onFocus?.(event);
  };

  const handleCopy = async () => {
    const value = textAreaRef.current?.value ?? props.value?.toString() ?? '';
    if (value) {
      await copy(value);
    }
  };

  return (
    <div className={`${styles.copyableField} ${styles.copyableFieldMultiline}`.trim()}>
      <TextArea
        {...props}
        ref={textAreaRef}
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
