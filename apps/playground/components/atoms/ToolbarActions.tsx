'use client';

import { LocaleSwitcher } from '@/components/atoms/LocaleSwitcher';
import { ThemeToggle } from '@/components/atoms/ThemeToggle';
import { GitHubIcon, TerminalIcon } from '@/components/atoms/icons';
import { Button } from '@/components/atoms/Button';
import { useCliTerminal } from '@/components/providers/CliTerminalProvider';
import { useI18n } from '@/components/providers/I18nProvider';
import styles from './atoms.module.css';

export function ToolbarActions() {
  const { openTerminal } = useCliTerminal();
  const { messages } = useI18n();

  return (
    <div className={styles.toolbar}>
      <a
        href="https://github.com/open-data-brazil/br-validators"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.githubButton}
        aria-label="GitHub — open-data-brazil/br-validators"
        title="GitHub"
      >
        <GitHubIcon />
        <span className={styles.githubText}>GitHub</span>
      </a>
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

