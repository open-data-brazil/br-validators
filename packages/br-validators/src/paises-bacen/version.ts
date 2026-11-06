import paisesMetadata from './data/metadata.json';
import type { PaisesBacenDataVersion } from './types.js';

export const PAISES_BACEN_DATA_VERSION: PaisesBacenDataVersion =
  paisesMetadata as PaisesBacenDataVersion;
