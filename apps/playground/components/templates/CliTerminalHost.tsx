'use client';

import dynamic from 'next/dynamic';
import { useCliTerminal } from '@/components/providers/CliTerminalProvider';

const CliTerminal = dynamic(
  () => import('@/components/organisms/CliTerminal').then((mod) => mod.CliTerminal),
  { ssr: false },
);

export function CliTerminalHost() {
  const { isOpen, closeTerminal } = useCliTerminal();

  if (!isOpen) {
    return null;
  }

  return <CliTerminal onClose={closeTerminal} />;
}
