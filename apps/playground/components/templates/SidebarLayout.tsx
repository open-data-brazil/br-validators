'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { CheckIcon, MenuIcon } from '@/components/atoms/icons';
import { ToolbarActions } from '@/components/atoms/ToolbarActions';
import { useI18n } from '@/components/providers/I18nProvider';
import { usePlaygroundPath } from '@/components/providers/PlaygroundRouterProvider';
import { Sidebar } from '@/components/organisms/Sidebar';
import { PlaygroundContent } from '@/components/templates/PlaygroundContent';
import { CliTerminalHost } from '@/components/templates/CliTerminalHost';
import styles from './templates.module.css';

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { messages } = useI18n();
  const pathname = usePlaygroundPath();
  const isDocs = pathname === '/official-sources';

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const toggleMenu = () => {
    setMenuOpen((previous) => !previous);
  };

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Button
            className={styles.menuButton}
            variant="icon"
            size="sm"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? messages.actions.closeMenu : messages.actions.openMenu}
            title={menuOpen ? messages.actions.closeMenu : messages.actions.openMenu}
            onClick={toggleMenu}
          >
            <MenuIcon />
          </Button>
          <Link href="/" className={styles.brand}>
            <span className={styles.brandIcon} aria-hidden="true">
              <CheckIcon />
            </span>
            <span className={styles.brandText}>
              <strong>{messages.brand.title}</strong>
              <small>{messages.brand.description}</small>
            </span>
          </Link>
        </div>

        <nav className={styles.headerNav} aria-label={messages.nav.primary}>
          <Link
            href="/"
            className={`${styles.navTab} ${!isDocs ? styles.navTabActive : ''}`.trim()}
            aria-current={!isDocs ? 'page' : undefined}
          >
            {messages.nav.playground}
          </Link>
          <Link
            href="/official-sources"
            className={`${styles.navTab} ${isDocs ? styles.navTabActive : ''}`.trim()}
            aria-current={isDocs ? 'page' : undefined}
          >
            {messages.nav.docs}
          </Link>
          <a
            href="https://github.com/open-data-brazil/br-validators#readme"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.navTab}
          >
            {messages.nav.about}
          </a>
        </nav>

        <div className={styles.headerRight}>
          <span className={styles.statusPill}>
            <i className={styles.statusDot} aria-hidden="true" />
            {messages.brand.clientSide}
          </span>
          <ToolbarActions />
        </div>
      </header>

      <div className={styles.body}>
        <Sidebar className={styles.desktopSidebar} />

        {menuOpen ? (
          <>
            <div className={styles.backdrop} onClick={closeMenu} aria-hidden="true" />
            <Sidebar className={styles.mobileSidebar} onNavigate={closeMenu} />
          </>
        ) : null}

        <div className={styles.content}>
          <div className={styles.pageContent}>
            <PlaygroundContent />
            <div hidden aria-hidden="true">
              {children}
            </div>
          </div>
        </div>
      </div>

      <CliTerminalHost />
    </div>
  );
}
