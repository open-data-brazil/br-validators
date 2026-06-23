import aeroportosMetadata from './data/metadata.json';
import type { AeroportosDataVersion } from './types.js';

export const AEROPORTOS_DATA_VERSION: AeroportosDataVersion =
  aeroportosMetadata as AeroportosDataVersion;
