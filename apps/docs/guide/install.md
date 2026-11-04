# Install

Packages are distributed as **GitHub Release assets** — they are not published to the npm registry (npm `1.10.1` is the last registry version and no longer updated). Each [release](https://github.com/open-data-brazil/br-validators/releases) attaches an `npm pack` tarball per package, so npm, pnpm, yarn and bun install straight from the URL and the lockfile pins its integrity.

```bash
# newest release (or set VERSION=1.10.1-data.35 to pin one)
VERSION=$(curl -fsSL https://api.github.com/repos/open-data-brazil/br-validators/releases/latest | jq -r .tag_name | sed 's/^v//')
pnpm add "https://github.com/open-data-brazil/br-validators/releases/download/v$VERSION/br-validators-core-$VERSION.tgz"
# or
npm install "https://github.com/open-data-brazil/br-validators/releases/download/v$VERSION/br-validators-core-$VERSION.tgz"
```

Every release also ships `br-validators-data-<version>.tar.gz` (all embedded datasets), `catalog.json` and `SHA256SUMS`; the newest catalog is always at [`releases/latest/download/catalog.json`](https://github.com/open-data-brazil/br-validators/releases/latest/download/catalog.json).

## Subpath imports (tree-shaking)

```typescript
import { validateCpf, formatCpf } from '@br-validators/core/cpf';
import { validateCnpj } from '@br-validators/core/cnpj';
import { getNcmPorCodigo } from '@br-validators/core/ncm';
```

## Bundle size (gzipped)

Measured `@br-validators/core@1.9.0` with `pnpm measure:bundle-sizes` (esbuild ESM bundle per subpath). **Reference-data subpaths include embedded JSON**; some validators (e.g. `cep`, `sanitize`) also bundle shared core dependencies when imported alone.

| Subpath | Raw (esbuild) | Gzip | Notes |
|---------|---------------|------|-------|
| `@br-validators/core/cpf` | 4.0 KB | 1.5 KB | validator only |
| `@br-validators/core/cnpj` | 6.8 KB | 2.0 KB | validator only |
| `@br-validators/core/cep` | 2340.8 KB | 161.8 KB | validator only |
| `@br-validators/core/ncm` | 914.6 KB | 142.2 KB | includes embed |
| `@br-validators/core/cfop` | 100.3 KB | 9.4 KB | includes embed |
| `@br-validators/core/cst` | 19.1 KB | 3.4 KB | includes embed |
| `@br-validators/core/pix` | 17.6 KB | 3.9 KB | validator only |
| `@br-validators/core/ptax` | 214.2 KB | 22.4 KB | includes embed |
| `@br-validators/core/ibge` | 392.6 KB | 60.5 KB | includes embed |
| `@br-validators/core/sanitize` | 2995.5 KB | 219.4 KB | platform utilities |

Full table: [data/bundle-sizes/subpath-sizes.md](https://github.com/open-data-brazil/br-validators/blob/main/data/bundle-sizes/subpath-sizes.md).

## CLI

```bash
npm install -g "https://github.com/open-data-brazil/br-validators/releases/download/v$VERSION/br-validators-cli-$VERSION.tgz"
br-validators cpf validate 12345678909
```

## Adapters

Each adapter tarball resolves `@br-validators/core` from **the same release**, so no registry lookup happens. Install the adapter and the core from the same `VERSION`:

| Adapter | Release asset |
|---------|---------------|
| Zod | `br-validators-zod-$VERSION.tgz` |
| React Hook Form | `br-validators-react-hook-form-$VERSION.tgz` |
| Express | `br-validators-express-$VERSION.tgz` |
| Vue 3 | `br-validators-vue-$VERSION.tgz` |

```bash
pnpm add "https://github.com/open-data-brazil/br-validators/releases/download/v$VERSION/br-validators-zod-$VERSION.tgz" zod
```

See [Framework adapters](/guide/adapters).
