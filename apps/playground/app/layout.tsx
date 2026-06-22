import type { Metadata, Viewport } from 'next';
import { SidebarLayout } from '@/components/templates/SidebarLayout';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'BR Validators Playground',
  description: '100% open-source · client-side validation · official algorithms',
};

export const viewport: Viewport = {
  themeColor: '#0b1020',
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
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <SidebarLayout>{children}</SidebarLayout>
      </body>
    </html>
  );
}
