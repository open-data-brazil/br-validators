'use client';

import { I18nProvider } from '@/components/providers/I18nProvider';
import { PlaygroundRouterProvider } from '@/components/providers/PlaygroundRouterProvider';
import { CliTerminalProvider } from '@/components/providers/CliTerminalProvider';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <PlaygroundRouterProvider>
        <CliTerminalProvider>{children}</CliTerminalProvider>
      </PlaygroundRouterProvider>
    </I18nProvider>
  );
}
