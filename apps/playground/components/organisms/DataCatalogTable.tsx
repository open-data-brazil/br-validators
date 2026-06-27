'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { getDataCatalog } from '@br-validators/core/data-catalog';
import { useI18n } from '@/components/providers/I18nProvider';
import { resolveCatalogDocUrl } from '@/lib/reference-data/catalog-docs';
import styles from './organisms.module.css';

const DATA_FRESHNESS_URL =
  'https://github.com/AlexandreZanata/br-validators/blob/main/docs/DATA-FRESHNESS.md';

export function DataCatalogTable() {
  const { messages } = useI18n();
  const copy = messages.referenceData.catalog;
  const rows = useMemo(() => getDataCatalog(), []);

  return (
    <main className={styles.panel}>
      <header>
        <h1 className={styles.title}>{copy.title}</h1>
        <p className={styles.description}>{copy.description}</p>
      </header>

      <div className={styles.officialSourcesPage}>
        <div className={styles.referenceDataCatalogHeader}>
          <span>{copy.idColumn}</span>
          <span>{copy.nameColumn}</span>
          <span>{copy.capturedColumn}</span>
          <span>{copy.sourceColumn}</span>
          <span>{copy.explorerColumn}</span>
        </div>

        {rows.map((row) => (
          <article key={row.id} className={styles.referenceDataCatalogRow}>
            <span>
              <code>{row.id}</code>
            </span>
            <span>{row.nome}</span>
            <span>{row.capturadoEm}</span>
            <span>
              <a
                className={styles.officialSourcesPageLink}
                href={resolveCatalogDocUrl(row.documentacao)}
                target="_blank"
                rel="noreferrer"
              >
                {copy.docsLink}
              </a>
            </span>
            <span>
              <Link
                className={styles.officialSourcesPageLink}
                href={`/data/explorer?dataset=${row.id}`}
              >
                {copy.exploreExportLink}
              </Link>
            </span>
          </article>
        ))}
      </div>

      <p className={styles.description}>
        <a className={styles.officialSourcesPageLink} href={DATA_FRESHNESS_URL} target="_blank" rel="noreferrer">
          {copy.freshnessLink}
        </a>
      </p>
    </main>
  );
}
