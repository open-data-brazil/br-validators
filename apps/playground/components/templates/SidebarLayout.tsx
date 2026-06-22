'use client';

import { ThemeToggle } from '@/components/atoms/ThemeToggle';
import { Sidebar } from '@/components/organisms/Sidebar';
import styles from './templates.module.css';

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.content}>
        <header className={styles.mobileHeader}>
          <span>BR Validators Playground</span>
          <ThemeToggle />
        </header>
        {children}
      </div>
    </div>
  );
}
