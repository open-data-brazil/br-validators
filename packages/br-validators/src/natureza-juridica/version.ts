import naturezaJuridicaMetadata from './data/metadata.json';
import type { NaturezaJuridicaDataVersion } from './types.js';

export const NATUREZA_JURIDICA_DATA_VERSION: NaturezaJuridicaDataVersion =
  naturezaJuridicaMetadata as NaturezaJuridicaDataVersion;
