'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePlaygroundPath } from '@/components/providers/PlaygroundRouterProvider';
import { useI18n } from '@/components/providers/I18nProvider';
import { SidebarNavLink } from '@/components/organisms/SidebarNavLink';
import {
  CarIcon,
  ChevronRightIcon,
  CodeIcon,
  DocumentIcon,
  ExternalLinkIcon,
  FormatIcon,
  GlobeIcon,
  HashIcon,
  IdCardIcon,
  MagicIcon,
  MapIcon,
  PhoneIcon,
  SearchIcon,
  ShieldIcon,
  WalletIcon,
} from '@/components/atoms/icons';
import { DOCUMENT_ROUTES, PLATFORM_ROUTES, REFERENCE_DATA_ROUTES } from '@/lib/nav';
import type { DocumentSlug, PlatformSlug, ReferenceDataSlug } from '@/lib/nav';
import styles from './organisms.module.css';

type SidebarGroup = {
  id: string;
  title: string;
  slugs: readonly string[];
};

const DOCUMENT_GROUP_SLUGS = [
  'cpf',
  'cnpj',
  'rg',
  'cnh',
  'titulo-eleitor',
  'pis',
  'renavam',
  'cnis',
  'processo-judicial',
  'nfe-chave',
  'ie',
  'ie-produtor-rural',
] as const;

const CONTACT_GROUP_SLUGS = ['cep', 'telefone', 'placa'] as const;

const FINANCIAL_GROUP_SLUGS = [
  'pix',
  'boleto',
  'boleto-arrecadacao',
  'brcode',
  'cartao',
  'ean',
] as const;

const ROUTE_ICONS: Record<string, typeof DocumentIcon> = {
  cpf: IdCardIcon,
  cnpj: IdCardIcon,
  rg: IdCardIcon,
  cnh: IdCardIcon,
  'titulo-eleitor': DocumentIcon,
  pis: HashIcon,
  renavam: HashIcon,
  cnis: DocumentIcon,
  'processo-judicial': DocumentIcon,
  'nfe-chave': HashIcon,
  ie: DocumentIcon,
  'ie-produtor-rural': DocumentIcon,
  cep: MapIcon,
  telefone: PhoneIcon,
  placa: CarIcon,
  pix: WalletIcon,
  boleto: DocumentIcon,
  'boleto-arrecadacao': DocumentIcon,
  brcode: CodeIcon,
  cartao: WalletIcon,
  ean: HashIcon,
  detect: SearchIcon,
  sanitize: MagicIcon,
  compare: FormatIcon,
  batch: DocumentIcon,
  diff: CodeIcon,
  generate: MagicIcon,
  'official-sources': ExternalLinkIcon,
  'data/ibge': MapIcon,
  'data/calendar': DocumentIcon,
  'data/payroll': WalletIcon,
  'data/finance': WalletIcon,
  'data/bancos': WalletIcon,
  'data/fiscal': DocumentIcon,
  'data/trade': GlobeIcon,
  'data/logistics': CarIcon,
  'data/explorer': SearchIcon,
  'data/catalog': DocumentIcon,
};

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR');
}

export function Sidebar({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  const pathname = usePlaygroundPath();
  const router = useRouter();
  const { messages } = useI18n();
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const hrefs = [
      '/',
      ...DOCUMENT_ROUTES.map((route) => `/${route.slug}`),
      ...PLATFORM_ROUTES.map((route) => `/${route.slug}`),
      ...REFERENCE_DATA_ROUTES.map((route) => `/${route.slug}`),
      '/cartao-credito',
    ];
    for (const href of hrefs) {
      router.prefetch(href);
    }
  }, [router]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const groups = useMemo<SidebarGroup[]>(
    () => [
      { id: 'documents', title: messages.nav.documents, slugs: DOCUMENT_GROUP_SLUGS },
      { id: 'contact', title: messages.nav.contact, slugs: CONTACT_GROUP_SLUGS },
      { id: 'financial', title: messages.nav.financial, slugs: FINANCIAL_GROUP_SLUGS },
      {
        id: 'platform',
        title: messages.nav.platform,
        slugs: PLATFORM_ROUTES.map((route) => route.slug),
      },
      {
        id: 'reference',
        title: messages.nav.referenceData,
        slugs: REFERENCE_DATA_ROUTES.map((route) => route.slug),
      },
    ],
    [messages],
  );

  const routeCopy = (slug: string) => {
    if (slug.startsWith('data/')) {
      return messages.referenceDataRoutes[slug as ReferenceDataSlug];
    }
    return messages.routes[slug as DocumentSlug | PlatformSlug];
  };

  const filteredGroups = useMemo(() => {
    const needle = normalize(query.trim());
    if (!needle) {
      return groups;
    }
    return groups
      .map((group) => ({
        ...group,
        slugs: group.slugs.filter((slug) => {
          const copy = routeCopy(slug);
          return (
            normalize(copy.label).includes(needle) ||
            normalize(copy.description).includes(needle) ||
            normalize(slug).includes(needle)
          );
        }),
      }))
      .filter((group) => group.slugs.length > 0);
  }, [groups, query, messages]);

  return (
    <aside className={`${styles.sidebar} ${className ?? ''}`.trim()}>
      <div className={styles.sidebarSearch}>
        <SearchIcon className={styles.sidebarSearchIcon} />
        <input
          ref={searchRef}
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
          }}
          placeholder={messages.nav.searchPlaceholder}
          aria-label={messages.nav.searchPlaceholder}
          className={styles.sidebarSearchInput}
        />
        <span className={styles.sidebarShortcut} aria-hidden="true">
          ⌘ K
        </span>
      </div>

      <div className={styles.navGroups}>
        {filteredGroups.map((group) => (
          <section key={group.id} className={styles.navSection}>
            <h2 className={styles.navSectionTitle}>{group.title}</h2>
            <div className={styles.nav}>
              {group.slugs.map((slug) => {
                const href = `/${slug}`;
                const isActive = pathname === href;
                const copy = routeCopy(slug);
                const Icon = ROUTE_ICONS[slug] ?? DocumentIcon;
                return (
                  <SidebarNavLink
                    key={slug}
                    href={href}
                    isActive={isActive}
                    title={copy.description}
                    onNavigate={onNavigate}
                  >
                    <Icon className={styles.navIcon} />
                    <span className={styles.navLabel}>{copy.label}</span>
                    {isActive ? (
                      <ChevronRightIcon className={styles.navChevron} />
                    ) : null}
                  </SidebarNavLink>
                );
              })}
            </div>
          </section>
        ))}

        {filteredGroups.length === 0 ? (
          <p className={styles.navEmpty}>{messages.nav.noResults}</p>
        ) : null}

        <Link href="/" className={styles.viewMore} onClick={onNavigate}>
          {messages.nav.viewAll}
          <ChevronRightIcon />
        </Link>
      </div>

      <div className={styles.navFooter}>
        <div className={styles.navFooterHead}>
          <ShieldIcon className={styles.navFooterIcon} />
          {messages.nav.privacyTitle}
        </div>
        <p>{messages.nav.privacyText}</p>
        <a
          href="https://github.com/open-data-brazil/br-validators"
          target="_blank"
          rel="noopener noreferrer"
        >
          {messages.nav.privacyLink} ↗
        </a>
      </div>
    </aside>
  );
}
