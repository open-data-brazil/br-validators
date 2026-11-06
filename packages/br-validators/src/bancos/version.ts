import bancosMetadata from './data/metadata.json';
import type { BancosDataVersion } from './types.js';

export const BANCOS_DATA_VERSION: BancosDataVersion = bancosMetadata as BancosDataVersion;
