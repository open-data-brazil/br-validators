import feriadosMetadata from './data/metadata.json';
import type { FeriadosDataVersion } from './types.js';

export const FERIADOS_DATA_VERSION: FeriadosDataVersion = feriadosMetadata as FeriadosDataVersion;
