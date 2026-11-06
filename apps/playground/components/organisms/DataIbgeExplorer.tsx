'use client';

import { useMemo, useState } from 'react';
import {
  getAllEstados,
  getMunicipioPorCodigo,
  IBGE_DATA_VERSION,
  IBGE_OFFICIAL_DOCS_URL,
} from '@br-validators/core/ibge';
import {
  TSE_MUNICIPIOS_DATA_VERSION,
  TSE_MUNICIPIO_IBGE_ZIP_URL,
  TSE_MUNICIPIOS_GOLDEN_CODIGO_TSE_SAO_PAULO,
} from '@br-validators/core/tse-municipios';
import { Label } from '@/components/atoms/Label';
import { Select } from '@/components/atoms/Select';
import { Input } from '@/components/atoms/Input';
import { ExportToolbar } from '@/components/molecules/ExportToolbar';
import { OfficialSourceLink } from '@/components/molecules/OfficialSourceLink';
import { ResultRow } from '@/components/molecules/ResultRow';
import { ResultSection } from '@/components/molecules/ResultSection';
import { useI18n } from '@/components/providers/I18nProvider';
import { useClipboard } from '@/hooks/useClipboard';
import { pickRowFields } from '@/lib/reference-data/dataset-adapter';
import { PREVIEW_ROW_CAP } from '@/lib/reference-data/export-limits';
import { getDatasetAdapter } from '@/lib/reference-data/dataset-registry';
import { filterMunicipiosByName, getMunicipiosForUf } from '@/lib/reference-data/ibge-filter';
import { exportNormalizedRows } from '@/lib/reference-data/run-full-export';
import { formatTxtSection } from '@/lib/reference-data/txt-export';
import { resolveTseCrossRef } from '@/lib/reference-data/tse-lookup';
import { UF_LABELS } from '@/lib/uf-labels';
import type { UfCode } from '@br-validators/core';
import styles from './organisms.module.css';

export function DataIbgeExplorer() {
  const { messages } = useI18n();
  const copy = messages.referenceData.ibge;
  const exportCopy = messages.referenceData.explorer;
  const { copied, copy: copyToClipboard } = useClipboard();
  const [uf, setUf] = useState<UfCode>('SP');
  const [nameQuery, setNameQuery] = useState('');
  const [codeInput, setCodeInput] = useState('3550308');
  const [tseInput, setTseInput] = useState(TSE_MUNICIPIOS_GOLDEN_CODIGO_TSE_SAO_PAULO);

  const estados = useMemo(() => getAllEstados(), []);
  const municipios = useMemo(() => getMunicipiosForUf(uf), [uf]);
  const filteredMunicipios = useMemo(
    () => filterMunicipiosByName(municipios, nameQuery),
    [municipios, nameQuery],
  );

  const codeResult = useMemo(() => {
    const digits = codeInput.replace(/\D/g, '');
    if (digits.length !== 7) {
      return null;
    }
    return getMunicipioPorCodigo(Number(digits)) ?? null;
  }, [codeInput]);

  const tseResult = useMemo(() => resolveTseCrossRef(tseInput), [tseInput]);

  const ibgeAdapter = useMemo(() => getDatasetAdapter('ibge'), []);
  const exportRows = useMemo(
    () =>
      filteredMunicipios.slice(0, PREVIEW_ROW_CAP).map((municipio) =>
        pickRowFields(municipio, ['codigo', 'nome', 'uf'], { tipo: 'municipio', regiao: null }),
      ),
    [filteredMunicipios],
  );

  const exportListTxt = useMemo(() => {
    if (ibgeAdapter === undefined || exportRows.length === 0) {
      return '';
    }
    return formatTxtSection(ibgeAdapter, exportRows, {
      mode: 'search-results',
      uf,
      query: nameQuery.length > 0 ? nameQuery : undefined,
    });
  }, [exportRows, ibgeAdapter, nameQuery, uf]);

  return (
    <main className={styles.panel}>
      <header>
        <h1 className={styles.title}>{copy.title}</h1>
        <p className={styles.description}>{copy.description}</p>
        <p className={styles.description}>
          {copy.capturedAt}: {IBGE_DATA_VERSION.capturadoEm}
          {' · '}
          <OfficialSourceLink href={IBGE_OFFICIAL_DOCS_URL} label={copy.officialSource} />
        </p>
      </header>

      <div>
        <Label htmlFor="ibge-uf">{copy.ufLabel}</Label>
        <Select
          id="ibge-uf"
          value={uf}
          onChange={(event) => {
            setUf(event.target.value as UfCode);
          }}
        >
          {estados.map((estado) => (
            <option key={estado.sigla} value={estado.sigla}>
              {estado.sigla} — {UF_LABELS[estado.sigla as UfCode]}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor="ibge-search">{copy.searchLabel}</Label>
        <Input
          id="ibge-search"
          value={nameQuery}
          placeholder={copy.searchPlaceholder}
          onChange={(event) => {
            setNameQuery(event.target.value);
          }}
        />
        <p className={styles.description}>
          {copy.municipioCount}: {filteredMunicipios.length}
        </p>
      </div>

      <ResultSection title={copy.municipioListTitle}>
        <ul className={styles.referenceDataList}>
          {filteredMunicipios.slice(0, PREVIEW_ROW_CAP).map((municipio) => (
            <li key={municipio.codigo}>
              <code>{municipio.codigo}</code> — {municipio.nome}
            </li>
          ))}
        </ul>
        {filteredMunicipios.length > PREVIEW_ROW_CAP ? (
          <p className={styles.description}>{copy.listTruncated}</p>
        ) : null}
        {ibgeAdapter !== undefined && exportRows.length > 0 ? (
          <ExportToolbar
            rowCount={exportRows.length}
            copied={copied}
            downloadLabel={exportCopy.exportDownload}
            copyLabel={exportCopy.exportCopy}
            copiedLabel={exportCopy.exportCopied}
            rowCountLabel={exportCopy.exportRowCount}
            onDownload={() => {
              exportNormalizedRows(ibgeAdapter, exportRows, { uf, query: nameQuery || undefined });
            }}
            onCopy={() => {
              if (exportListTxt.length > 0) {
                void copyToClipboard(exportListTxt);
              }
            }}
          />
        ) : null}
      </ResultSection>

      <div>
        <Label htmlFor="ibge-code">{copy.codeLabel}</Label>
        <Input
          id="ibge-code"
          value={codeInput}
          inputMode="numeric"
          onChange={(event) => {
            setCodeInput(event.target.value);
          }}
        />
      </div>

      {codeResult ? (
        <ResultSection title={copy.codeResultTitle}>
          <ResultRow label={copy.codeField} value={String(codeResult.codigo)} />
          <ResultRow label={copy.nameField} value={codeResult.nome} />
          <ResultRow label={copy.ufField} value={codeResult.uf} />
        </ResultSection>
      ) : (
        codeInput.replace(/\D/g, '').length === 7 ? (
          <p className={styles.description}>{copy.notFound}</p>
        ) : null
      )}

      <div>
        <Label htmlFor="ibge-tse">{copy.tseLabel}</Label>
        <Input
          id="ibge-tse"
          value={tseInput}
          inputMode="numeric"
          placeholder={copy.tsePlaceholder}
          onChange={(event) => {
            setTseInput(event.target.value);
          }}
        />
        <p className={styles.description}>
          {copy.tseCapturedAt}: {TSE_MUNICIPIOS_DATA_VERSION.capturadoEm}
          {' · '}
          <OfficialSourceLink href={TSE_MUNICIPIO_IBGE_ZIP_URL} label={copy.tseOfficialSource} />
        </p>
      </div>

      {tseResult ? (
        <ResultSection title={copy.tseResultTitle}>
          {tseResult.kind === 'tse-to-ibge' ? (
            <>
              <ResultRow label={copy.tseCodeField} value={tseResult.codigoTse} />
              <ResultRow label={copy.ibgeCodeField} value={String(tseResult.ibgeCodigo)} />
              <ResultRow label={copy.nameField} value={tseResult.municipioNome ?? '—'} />
              <ResultRow label={copy.ufField} value={tseResult.uf ?? '—'} />
            </>
          ) : (
            <>
              <ResultRow label={copy.ibgeCodeField} value={String(tseResult.ibgeCodigo)} />
              <ResultRow label={copy.nameField} value={tseResult.municipioNome ?? '—'} />
              <ResultRow label={copy.ufField} value={tseResult.uf ?? '—'} />
              <ResultRow label={copy.tseCodesField} value={tseResult.codigosTse.join(', ')} />
            </>
          )}
        </ResultSection>
      ) : (
        tseInput.replace(/\D/g, '').length === 5 || tseInput.replace(/\D/g, '').length === 7 ? (
          <p className={styles.description}>{copy.tseNotFound}</p>
        ) : null
      )}
    </main>
  );
}
