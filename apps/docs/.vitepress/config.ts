import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'BR Validators',
  description: 'TypeScript validators and offline Brazilian government reference data',
  lang: 'en-US',
  lastUpdated: true,
  cleanUrls: true,
  ignoreDeadLinks: true,
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'API', link: '/api/library-api' },
      { text: 'API Reference', link: '/api-reference/' },
      { text: 'Official sources', link: '/reference/official-sources' },
      { text: 'Playground', link: 'https://open-data-brazil.github.io/br-validators/', target: '_blank' },
      { text: 'GitHub', link: 'https://github.com/open-data-brazil/br-validators', target: '_blank' },
    ],
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Introduction', link: '/guide/' },
          { text: 'Install', link: '/guide/install' },
          { text: 'Framework adapters', link: '/guide/adapters' },
        ],
      },
      {
        text: 'Reference',
        items: [
          { text: 'Library API (narrative)', link: '/api/library-api' },
          { text: 'API Reference (TypeDoc)', link: '/api-reference/' },
          { text: 'Official sources', link: '/reference/official-sources' },
          { text: 'Contributing RG (UF)', link: '/reference/rg-good-first-issues' },
        ],
      },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/open-data-brazil/br-validators' },
    ],
    footer: {
      message: 'MIT License · Algorithms trace to official Brazilian government sources.',
      copyright: 'BR Validators',
    },
  },
});
