'use client';

import { useMemo, useState } from 'react';
import {
  IRPF_DATA_VERSION,
  IRPF_DEFAULT_ANO,
  IRPF_TABELA_PROGRESSIVA_MENSAL_URL,
  calcularIrpfMensal,
  getIrpfTabelaProgressiva,
} from '@br-validators/core/irpf';
import { Label } from '@/components/atoms/Label';
import { Input } from '@/components/atoms/Input';
import { OfficialSourceLink } from '@/components/molecules/OfficialSourceLink';
import { ResultRow } from '@/components/molecules/ResultRow';
import { ResultSection } from '@/components/molecules/ResultSection';
import { useI18n } from '@/components/providers/I18nProvider';
import styles from './organisms.module.css';

export function DataPayrollExplorer() {
  const { messages } = useI18n();
  const copy = messages.referenceData.payroll;
  const [anoInput, setAnoInput] = useState(String(IRPF_DEFAULT_ANO));
  const [baseInput, setBaseInput] = useState('3000');

  const ano = useMemo(() => {
    const parsed = Number(anoInput.replace(/\D/g, ''));
    if (!Number.isInteger(parsed) || parsed < 1900 || parsed > 2100) {
      return IRPF_DEFAULT_ANO;
    }
    return parsed;
  }, [anoInput]);

  const faixas = useMemo(() => getIrpfTabelaProgressiva(ano), [ano]);

  const baseCalculo = useMemo(() => {
    const normalized = baseInput.trim().replace(',', '.');
    const parsed = Number(normalized);
    if (!Number.isFinite(parsed)) {
      return null;
    }
    return parsed;
  }, [baseInput]);

  const calculo = useMemo(() => {
    if (baseCalculo === null) {
      return undefined;
    }
    return calcularIrpfMensal(baseCalculo, ano);
  }, [ano, baseCalculo]);

  return (
    <main className={styles.panel}>
      <header>
        <h1 className={styles.title}>{copy.title}</h1>
        <p className={styles.description}>{copy.description}</p>
        <p className={styles.description}>
          {copy.capturedAt}: {IRPF_DATA_VERSION.capturadoEm}
          {' · '}
          <OfficialSourceLink href={IRPF_TABELA_PROGRESSIVA_MENSAL_URL} label={copy.officialSource} />
        </p>
      </header>

      <div>
        <Label htmlFor="payroll-year">{copy.yearLabel}</Label>
        <Input
          id="payroll-year"
          value={anoInput}
          inputMode="numeric"
          placeholder={copy.yearPlaceholder}
          onChange={(event) => {
            setAnoInput(event.target.value);
          }}
        />
      </div>

      <div>
        <Label htmlFor="payroll-base">{copy.baseLabel}</Label>
        <Input
          id="payroll-base"
          value={baseInput}
          inputMode="decimal"
          placeholder={copy.basePlaceholder}
          onChange={(event) => {
            setBaseInput(event.target.value);
          }}
        />
      </div>

      <ResultSection title={copy.tableTitle}>
        {faixas === undefined ? (
          <p className={styles.description}>{copy.tableNotFound}</p>
        ) : (
          <ul className={styles.referenceDataList}>
            {faixas.map((faixa) => (
              <li key={faixa.faixa}>
                <code>{faixa.faixa}</code> — {faixa.descricao} — {(faixa.aliquota * 100).toFixed(1)}% — R${' '}
                {faixa.parcelaDeduzir.toFixed(2)}
              </li>
            ))}
          </ul>
        )}
      </ResultSection>

      <ResultSection title={copy.resultTitle}>
        {baseCalculo === null ? (
          <p className={styles.description}>{copy.invalidBase}</p>
        ) : calculo === undefined ? (
          <p className={styles.description}>{copy.invalidBase}</p>
        ) : (
          <>
            <ResultRow label={copy.baseField} value={`R$ ${calculo.baseCalculo.toFixed(2)}`} />
            <ResultRow label={copy.faixaField} value={String(calculo.faixa)} />
            <ResultRow label={copy.aliquotaField} value={`${(calculo.aliquota * 100).toFixed(1)}%`} />
            <ResultRow label={copy.impostoField} value={`R$ ${calculo.imposto.toFixed(2)}`} />
          </>
        )}
      </ResultSection>
    </main>
  );
}
