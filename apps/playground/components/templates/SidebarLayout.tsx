'use client';

import { useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { ThemeToggle } from '@/components/atoms/ThemeToggle';
import { Sidebar } from '@/components/organisms/Sidebar';
import styles from './templates.module.css';

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className={styles.shell}>
      <Sidebar className={styles.desktopSidebar} />
      <div className={styles.content}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <Button
              className={styles.menuButton}
              variant="icon"
              size="sm"
              aria-label="Open menu"
              title="Open menu"
              onClick={() => {
                setMenuOpen(true);
              }}
            >
              ☰
            </Button>
            <span>BR Validators Playground</span>
          </div>
          <div className={styles.headerRight}>
            <ThemeToggle />
          </div>
        </header>
        {menuOpen ? (
          <div
            className={styles.backdrop}
            onClick={() => {
              setMenuOpen(false);
            }}
          />
        ) : null}
        <Sidebar
          className={`${styles.mobileSidebar} ${menuOpen ? styles.mobileSidebarOpen : ''}`.trim()}
          onNavigate={() => {
            setMenuOpen(false);
          }}
        />
        {children}
      </div>
    </div>
  );
}
