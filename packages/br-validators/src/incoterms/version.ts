import incotermsMetadata from './data/metadata.json';
import type { IncotermsDataVersion } from './types.js';

export const INCOTERMS_DATA_VERSION: IncotermsDataVersion =
  incotermsMetadata as IncotermsDataVersion;
