'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { ExpandIcon, MinimizeIcon } from '@/components/atoms/icons';
import { CLI_WELCOME_LINES, executeTerminalLine } from '@/lib/cli/execute-line';
import { useI18n } from '@/components/providers/I18nProvider';
import styles from './cli-terminal.module.css';

type TerminalLine = {
  id: string;
  kind: 'system' | 'input' | 'output' | 'error';
  text: string;
};

const LINE_CLASS: Record<TerminalLine['kind'], string> = {
  system: styles.lineSystem,
  input: styles.lineInput,
  output: styles.lineOutput,
  error: styles.lineError,
};

type Props = {
  onClose: () => void;
};

let lineCounter = 0;

function nextLineId(): string {
  lineCounter += 1;
  return `line-${String(lineCounter)}`;
}

export function CliTerminal({ onClose }: Props) {
  const { messages } = useI18n();
  const cli = messages.cli;
  const [lines, setLines] = useState<TerminalLine[]>(() =>
    CLI_WELCOME_LINES.map((text) => ({
      id: nextLineId(),
      kind: 'system',
      text,
    })),
  );
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (fullscreen) {
          setFullscreen(false);
          return;
        }
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [fullscreen, onClose]);

  useEffect(() => {
    const node = scrollRef.current;
    if (node) {
      node.scrollTop = node.scrollHeight;
    }
  }, [lines]);

  const appendLines = (entries: TerminalLine[]) => {
    setLines((previous) => [...previous, ...entries]);
  };

  const runCommand = (command: string) => {
    const trimmed = command.trim();
    if (!trimmed) {
      return;
    }

    appendLines([{ id: nextLineId(), kind: 'input', text: `${cli.prompt}${command}` }]);

    if (trimmed.toLowerCase() === 'help') {
      appendLines([
        {
          id: nextLineId(),
          kind: 'system',
          text: cli.helpHint,
        },
      ]);
      return;
    }

    const result = executeTerminalLine(command);

    if (result.type === 'clear') {
      setLines([]);
      return;
    }

    if (result.type === 'close') {
      onClose();
      return;
    }

    if (result.text) {
      appendLines([
        {
          id: nextLineId(),
          kind: result.isError ? 'error' : 'output',
          text: result.text,
        },
      ]);
    }
  };

  const submit = () => {
    const command = input;
    setInput('');
    setHistoryIndex(null);

    if (command.trim()) {
      setHistory((previous) => [...previous, command]);
    }

    runCommand(command);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      submit();
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (history.length === 0) {
        return;
      }
      const index = historyIndex === null ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(index);
      setInput(history[index] ?? '');
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (historyIndex === null) {
        return;
      }
      const nextIndex = historyIndex + 1;
      if (nextIndex >= history.length) {
        setHistoryIndex(null);
        setInput('');
        return;
      }
      setHistoryIndex(nextIndex);
      setInput(history[nextIndex] ?? '');
    }
  };

  const shellClass = `${styles.shell} ${fullscreen ? styles.shellFullscreen : ''}`.trim();
  const overlayClass = `${styles.overlay} ${fullscreen ? styles.overlayFullscreen : ''}`.trim();

  return (
    <div className={overlayClass} role="dialog" aria-modal="true" aria-label={cli.title}>
      <div className={shellClass}>
        <header className={styles.header}>
          <div className={styles.headerTitle}>{cli.title}</div>
          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.headerButton}
              aria-label={fullscreen ? cli.minimize : cli.expand}
              title={fullscreen ? cli.minimize : cli.expand}
              onClick={() => {
                setFullscreen((previous) => !previous);
              }}
            >
              {fullscreen ? <MinimizeIcon /> : <ExpandIcon />}
            </button>
            <button type="button" className={styles.headerButton} onClick={onClose}>
              {cli.close}
            </button>
          </div>
        </header>

        <div ref={scrollRef} className={styles.outputPane}>
          {lines.map((line) => (
            <div key={line.id} className={`${styles.line} ${LINE_CLASS[line.kind]}`.trim()}>
              {line.text}
            </div>
          ))}
        </div>

        <form
          className={styles.inputRow}
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <label className={styles.prompt} htmlFor="cli-terminal-input">
            {cli.prompt}
          </label>
          <input
            ref={inputRef}
            id="cli-terminal-input"
            className={styles.input}
            value={input}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            aria-label={cli.inputLabel}
            onChange={(event) => {
              setInput(event.target.value);
            }}
            onKeyDown={onKeyDown}
          />
        </form>
      </div>
    </div>
  );
}
