import nbsMetadata from './data/metadata.json';
import type { NbsDataVersion } from './types.js';

export const NBS_DATA_VERSION: NbsDataVersion = nbsMetadata as NbsDataVersion;
