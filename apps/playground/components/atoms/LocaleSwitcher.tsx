'use client';

import { ChevronDownIcon, GlobeIcon } from '@/components/atoms/icons';
import { useI18n } from '@/components/providers/I18nProvider';
import styles from './atoms.module.css';

export function LocaleSwitcher() {
  const { locale, setLocale, messages } = useI18n();
  const nextLocale = locale === 'pt' ? 'en' : 'pt';
  const label = locale === 'pt' ? 'PT-BR' : 'EN';

  return (
    <button
      type="button"
      className={styles.localeSwitcher}
      aria-label={messages.actions.selectLanguage}
      title={messages.actions.selectLanguage}
      onClick={() => {
        setLocale(nextLocale);
      }}
    >
      <GlobeIcon className={styles.localeGlobe} />
      <span>{label}</span>
      <ChevronDownIcon className={styles.localeChevron} />
    </button>
  );
}
