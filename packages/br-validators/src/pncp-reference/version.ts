import pncpMetadata from './data/metadata.json';
import type { PncpReferenceDataVersion } from './types.js';

export const PNCP_REFERENCE_DATA_VERSION: PncpReferenceDataVersion =
  pncpMetadata as PncpReferenceDataVersion;
