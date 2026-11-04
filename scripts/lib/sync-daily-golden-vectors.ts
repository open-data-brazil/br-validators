import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

interface SelicObservacao {
  data: string;
  valor: number;
}

interface SelicOfficialVectors {
  golden: {
    ultimaMeta: { data: string; valor: number };
    inicioJanela: { data: string; valor: number };
    historicoRange: {
      from: { data: string; valor: number };
      middle: { data: string; valor: number };
      to: { data: string; valor: number };
    };
  };
  staleness: {
    asOfFresh: string;
    freshReferenceDate: string;
    staleReferenceDate: string;
    capturadoEm: string;
    staleWarning: string;
  };
}

interface PtaxCotacao {
  moeda: string;
  data: string;
  cotacaoCompra: number;
  cotacaoVenda: number;
}

interface PtaxOfficialVectors {
  golden: {
    usdUltimoDiaUtil: PtaxCotacao;
    eurUltimoDiaUtil: PtaxCotacao;
    usdHistorico: PtaxCotacao & { dataBacen: string };
    historicoRange: {
      moeda: string;
      desde: string;
      ate: string;
      expectedRowCount: number;
      firstDate: string;
      lastDate: string;
    };
  };
  staleness: {
    asOfFresh: string;
    freshReferenceDate: string;
    staleReferenceDate: string;
    capturadoEm: string;
    staleWarning: string;
  };
}

function pickLatestByMoeda(
  records: readonly PtaxCotacao[],
  moeda: string,
): PtaxCotacao | undefined {
  const normalized = moeda.toUpperCase();
  return records
    .filter((row) => row.moeda.toUpperCase() === normalized)
    .sort((left, right) => right.data.localeCompare(left.data))[0];
}

/** ISO `YYYY-MM-DD` → Bacen Olinda `MM-DD-YYYY`. */
function toBacenDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  return `${month}-${day}-${year}`;
}

function parseIsoCalendarDay(isoDate: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/u.exec(isoDate);
  if (match === null) {
    return null;
  }
  return Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function calendarDayDifference(fromIso: string, toIso: string): number | null {
  const from = parseIsoCalendarDay(fromIso);
  const to = parseIsoCalendarDay(toIso);
  if (from === null || to === null) {
    return null;
  }
  return Math.round((to - from) / 86_400_000);
}

function resolveStaleReferenceDate(
  records: readonly { data: string }[],
  freshDate: string,
  currentStale: string,
): string {
  const dates = new Set(records.map((row) => row.data));
  if (dates.has(currentStale) && currentStale < freshDate) {
    // Keep the existing stale date while it remains in the rolling window
    // AND is far enough from fresh to guarantee staleness.
    // Staleness = data < previous business day. Previous business day can be
    // up to 3-4 calendar days before asOf (weekend + holiday), so require a
    // 7-day gap to stay stale across weekends/holidays.
    const gap = calendarDayDifference(currentStale, freshDate);
    if (gap !== null && gap >= 7) {
      return currentStale;
    }
    // If the gap is small (or unparseable), fall through to pick the oldest
    // date below, which is guaranteed stale in a 90-day rolling window.
    if (gap === null) {
      return currentStale;
    }
  }

  // Fallback when the old stale date falls out of the rolling window (or got
  // too close to fresh): pick the OLDEST date, not the newest.
  // The newest date < fresh (fresh - 1 day) equals the previous business day
  // in the common case, so `isStale(newest, asOfFresh)` is false and the
  // `marks older observation as stale` test fails in CI after refresh.
  // The oldest date in a 80-95 record window is always stale.
  const older = records
    .map((row) => row.data)
    .filter((date) => date < freshDate)
    .sort((left, right) => left.localeCompare(right));

  return older[0] ?? currentStale;
}

export async function syncSelicGoldenVectors(
  selicPath: string,
  metadataPath: string,
  vectorsPath: string,
): Promise<boolean> {
  const selic = JSON.parse(await readFile(selicPath, 'utf8')) as SelicObservacao[];
  const metadata = JSON.parse(await readFile(metadataPath, 'utf8')) as { capturadoEm: string };
  const vectors = JSON.parse(await readFile(vectorsPath, 'utf8')) as SelicOfficialVectors;

  if (selic.length < 3) {
    return false;
  }

  const first = selic.at(0);
  const middle = selic.at(1);
  const lastInSample = selic.at(2);
  const latest = selic.at(-1);
  if (first === undefined || middle === undefined || lastInSample === undefined || latest === undefined) {
    return false;
  }

  const next: SelicOfficialVectors = {
    ...vectors,
    golden: {
      ultimaMeta: { data: latest.data, valor: latest.valor },
      inicioJanela: { data: first.data, valor: first.valor },
      historicoRange: {
        from: { data: first.data, valor: first.valor },
        middle: { data: middle.data, valor: middle.valor },
        to: { data: lastInSample.data, valor: lastInSample.valor },
      },
    },
    staleness: {
      ...vectors.staleness,
      asOfFresh: metadata.capturadoEm,
      freshReferenceDate: latest.data,
      capturadoEm: metadata.capturadoEm,
      staleReferenceDate: resolveStaleReferenceDate(
        selic,
        latest.data,
        vectors.staleness.staleReferenceDate,
      ),
    },
  };

  const serialized = `${JSON.stringify(next, null, 2)}\n`;
  const previous = `${JSON.stringify(vectors, null, 2)}\n`;
  if (serialized === previous) {
    return false;
  }

  await writeFile(vectorsPath, serialized);
  return true;
}

export async function syncPtaxGoldenVectors(
  ptaxPath: string,
  metadataPath: string,
  vectorsPath: string,
): Promise<boolean> {
  const ptax = JSON.parse(await readFile(ptaxPath, 'utf8')) as PtaxCotacao[];
  const metadata = JSON.parse(await readFile(metadataPath, 'utf8')) as { capturadoEm: string };
  const vectors = JSON.parse(await readFile(vectorsPath, 'utf8')) as PtaxOfficialVectors;

  const usdLatest = pickLatestByMoeda(ptax, 'USD');
  const eurLatest = pickLatestByMoeda(ptax, 'EUR');
  if (usdLatest === undefined || eurLatest === undefined) {
    return false;
  }

  // The embed is a rolling 90-business-day window: the historical golden row must
  // follow the window or tests break as soon as the old date is evicted.
  // Non-empty: usdLatest above proves at least one USD row exists.
  const usdOldest = ptax
    .filter((row) => row.moeda === 'USD')
    .sort((left, right) => left.data.localeCompare(right.data))[0];

  const range = vectors.golden.historicoRange;
  const rangeRows = ptax
    .filter(
      (row) =>
        row.moeda === 'USD' && row.data >= range.desde && row.data <= usdLatest.data,
    )
    .sort((left, right) => left.data.localeCompare(right.data));

  const next: PtaxOfficialVectors = {
    ...vectors,
    golden: {
      ...vectors.golden,
      usdUltimoDiaUtil: {
        moeda: usdLatest.moeda,
        data: usdLatest.data,
        cotacaoCompra: usdLatest.cotacaoCompra,
        cotacaoVenda: usdLatest.cotacaoVenda,
      },
      eurUltimoDiaUtil: {
        moeda: eurLatest.moeda,
        data: eurLatest.data,
        cotacaoCompra: eurLatest.cotacaoCompra,
        cotacaoVenda: eurLatest.cotacaoVenda,
      },
      usdHistorico: {
        moeda: usdOldest.moeda,
        data: usdOldest.data,
        dataBacen: toBacenDate(usdOldest.data),
        cotacaoCompra: usdOldest.cotacaoCompra,
        cotacaoVenda: usdOldest.cotacaoVenda,
      },
      historicoRange: {
        ...range,
        desde: range.desde < usdOldest.data ? range.desde : usdOldest.data,
        ate: usdLatest.data,
        expectedRowCount: rangeRows.length,
        firstDate: rangeRows[0]?.data ?? range.firstDate,
        lastDate: usdLatest.data,
      },
    },
    staleness: {
      ...vectors.staleness,
      asOfFresh: metadata.capturadoEm,
      freshReferenceDate: usdLatest.data,
      capturadoEm: metadata.capturadoEm,
      staleReferenceDate: resolveStaleReferenceDate(
        ptax.filter((row) => row.moeda === 'USD'),
        usdLatest.data,
        vectors.staleness.staleReferenceDate,
      ),
    },
  };

  const serialized = `${JSON.stringify(next, null, 2)}\n`;
  const previous = `${JSON.stringify(vectors, null, 2)}\n`;
  if (serialized === previous) {
    return false;
  }

  await writeFile(vectorsPath, serialized);
  return true;
}

interface AnpSemanaPesquisa {
  inicio: string;
  fim: string;
}

interface AnpPrecoMedioRecord {
  semanaInicio: string;
  semanaFim: string;
  uf: string;
  municipioNome: string;
  municipioIbge: number | null;
  produto: string;
  precoMedio: number;
}

interface AnpGoldenMunicipio {
  uf: string;
  municipio: string;
  produto: string;
  municipioIbge: number;
  precoMedio: number;
}

interface AnpGoldenIbge {
  uf: string;
  municipio: string;
  produto: string;
  municipioIbge: number;
  precoMedio: number;
}

interface AnpOfficialVectors {
  source: string;
  listingUrl: string;
  week: AnpSemanaPesquisa;
  golden: {
    saoPauloGasolina: AnpGoldenMunicipio;
    adamantinaEtanol: AnpGoldenMunicipio;
    campoGrandeGlp: AnpGoldenIbge;
  };
}

function normalizeAnpPlaceName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toUpperCase()
    .trim();
}

function findAnpPrecoByMunicipio(
  records: readonly AnpPrecoMedioRecord[],
  uf: string,
  municipio: string,
  produto: string,
): AnpPrecoMedioRecord | undefined {
  const normalizedUf = uf.toUpperCase();
  const normalizedMunicipio = normalizeAnpPlaceName(municipio);
  const normalizedProduto = produto.toUpperCase();

  return records.find(
    (record) =>
      record.uf === normalizedUf &&
      normalizeAnpPlaceName(record.municipioNome) === normalizedMunicipio &&
      record.produto === normalizedProduto,
  );
}

function findAnpPrecoByIbge(
  records: readonly AnpPrecoMedioRecord[],
  municipioIbge: number,
  produto: string,
): AnpPrecoMedioRecord | undefined {
  return records.find(
    (record) => record.municipioIbge === municipioIbge && record.produto === produto.toUpperCase(),
  );
}

function resolveAnpSourceUrl(endpoints: readonly string[]): string {
  for (const endpoint of endpoints) {
    if (endpoint.endsWith('.xlsx')) {
      return endpoint;
    }
  }
  if (endpoints.length === 0) {
    return '';
  }
  return endpoints[endpoints.length - 1];
}

export async function syncAnpGoldenVectors(
  precosPath: string,
  semanasPath: string,
  metadataPath: string,
  vectorsPath: string,
): Promise<boolean> {
  const precos = JSON.parse(await readFile(precosPath, 'utf8')) as AnpPrecoMedioRecord[];
  const semanas = JSON.parse(await readFile(semanasPath, 'utf8')) as AnpSemanaPesquisa[];
  const metadata = JSON.parse(await readFile(metadataPath, 'utf8')) as { endpoints: string[] };
  const vectors = JSON.parse(await readFile(vectorsPath, 'utf8')) as AnpOfficialVectors;

  const week = semanas.at(0);
  if (week === undefined) {
    return false;
  }

  const saoPaulo = findAnpPrecoByMunicipio(
    precos,
    vectors.golden.saoPauloGasolina.uf,
    vectors.golden.saoPauloGasolina.municipio,
    vectors.golden.saoPauloGasolina.produto,
  );
  const adamantina = findAnpPrecoByMunicipio(
    precos,
    vectors.golden.adamantinaEtanol.uf,
    vectors.golden.adamantinaEtanol.municipio,
    vectors.golden.adamantinaEtanol.produto,
  );
  const campoGrande = findAnpPrecoByIbge(
    precos,
    vectors.golden.campoGrandeGlp.municipioIbge,
    vectors.golden.campoGrandeGlp.produto,
  );

  if (saoPaulo === undefined || adamantina === undefined || campoGrande === undefined) {
    return false;
  }

  const next: AnpOfficialVectors = {
    ...vectors,
    source: resolveAnpSourceUrl(metadata.endpoints),
    week,
    golden: {
      saoPauloGasolina: {
        ...vectors.golden.saoPauloGasolina,
        precoMedio: saoPaulo.precoMedio,
        municipioIbge:
          saoPaulo.municipioIbge !== null
            ? saoPaulo.municipioIbge
            : vectors.golden.saoPauloGasolina.municipioIbge,
      },
      adamantinaEtanol: {
        ...vectors.golden.adamantinaEtanol,
        precoMedio: adamantina.precoMedio,
        municipioIbge:
          adamantina.municipioIbge !== null
            ? adamantina.municipioIbge
            : vectors.golden.adamantinaEtanol.municipioIbge,
      },
      campoGrandeGlp: {
        ...vectors.golden.campoGrandeGlp,
        precoMedio: campoGrande.precoMedio,
        uf: campoGrande.uf,
      },
    },
  };

  const serialized = `${JSON.stringify(next, null, 2)}\n`;
  const previous = `${JSON.stringify(vectors, null, 2)}\n`;
  if (serialized === previous) {
    return false;
  }

  await writeFile(vectorsPath, serialized);
  return true;
}

export interface DailyGoldenVectorPaths {
  rootDir: string;
}

export async function syncDailyGoldenVectors(paths: DailyGoldenVectorPaths): Promise<{
  selicUpdated: boolean;
  ptaxUpdated: boolean;
  anpUpdated: boolean;
}> {
  const coreData = path.join(paths.rootDir, 'packages/br-validators');
  const vectorsDir = path.join(coreData, 'tests/vectors');

  const selicUpdated = await syncSelicGoldenVectors(
    path.join(coreData, 'src/selic/data/selic.json'),
    path.join(coreData, 'src/selic/data/metadata.json'),
    path.join(vectorsDir, 'selic.official.json'),
  );

  const ptaxUpdated = await syncPtaxGoldenVectors(
    path.join(coreData, 'src/ptax/data/ptax.json'),
    path.join(coreData, 'src/ptax/data/metadata.json'),
    path.join(vectorsDir, 'ptax.official.json'),
  );

  const anpUpdated = await syncAnpGoldenVectors(
    path.join(coreData, 'src/anp-combustiveis/data/precos-medios.json'),
    path.join(coreData, 'src/anp-combustiveis/data/semanas.json'),
    path.join(coreData, 'src/anp-combustiveis/data/metadata.json'),
    path.join(vectorsDir, 'anp-combustiveis.official.json'),
  );

  return { selicUpdated, ptaxUpdated, anpUpdated };
}
