'use client';

import { useI18n } from '@/components/providers/I18nProvider';
import { ALL_OFFICIAL_SOURCES } from '@/lib/official-sources-catalog';
import styles from './organisms.module.css';

export function OfficialSourcesPage() {
  const { messages } = useI18n();
  const copy = messages.officialSources;

  return (
    <main className={styles.panel}>
      <header>
        <h1 className={styles.title}>{copy.pageTitle}</h1>
        <p className={styles.description}>{copy.pageDescription}</p>
      </header>

      <div className={styles.officialSourcesPage}>
        <div className={styles.officialSourcesTableHeader}>
          <span>{copy.resourceColumn}</span>
          <span>{copy.referenceColumn}</span>
        </div>

        {ALL_OFFICIAL_SOURCES.map((entry) => (
          <article key={entry.title} className={styles.officialSourcesRow}>
            <div className={styles.officialSourcesResource}>
              <h2 className={styles.officialSourcesResourceTitle}>{entry.title}</h2>
              <p className={styles.officialSourcesAgencyInline}>{entry.agency}</p>
            </div>
            <ul className={styles.officialSourcesReferences}>
              {entry.links.map((link) => (
                <li key={link.href}>
                  <a
                    className={styles.officialSourcesPageLink}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </main>
  );
}
