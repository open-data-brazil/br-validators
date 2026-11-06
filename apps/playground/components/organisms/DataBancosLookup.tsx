'use client';

import { useMemo, useState } from 'react';
import { BANCOS_DATA_VERSION, getAllBancos } from '@br-validators/core/bancos';
import { Label } from '@/components/atoms/Label';
import { Input } from '@/components/atoms/Input';
import { ExportToolbar } from '@/components/molecules/ExportToolbar';
import { OfficialSourceLink } from '@/components/molecules/OfficialSourceLink';
import { ResultRow } from '@/components/molecules/ResultRow';
import { ResultSection } from '@/components/molecules/ResultSection';
import { useI18n } from '@/components/providers/I18nProvider';
import { useClipboard } from '@/hooks/useClipboard';
import { pickRowFields } from '@/lib/reference-data/dataset-adapter';
import { filterBancosByQuery, resolveBancoFromInput } from '@/lib/reference-data/bancos-lookup';
import { PREVIEW_ROW_CAP } from '@/lib/reference-data/export-limits';
import { getDatasetAdapter } from '@/lib/reference-data/dataset-registry';
import { exportNormalizedRows } from '@/lib/reference-data/run-full-export';
import { formatTxtSection } from '@/lib/reference-data/txt-export';
import styles from './organisms.module.css';

export function DataBancosLookup() {
  const { messages } = useI18n();
  const copy = messages.referenceData.bancos;
  const exportCopy = messages.referenceData.explorer;
  const { copied, copy: copyToClipboard } = useClipboard();
  const [lookupInput, setLookupInput] = useState('001');
  const [listQuery, setListQuery] = useState('');
  const [showList, setShowList] = useState(true);

  const banco = useMemo(() => resolveBancoFromInput(lookupInput), [lookupInput]);
  const filteredBancos = useMemo(
    () => filterBancosByQuery(getAllBancos(), listQuery),
    [listQuery],
  );
  const listSample = useMemo(
    () => filteredBancos.slice(0, PREVIEW_ROW_CAP),
    [filteredBancos],
  );

  const bancosAdapter = useMemo(() => getDatasetAdapter('bancos'), []);
  const exportRows = useMemo(
    () =>
      listSample.map((row) =>
        pickRowFields(row, ['codigo', 'ispb', 'nome', 'nomeReduzido', 'participaCompe']),
      ),
    [listSample],
  );

  const exportListTxt = useMemo(() => {
    if (bancosAdapter === undefined || exportRows.length === 0) {
      return '';
    }
    return formatTxtSection(bancosAdapter, exportRows, {
      mode: 'search-results',
      query: listQuery.length > 0 ? listQuery : undefined,
    });
  }, [bancosAdapter, exportRows, listQuery]);

  const sourceUrl = BANCOS_DATA_VERSION.endpoints[0] ?? BANCOS_DATA_VERSION.fonte;

  return (
    <main className={styles.panel}>
      <header>
        <h1 className={styles.title}>{copy.title}</h1>
        <p className={styles.description}>{copy.description}</p>
        <p className={styles.description}>
          {copy.capturedAt}: {BANCOS_DATA_VERSION.capturadoEm}
          {' · '}
          <OfficialSourceLink href={sourceUrl} label={copy.officialSource} />
        </p>
      </header>

      <div>
        <Label htmlFor="bancos-lookup">{copy.lookupLabel}</Label>
        <Input
          id="bancos-lookup"
          value={lookupInput}
          inputMode="numeric"
          placeholder={copy.lookupPlaceholder}
          onChange={(event) => {
            setLookupInput(event.target.value);
          }}
        />
      </div>

      {banco ? (
        <ResultSection title={copy.resultTitle}>
          <ResultRow label={copy.codeField} value={banco.codigo} />
          <ResultRow label={copy.ispbField} value={banco.ispb} />
          <ResultRow label={copy.nameField} value={banco.nome} />
          <ResultRow label={copy.shortNameField} value={banco.nomeReduzido} />
        </ResultSection>
      ) : lookupInput.trim() ? (
        <p className={styles.description}>{copy.notFound}</p>
      ) : null}

      <div>
        <button
          type="button"
          className={styles.referenceDataToggle}
          aria-expanded={showList}
          onClick={() => {
            setShowList((previous) => !previous);
          }}
        >
          {showList ? copy.hideList : copy.showList}
        </button>
      </div>

      {showList ? (
        <>
          <div>
            <Label htmlFor="bancos-list-search">{copy.listSearchLabel}</Label>
            <Input
              id="bancos-list-search"
              value={listQuery}
              placeholder={copy.listSearchPlaceholder}
              onChange={(event) => {
                setListQuery(event.target.value);
              }}
            />
            <p className={styles.description}>
              {copy.listCount}: {filteredBancos.length}
            </p>
          </div>
          <ResultSection title={copy.listTitle}>
            <ul className={styles.referenceDataList}>
              {listSample.map((row) => (
                <li key={row.ispb}>
                  <code>{row.codigo}</code> — {row.nome}
                </li>
              ))}
            </ul>
            {filteredBancos.length > PREVIEW_ROW_CAP ? (
              <p className={styles.description}>{copy.listTruncated}</p>
            ) : null}
            {bancosAdapter !== undefined && exportRows.length > 0 ? (
              <ExportToolbar
                rowCount={exportRows.length}
                copied={copied}
                downloadLabel={exportCopy.exportDownload}
                copyLabel={exportCopy.exportCopy}
                copiedLabel={exportCopy.exportCopied}
                rowCountLabel={exportCopy.exportRowCount}
                onDownload={() => {
                  exportNormalizedRows(bancosAdapter, exportRows, {
                    query: listQuery.length > 0 ? listQuery : undefined,
                  });
                }}
                onCopy={() => {
                  if (exportListTxt.length > 0) {
                    void copyToClipboard(exportListTxt);
                  }
                }}
              />
            ) : null}
          </ResultSection>
        </>
      ) : null}
    </main>
  );
}
