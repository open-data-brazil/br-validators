import type { Metadata, Viewport } from 'next';
import { AppProviders } from '@/components/providers/AppProviders';
import { SidebarLayout } from '@/components/templates/SidebarLayout';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'BR Validators Playground',
  description: '100% open-source · client-side validation · official algorithms',
};

export const viewport: Viewport = {
  themeColor: '#f7f7f5',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const bootScript = `
    (function () {
      try {
        var storedTheme = localStorage.getItem('theme');
        var theme = storedTheme === 'light' || storedTheme === 'dark'
          ? storedTheme
          : 'light';
        document.documentElement.dataset.theme = theme;

        var storedLocale = localStorage.getItem('locale');
        var locale = storedLocale === 'en' || storedLocale === 'pt' ? storedLocale : 'pt';
        document.documentElement.dataset.locale = locale;
        document.documentElement.lang = locale === 'en' ? 'en' : 'pt-BR';
      } catch (_) {}
    })();
  `;

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
        />
      </head>
      <body>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        <AppProviders>
          <SidebarLayout>{children}</SidebarLayout>
        </AppProviders>
      </body>
    </html>
  );
}
