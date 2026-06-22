'use client';

import { LocaleSwitcher } from '@/components/atoms/LocaleSwitcher';
import { ThemeToggle } from '@/components/atoms/ThemeToggle';
import { TerminalIcon } from '@/components/atoms/icons';
import { Button } from '@/components/atoms/Button';
import { useCliTerminal } from '@/components/providers/CliTerminalProvider';
import { useI18n } from '@/components/providers/I18nProvider';
import styles from './atoms.module.css';

export function ToolbarActions() {
  const { openTerminal } = useCliTerminal();
  const { messages } = useI18n();

  return (
    <div className={styles.toolbar}>
      <Button
        type="button"
        variant="icon"
        size="sm"
        className={styles.terminalButton}
        aria-label={messages.cli.openTerminal}
        title={messages.cli.openTerminal}
        onClick={openTerminal}
      >
        <TerminalIcon />
      </Button>
      <LocaleSwitcher />
      <ThemeToggle />
    </div>
  );
}
