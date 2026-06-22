'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

type CliTerminalContextValue = {
  isOpen: boolean;
  openTerminal: () => void;
  closeTerminal: () => void;
};

const CliTerminalContext = createContext<CliTerminalContextValue | null>(null);

export function CliTerminalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openTerminal = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeTerminal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      isOpen,
      openTerminal,
      closeTerminal,
    }),
    [isOpen, openTerminal, closeTerminal],
  );

  return <CliTerminalContext.Provider value={value}>{children}</CliTerminalContext.Provider>;
}

export function useCliTerminal(): CliTerminalContextValue {
  const context = useContext(CliTerminalContext);
  if (!context) {
    throw new Error('useCliTerminal must be used within CliTerminalProvider');
  }
  return context;
}
