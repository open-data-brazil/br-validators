import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { diffRecordsByKey } from './lib/diff-dataset.js';
import { exitWithError } from './lib/errors.js';
import {
  buildFailureOutcome,
  FETCH_MAX_ATTEMPTS,
  SourceDataError,
  writeSourceFetchOutcome,
} from './lib/source-fetch-outcome.js';
import {
  buildIbptCandidateEndpoints,
  fetchIbptGoldenCargas,
  IBPT_MAX_CARGAS,
  IBPT_MIN_CARGAS,
  IBPT_OFFICIAL_PORTAL_URL,
  ibptSuccessMessage,
} from './lib/fetch-ibpt-golden.js';
import type { IbptCargaRecord } from './lib/parse-ibpt-ncm-json.js';
import { todayIsoDate } from './lib/fetch-utils.js';
import { buildMetadata } from './lib/metadata-writer.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'packages/br-validators/src/ibpt/data');
const FETCH_OUTCOME_DIR = path.join(ROOT, 'data/refresh-reports/fetch-outcomes');

export {
  IBPT_GOLDEN_NCMS,
  IBPT_GOLDEN_UFS,
  IBPT_OFFICIAL_PORTAL_URL,
  IBPT_VALRAW_API_BASE_URL,
} from './lib/fetch-ibpt-golden.js';

async function readJsonIfExists<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await readFile(filePath, 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function main(): Promise<void> {
  const dataPath = path.join(DATA_DIR, 'cargas.json');
  const metadataPath = path.join(DATA_DIR, 'metadata.json');
  const previousMetadata = await readJsonIfExists<{ capturadoEm: string }>(metadataPath);
  const candidateEndpoints = buildIbptCandidateEndpoints();

  try {
    const fetched = await fetchIbptGoldenCargas();
    const cargas = fetched.cargas;

    if (cargas.length < IBPT_MIN_CARGAS || cargas.length > IBPT_MAX_CARGAS) {
      throw new SourceDataError(
        `Expected ${String(IBPT_MIN_CARGAS)}–${String(IBPT_MAX_CARGAS)} IBPT cargas, got ${String(cargas.length)}`,
      );
    }

    const keySet = new Set(cargas.map((carga) => `${carga.uf}:${carga.ncm}:${carga.excecao}`));
    if (keySet.size !== cargas.length) {
      throw new SourceDataError('Duplicate IBPT NCM×UF keys detected');
    }

    await mkdir(DATA_DIR, { recursive: true });
    const previousCargas = await readJsonIfExists<IbptCargaRecord[]>(dataPath);
    const comparadoCom = previousMetadata?.capturadoEm ?? null;
    const changes = diffRecordsByKey(
      previousCargas ?? [],
      cargas,
      (record) => `${record.uf}:${record.ncm}:${record.excecao}`,
      comparadoCom,
    );

    const tabela = cargas[0]?.tabela ?? '';

    const metadata = buildMetadata(
      {
        id: 'ibpt',
        nome: 'IBPT — Carga tributária aproximada por NCM (Lei 12.741/2012)',
        fonte: 'IBPT — De Olho no Imposto (tabelas oficiais NCM × UF)',
        endpoints: fetched.endpoints,
        contagens: { cargas: cargas.length },
        documentacao: 'docs/OFFICIAL-SOURCES.md#ibpt-carga-tributaria-ncm',
      },
      changes,
    );

    const jsonIndent = 2;
    await writeFile(dataPath, `${JSON.stringify(cargas, null, jsonIndent)}\n`);
    await writeFile(metadataPath, `${JSON.stringify(metadata, null, jsonIndent)}\n`);

    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, {
      datasetId: 'ibpt',
      status: 'ok',
      endpoints: fetched.endpoints,
      attempts: FETCH_MAX_ATTEMPTS,
      checkedAt: new Date().toISOString(),
      retainedEmbeddedDataFrom: metadata.capturadoEm,
      message: ibptSuccessMessage(fetched.source),
    });

    console.log(`IBPT data written (${todayIsoDate()}): ${String(cargas.length)} cargas, tabela ${tabela}`);
  } catch (error) {
    const outcome = buildFailureOutcome(
      'ibpt',
      [IBPT_OFFICIAL_PORTAL_URL],
      previousMetadata?.capturadoEm ?? null,
      error,
      FETCH_MAX_ATTEMPTS,
      candidateEndpoints,
    );
    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, outcome);
    console.warn(`[ibpt] ${outcome.message}`);
  }
}

main().catch(exitWithError);
