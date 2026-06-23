import tseMunicipiosMetadata from './data/metadata.json';
import type { TseMunicipiosDataVersion } from './types.js';

export const TSE_MUNICIPIOS_DATA_VERSION: TseMunicipiosDataVersion =
  tseMunicipiosMetadata as TseMunicipiosDataVersion;
