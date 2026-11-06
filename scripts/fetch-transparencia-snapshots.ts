import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { exitWithError } from './lib/errors.js';
import { probeUrl, todayIsoDate } from './lib/fetch-utils.js';
import { buildMetadata } from './lib/metadata-writer.js';
import {
  buildFailureOutcome,
  FETCH_MAX_ATTEMPTS,
  writeSourceFetchOutcome,
} from './lib/source-fetch-outcome.js';
import {
  TRANSPARENCIA_CADASTRO_URL,
  TRANSPARENCIA_ENDPOINTS,
  TRANSPARENCIA_OPENAPI_URL,
  TRANSPARENCIA_SWAGGER_URL,
} from './lib/transparencia-endpoints-registry.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const TRANSPARENCIA_DATA_DIR = path.join(
  ROOT,
  'packages/br-validators/src/transparencia-snapshots/data',
);
const FETCH_OUTCOME_DIR = path.join(ROOT, 'data/refresh-reports/fetch-outcomes');

async function readJsonIfExists<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await readFile(filePath, 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function main(): Promise<void> {
  const endpointsPath = path.join(TRANSPARENCIA_DATA_DIR, 'endpoints.json');
  const metadataPath = path.join(TRANSPARENCIA_DATA_DIR, 'metadata.json');
  const previousMetadata = await readJsonIfExists<{ capturadoEm: string }>(metadataPath);
  const endpoints = [TRANSPARENCIA_SWAGGER_URL, TRANSPARENCIA_OPENAPI_URL, TRANSPARENCIA_CADASTRO_URL];

  try {
    await mkdir(TRANSPARENCIA_DATA_DIR, { recursive: true });

    const swaggerProbe = await probeUrl(TRANSPARENCIA_SWAGGER_URL);
    const openapiProbe = await probeUrl(TRANSPARENCIA_OPENAPI_URL);

    const registry = {
      capturadoEm: new Date().toISOString(),
      swaggerOk: swaggerProbe.ok,
      openapiOk: openapiProbe.ok,
      cadastroUrl: TRANSPARENCIA_CADASTRO_URL,
      adapterPackage: '@br-validators/adapters-transparencia',
      endpoints: TRANSPARENCIA_ENDPOINTS,
    };

    const metadata = buildMetadata(
      {
        id: 'transparencia-snapshots',
        nome: 'Portal da Transparência endpoint registry',
        fonte: 'CGU Portal da Transparência — Swagger audit (query endpoints; no bulk embed in v1)',
        endpoints,
        contagens: {
          endpoints: TRANSPARENCIA_ENDPOINTS.length,
          queryAdapter: TRANSPARENCIA_ENDPOINTS.filter((entry) => entry.delivery === 'query-adapter')
            .length,
        },
        documentacao: 'docs/OFFICIAL-SOURCES.md#portal-transparencia',
      },
      {
        adicionados: 0,
        removidos: 0,
        alterados: 0,
        comparadoCom: previousMetadata?.capturadoEm ?? null,
      },
    );

    const jsonIndent = 2;
    await writeFile(endpointsPath, `${JSON.stringify(registry, null, jsonIndent)}\n`);
    await writeFile(metadataPath, `${JSON.stringify(metadata, null, jsonIndent)}\n`);

    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, {
      datasetId: 'transparencia-snapshots',
      status: swaggerProbe.ok && openapiProbe.ok ? 'ok' : 'source_unavailable',
      endpoints,
      attempts: FETCH_MAX_ATTEMPTS,
      checkedAt: new Date().toISOString(),
      retainedEmbeddedDataFrom: metadata.capturadoEm,
      message:
        swaggerProbe.ok && openapiProbe.ok
          ? 'Transparência registry refreshed; Swagger/OpenAPI reachable.'
          : 'Transparência registry written; Swagger/OpenAPI probe failed — retained previous classification.',
    });

    console.log(
      `Transparência registry written (${todayIsoDate()}): ${String(TRANSPARENCIA_ENDPOINTS.length)} endpoints (swagger=${String(swaggerProbe.ok)}, openapi=${String(openapiProbe.ok)})`,
    );
  } catch (error) {
    const outcome = buildFailureOutcome(
      'transparencia-snapshots',
      endpoints,
      previousMetadata?.capturadoEm ?? null,
      error,
      FETCH_MAX_ATTEMPTS,
    );
    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, outcome);
    console.warn(`[transparencia-snapshots] ${outcome.message}`);
  }
}

main().catch(exitWithError);
