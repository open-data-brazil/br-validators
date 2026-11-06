import ibgeMetadata from './data/metadata.json';
import type { IbgeDataVersion } from './types.js';

export const IBGE_DATA_VERSION: IbgeDataVersion = ibgeMetadata as IbgeDataVersion;
