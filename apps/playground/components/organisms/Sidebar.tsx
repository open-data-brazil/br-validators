'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Badge } from '@/components/atoms/Badge';
import { ThemeToggle } from '@/components/atoms/ThemeToggle';
import { ROUTES } from '@/lib/nav';
import styles from './organisms.module.css';

export function Sidebar({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <aside className={`${styles.sidebar} ${className ?? ''}`.trim()}>
      <header>
        <h1 className={styles.brandTitle}>BR Validators Playground</h1>
        <p className={styles.brandSubtitle}>
          100% open-source · client-side validation · official algorithms
        </p>
        <Badge variant="success">Open source</Badge>
      </header>

      <nav className={styles.nav}>
        {ROUTES.map((route) => {
          const href = `/${route.slug}`;
          const isActive = pathname === href;
          return (
            <Link
              key={route.slug}
              href={href}
              className={`${styles.navLink} ${isActive ? styles.active : ''}`.trim()}
              onClick={onNavigate}
            >
              <span className={styles.navLabel}>{route.label}</span>
              <span className={styles.navDescription}>{route.description}</span>
            </Link>
          );
        })}
      </nav>

      <ThemeToggle />
    </aside>
  );
}
