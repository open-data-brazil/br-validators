import type { Metadata } from 'next';
import { SidebarLayout } from '@/components/templates/SidebarLayout';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'BR Validators Playground',
  description: '100% open-source · client-side validation · official algorithms',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const themeScript = `
    (function () {
      try {
        var stored = localStorage.getItem('theme');
        var value = stored === 'light' || stored === 'dark'
          ? stored
          : (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
        document.documentElement.dataset.theme = value;
      } catch (_) {}
    })();
  `;

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <SidebarLayout>{children}</SidebarLayout>
      </body>
    </html>
  );
}
