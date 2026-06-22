'use client';

import { useTheme } from '@/hooks/useTheme';
import { Button } from './Button';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <Button
      variant="icon"
      size="sm"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title="Toggle theme"
      type="button"
    >
      {theme === 'dark' ? '☀' : '☾'}
    </Button>
  );
}
