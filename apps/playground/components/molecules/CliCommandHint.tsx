import { CopyableCode } from './CopyableCode';

export function CliCommandHint({ code }: { code: string }) {
  if (!code) return null;
  return <CopyableCode code={code} label="CLI equivalent" />;
}
