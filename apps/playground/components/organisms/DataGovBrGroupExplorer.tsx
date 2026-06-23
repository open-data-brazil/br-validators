'use client';

import { useMemo, useState } from 'react';
import { Label } from '@/components/atoms/Label';
import { Input } from '@/components/atoms/Input';
import { OfficialSourceLink } from '@/components/molecules/OfficialSourceLink';
import { ResultRow } from '@/components/molecules/ResultRow';
import { ResultSection } from '@/components/molecules/ResultSection';
import { useI18n } from '@/components/providers/I18nProvider';
import type { Messages } from '@/lib/i18n/types';
import {
  GOVBR_GROUPS,
  type GovBrGroupId,
  type GovBrModuleDefinition,
  type GovBrModuleId,
} from '@/lib/reference-data/govbr-groups';
import styles from './organisms.module.css';

function formatFieldValue(value: string | number | null): string {
  if (value === null) {
    return '—';
  }
  return String(value);
}

type GroupModuleCopy = {
  label: string;
  fields: Record<string, string>;
};

function getGroupModuleCopy(
  messages: Messages,
  groupId: GovBrGroupId,
  moduleId: GovBrModuleId,
): GroupModuleCopy {
  if (groupId === 'fiscal') {
    return messages.referenceData.fiscal.modules[moduleId as 'naturezaJuridica' | 'nbs' | 'cest'];
  }
  if (groupId === 'trade') {
    return messages.referenceData.trade.modules[moduleId as 'moedas' | 'paisesBacen' | 'incoterms'];
  }
  return messages.referenceData.logistics.modules[moduleId as 'portos' | 'aeroportos'];
}

export function DataGovBrGroupExplorer({ groupId }: { groupId: GovBrGroupId }) {
  const { messages } = useI18n();
  const copy = messages.referenceData[groupId];
  const modules = GOVBR_GROUPS[groupId];
  const [activeModuleId, setActiveModuleId] = useState<GovBrModuleId>(modules[0].id);
  const activeModule = useMemo(
    () => modules.find((module) => module.id === activeModuleId) ?? modules[0],
    [activeModuleId, modules],
  );
  const [lookupInput, setLookupInput] = useState(activeModule.defaultCode);

  const moduleCopy = getGroupModuleCopy(messages, groupId, activeModule.id);
  const result = useMemo(() => activeModule.lookup(lookupInput), [activeModule, lookupInput]);

  function selectModule(module: GovBrModuleDefinition) {
    setActiveModuleId(module.id);
    setLookupInput(module.defaultCode);
  }

  return (
    <main className={styles.panel}>
      <header>
        <h1 className={styles.title}>{copy.title}</h1>
        <p className={styles.description}>{copy.description}</p>
        <p className={styles.description}>
          {copy.capturedAt}: {activeModule.capturadoEm}
          {' · '}
          <OfficialSourceLink href={activeModule.sourceUrl} label={copy.officialSource} />
        </p>
      </header>

      <div className={styles.referenceDataTabs} role="tablist" aria-label={copy.moduleTabLabel}>
        {modules.map((module) => {
          const selected = module.id === activeModule.id;
          return (
            <button
              key={module.id}
              type="button"
              role="tab"
              aria-selected={selected}
              className={`${styles.referenceDataTab} ${selected ? styles.referenceDataTabActive : ''}`.trim()}
              onClick={() => {
                selectModule(module);
              }}
            >
              {getGroupModuleCopy(messages, groupId, module.id).label}
            </button>
          );
        })}
      </div>

      <div>
        <Label htmlFor={`${groupId}-${activeModule.id}-lookup`}>{copy.lookupLabel}</Label>
        <Input
          id={`${groupId}-${activeModule.id}-lookup`}
          value={lookupInput}
          placeholder={copy.lookupPlaceholder}
          onChange={(event) => {
            setLookupInput(event.target.value);
          }}
        />
      </div>

      {result ? (
        <ResultSection title={copy.resultTitle}>
          {activeModule.fieldKeys.map((fieldKey) => (
            <ResultRow
              key={fieldKey}
              label={moduleCopy.fields[fieldKey] ?? fieldKey}
              value={formatFieldValue(result[fieldKey] ?? null)}
            />
          ))}
        </ResultSection>
      ) : lookupInput.trim() ? (
        <p className={styles.description}>{copy.notFound}</p>
      ) : null}
    </main>
  );
}
