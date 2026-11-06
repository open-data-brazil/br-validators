import ncmMetadata from './data/metadata.json';
import type { NcmDataVersion } from './types.js';

export const NCM_DATA_VERSION: NcmDataVersion = ncmMetadata as NcmDataVersion;
