'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Label } from '@/components/atoms/Label';
import { Select } from '@/components/atoms/Select';
import { ExportToolbar } from '@/components/molecules/ExportToolbar';
import { ExportProgressPanel } from '@/components/molecules/ExportProgressPanel';
import { ResultRow } from '@/components/molecules/ResultRow';
import { ResultSection } from '@/components/molecules/ResultSection';
import { useI18n } from '@/components/providers/I18nProvider';
import { useClipboard } from '@/hooks/useClipboard';
import {
  formatDatasetRowPreview,
  isDatasetSearchQueryEligible,
  searchDatasets,
  type DatasetSearchResult,
} from '@/lib/reference-data/dataset-search';
import { getAllDatasetAdapters, getDatasetAdapter } from '@/lib/reference-data/dataset-registry';
import type { FullExportContext } from '@/lib/reference-data/dataset-export-rules';
import { ExportCancelledError } from '@/lib/reference-data/async-export';
import { runFullDatasetExport } from '@/lib/reference-data/run-full-export';
import { PREVIEW_ROW_CAP } from '@/lib/reference-data/export-limits';
import {
  buildExportFilename,
  downloadTextFile,
  formatExportByteSize,
  formatTxtBundle,
  getUtf8ByteLength,
  shouldConfirmLargeExport,
  shouldShowExportSizeHint,
  type TxtSection,
} from '@/lib/reference-data/txt-export';
import styles from './organisms.module.css';

const SEARCH_DEBOUNCE_MS = 300;

function formatResultCount(template: string, count: number): string {
  return template.replace('{count}', String(count)).replace('{cap}', String(PREVIEW_ROW_CAP));
}

function formatExportSize(template: string, byteLength: number): string {
  return template.replace('{size}', formatExportByteSize(byteLength));
}

function toggleSelection(previous: ReadonlySet<string>, datasetId: string, checked: boolean): Set<string> {
  const next = new Set(previous);
  if (checked) {
    next.add(datasetId);
  } else {
    next.delete(datasetId);
  }
  return next;
}

const DATASETS_REQUIRING_UF = new Set(['ibge', 'iss-municipal']);
const DATASETS_REQUIRING_YEAR = new Set(['feriados']);
const DATASETS_REQUIRING_PTAX = new Set(['ptax']);

export function DataExplorerHub() {
  const searchParams = useSearchParams();
  const { messages } = useI18n();
  const copy = messages.referenceData.explorer;
  const { copied, copy: copyToClipboard } = useClipboard();
  const adapters = useMemo(
    () => [...getAllDatasetAdapters()].sort((left, right) => left.nome.localeCompare(right.nome)),
    [],
  );

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [datasetFilter, setDatasetFilter] = useState('all');
  const [results, setResults] = useState<DatasetSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDatasetIds, setSelectedDatasetIds] = useState<ReadonlySet<string>>(() => new Set());
  const [exportingDatasetId, setExportingDatasetId] = useState<string | null>(null);
  const [exportContextByDataset, setExportContextByDataset] = useState<Record<string, FullExportContext>>({});
  const [exportProgress, setExportProgress] = useState<{ processedRows: number; totalRows: number } | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const exportAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const datasetParam = searchParams.get('dataset');
    if (datasetParam !== null && getDatasetAdapter(datasetParam) !== undefined) {
      setDatasetFilter(datasetParam);
    }
  }, [searchParams]);

  const updateExportContext = useCallback(
    (datasetId: string, patch: Partial<FullExportContext>) => {
      setExportContextByDataset((previous) => ({
        ...previous,
        [datasetId]: { ...previous[datasetId], ...patch },
      }));
    },
    [],
  );

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedQuery(query);
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      clearTimeout(handle);
    };
  }, [query]);

  useEffect(() => {
    if (!isDatasetSearchQueryEligible(debouncedQuery)) {
      setResults([]);
      setLoading(false);
      setSelectedDatasetIds(new Set());
      return;
    }

    let cancelled = false;
    setLoading(true);

    void searchDatasets(debouncedQuery, {
      datasetId: datasetFilter === 'all' ? undefined : datasetFilter,
    }).then((hits) => {
      if (cancelled) {
        return;
      }
      setResults(hits);
      setSelectedDatasetIds(new Set(hits.map((hit) => hit.datasetId)));
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, datasetFilter]);

  const totalRows = results.reduce((sum, group) => sum + group.rows.length, 0);
  const queryTooShort =
    debouncedQuery.trim().length > 0 && !isDatasetSearchQueryEligible(debouncedQuery);

  const selectedResults = useMemo(
    () => results.filter((group) => selectedDatasetIds.has(group.datasetId)),
    [results, selectedDatasetIds],
  );

  const selectedRowCount = selectedResults.reduce((sum, group) => sum + group.rows.length, 0);

  const buildSearchSections = useCallback(
    (groups: readonly DatasetSearchResult[]): TxtSection[] => {
      return groups.flatMap((group) => {
        const adapter = getDatasetAdapter(group.datasetId);
        if (adapter === undefined) {
          return [];
        }
        return [
          {
            adapter,
            rows: group.rows,
            meta: {
              mode: groups.length > 1 ? 'multi-dataset' : 'search-results',
              query: debouncedQuery,
            },
          },
        ];
      });
    },
    [debouncedQuery],
  );

  const searchExportByteLength = useMemo(() => {
    const target = selectedResults.length > 0 ? selectedResults : results;
    if (target.length === 0) {
      return 0;
    }
    const sections = buildSearchSections(target);
    return getUtf8ByteLength(formatTxtBundle(sections));
  }, [buildSearchSections, results, selectedResults]);

  const searchExportSizeHint = shouldShowExportSizeHint(searchExportByteLength)
    ? formatExportSize(copy.exportSizeHint, searchExportByteLength)
    : undefined;

  const confirmLargeExport = useCallback(
    (rowCount: number): boolean => {
      if (!shouldConfirmLargeExport(rowCount)) {
        return true;
      }
      return window.confirm(formatResultCount(copy.exportConfirmLarge, rowCount));
    },
    [copy.exportConfirmLarge],
  );

  const exportSearchBundle = useCallback(
    (groups: readonly DatasetSearchResult[]) => {
      const rowCount = groups.reduce((sum, group) => sum + group.rows.length, 0);
      if (rowCount === 0 || !confirmLargeExport(rowCount)) {
        return null;
      }

      const sections = buildSearchSections(groups);
      const content = formatTxtBundle(sections);
      const mode = groups.length > 1 ? 'multi-dataset' : 'search-results';
      const datasetKey =
        groups.length === 1 ? (groups[0]?.datasetId ?? 'search') : groups.map((g) => g.datasetId).join('-');
      const filename = buildExportFilename(datasetKey, mode);
      return { content, filename };
    },
    [buildSearchSections, confirmLargeExport],
  );

  const handleDownloadSearch = useCallback(() => {
    const target = selectedResults.length > 0 ? selectedResults : results;
    const payload = exportSearchBundle(target);
    if (payload === null) {
      return;
    }
    downloadTextFile(payload.filename, payload.content);
  }, [exportSearchBundle, results, selectedResults]);

  const handleCopySearch = useCallback(() => {
    const target = selectedResults.length > 0 ? selectedResults : results;
    const payload = exportSearchBundle(target);
    if (payload === null) {
      return;
    }
    void copyToClipboard(payload.content);
  }, [copyToClipboard, exportSearchBundle, results, selectedResults]);

  const handleExportAllRows = useCallback(
    async (datasetId: string) => {
      const adapter = getDatasetAdapter(datasetId);
      if (adapter === undefined) {
        return;
      }

      setExportError(null);
      setExportingDatasetId(datasetId);
      setExportProgress({ processedRows: 0, totalRows: 0 });
      const controller = new AbortController();
      exportAbortRef.current = controller;

      try {
        const result = await runFullDatasetExport({
          adapter,
          context: exportContextByDataset[datasetId] ?? {},
          confirm: (message) => window.confirm(message),
          onProgress: setExportProgress,
          signal: controller.signal,
        });
        if (!result.ok && result.errorMessage !== undefined) {
          setExportError(result.errorMessage);
        }
      } catch (error) {
        if (!(error instanceof ExportCancelledError)) {
          const message = error instanceof Error ? error.message : 'Export failed';
          setExportError(message);
        }
      } finally {
        exportAbortRef.current = null;
        setExportingDatasetId(null);
        setExportProgress(null);
      }
    },
    [exportContextByDataset],
  );

  const handleCancelExport = useCallback(() => {
    exportAbortRef.current?.abort();
  }, []);

  return (
    <main className={styles.panel}>
      <header>
        <h1 className={styles.title}>{copy.title}</h1>
        <p className={styles.description}>{copy.description}</p>
      </header>

      <div>
        <Label htmlFor="data-explorer-search">{copy.searchLabel}</Label>
        <div className={styles.explorerSearchRow}>
          <Input
            id="data-explorer-search"
            className={styles.explorerSearchInput}
            value={query}
            placeholder={copy.searchPlaceholder}
            aria-busy={loading}
            onChange={(event) => {
              setQuery(event.target.value);
            }}
          />
          {query.length > 0 ? (
            <Button
              type="button"
              onClick={() => {
                setQuery('');
              }}
            >
              {copy.clearButton}
            </Button>
          ) : null}
        </div>
      </div>

      <div>
        <Label htmlFor="data-explorer-dataset">{copy.datasetFilterLabel}</Label>
        <Select
          id="data-explorer-dataset"
          value={datasetFilter}
          onChange={(event) => {
            setDatasetFilter(event.target.value);
          }}
        >
          <option value="all">{copy.allDatasets}</option>
          {adapters.map((adapter) => (
            <option key={adapter.id} value={adapter.id}>
              {adapter.nome}
            </option>
          ))}
        </Select>
      </div>

      {queryTooShort ? <p className={styles.description}>{copy.queryTooShort}</p> : null}

      {loading ? (
        <div className={styles.explorerSkeleton} aria-hidden="true">
          <div className={styles.explorerSkeletonBar} />
          <div className={styles.explorerSkeletonBar} />
          <div className={styles.explorerSkeletonBar} />
        </div>
      ) : null}

      {!loading && isDatasetSearchQueryEligible(debouncedQuery) ? (
        <p className={styles.description}>{formatResultCount(copy.resultCount, totalRows)}</p>
      ) : null}

      {exportProgress !== null ? (
        <ExportProgressPanel
          label={copy.exportProgressLabel}
          processedRows={exportProgress.processedRows}
          totalRows={exportProgress.totalRows}
          cancelLabel={copy.exportCancel}
          onCancel={handleCancelExport}
        />
      ) : null}

      {exportError !== null ? <p className={styles.description}>{exportError}</p> : null}

      {!loading && isDatasetSearchQueryEligible(debouncedQuery) && results.length > 0 ? (
        <ExportToolbar
          rowCount={selectedRowCount > 0 ? selectedRowCount : totalRows}
          copied={copied}
          downloadLabel={copy.exportDownload}
          copyLabel={copy.exportCopy}
          copiedLabel={copy.exportCopied}
          rowCountLabel={copy.exportRowCount}
          sizeHintLabel={searchExportSizeHint}
          onDownload={handleDownloadSearch}
          onCopy={handleCopySearch}
        />
      ) : null}

      {!loading &&
      isDatasetSearchQueryEligible(debouncedQuery) &&
      results.length === 0 &&
      !queryTooShort ? (
        <p className={styles.description}>{copy.emptyState}</p>
      ) : null}

      {results.map((group) => {
        const adapter = adapters.find((entry) => entry.id === group.datasetId);
        const fieldKeys = adapter?.fieldKeys ?? [];
        const isSelected = selectedDatasetIds.has(group.datasetId);
        const isExporting = exportingDatasetId === group.datasetId;
        const exportContext = exportContextByDataset[group.datasetId] ?? {};

        const title = (
          <span className={styles.explorerSectionTitle}>
            <span>{group.nome}</span>
            <Badge variant="neutral">{group.rows.length}</Badge>
            {group.playgroundRoute !== undefined ? (
              <Link className={styles.officialSourcesPageLink} href={group.playgroundRoute}>
                {copy.openExplorer}
              </Link>
            ) : null}
          </span>
        );

        return (
          <ResultSection key={group.datasetId} title={title}>
            <div className={styles.explorerSectionActions}>
              {DATASETS_REQUIRING_UF.has(group.datasetId) ? (
                <div>
                  <Label htmlFor={`export-uf-${group.datasetId}`}>{copy.exportUfLabel}</Label>
                  <Input
                    id={`export-uf-${group.datasetId}`}
                    value={exportContext.uf ?? ''}
                    placeholder="SP"
                    maxLength={2}
                    onChange={(event) => {
                      updateExportContext(group.datasetId, { uf: event.target.value.toUpperCase() });
                    }}
                  />
                </div>
              ) : null}
              {DATASETS_REQUIRING_YEAR.has(group.datasetId) ? (
                <div>
                  <Label htmlFor={`export-year-${group.datasetId}`}>{copy.exportYearLabel}</Label>
                  <Input
                    id={`export-year-${group.datasetId}`}
                    type="number"
                    value={exportContext.year ?? new Date().getFullYear()}
                    onChange={(event) => {
                      updateExportContext(group.datasetId, { year: Number(event.target.value) });
                    }}
                  />
                </div>
              ) : null}
              {DATASETS_REQUIRING_PTAX.has(group.datasetId) ? (
                <>
                  <div>
                    <Label htmlFor={`export-moeda-${group.datasetId}`}>{copy.exportMoedaLabel}</Label>
                    <Input
                      id={`export-moeda-${group.datasetId}`}
                      value={exportContext.moeda ?? 'USD'}
                      onChange={(event) => {
                        updateExportContext(group.datasetId, { moeda: event.target.value.toUpperCase() });
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`export-desde-${group.datasetId}`}>{copy.exportDesdeLabel}</Label>
                    <Input
                      id={`export-desde-${group.datasetId}`}
                      value={exportContext.desde ?? ''}
                      placeholder="2026-01-01"
                      onChange={(event) => {
                        updateExportContext(group.datasetId, { desde: event.target.value });
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`export-ate-${group.datasetId}`}>{copy.exportAteLabel}</Label>
                    <Input
                      id={`export-ate-${group.datasetId}`}
                      value={exportContext.ate ?? ''}
                      placeholder="2026-06-30"
                      onChange={(event) => {
                        updateExportContext(group.datasetId, { ate: event.target.value });
                      }}
                    />
                  </div>
                </>
              ) : null}
              <label className={styles.description}>
                <input
                  type="checkbox"
                  checked={isSelected}
                  aria-label={copy.exportSelectDataset}
                  onChange={(event) => {
                    setSelectedDatasetIds((previous) =>
                      toggleSelection(previous, group.datasetId, event.target.checked),
                    );
                  }}
                />{' '}
                {copy.exportSelectDataset}
              </label>
              <Button
                type="button"
                disabled={isExporting}
                onClick={() => {
                  void handleExportAllRows(group.datasetId);
                }}
              >
                {isExporting ? copy.exportAllLoading : copy.exportAllRows}
              </Button>
            </div>
            {group.error !== undefined ? (
              <p className={styles.description}>{copy.datasetError.replace('{message}', group.error)}</p>
            ) : null}
            {group.rows.map((row, index) => {
              const preview = formatDatasetRowPreview(row, fieldKeys);
              const rowKey = `${group.datasetId}-${preview.primary}-${String(index)}`;
              return (
                <div key={rowKey} className={styles.explorerResultBlock}>
                  <ResultRow label={copy.codeField} value={preview.primary} />
                  {preview.secondary.length > 0 ? (
                    <ResultRow label={copy.descriptionField} value={preview.secondary} mono={false} />
                  ) : null}
                </div>
              );
            })}
          </ResultSection>
        );
      })}
    </main>
  );
}
