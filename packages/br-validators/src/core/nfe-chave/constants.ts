/**
 * NF-e / NFC-e chave de acesso — 44 digits (ENCAT / SEFAZ MOC).
 * @see https://www.nfe.fazenda.gov.br/portal/listaConteudo.aspx?tipoConteudo=ndIjl+iEFdE%3D — MOC 7.0 index
 * @see http://moc.sped.fazenda.pr.gov.br/ — MOC online (SEFAZ-PR mirror), §2.2.6
 * @see https://www.confaz.fazenda.gov.br/legislacao/arquivo-manuais/moc7-visao-geral.pdf — MOC 7.0 §2.2.6.1–2.2.6.2
 */
import type { UfCode } from '../../types/validation-result.js';

export const NFE_CHAVE_OFFICIAL_SOURCE_URL =
  'https://www.nfe.fazenda.gov.br/portal/listaConteudo.aspx?tipoConteudo=ndIjl+iEFdE%3D';

export const NFE_CHAVE_MOC_ONLINE_URL = 'http://moc.sped.fazenda.pr.gov.br/';

export const NFE_CHAVE_MOC_DV_SECTION_URL =
  'http://moc.sped.fazenda.pr.gov.br/#2.2.6.2. Cálculo do Dígito Verificador da Chave de Acesso da NF-e';

export const NFE_CHAVE_MOC_PDF_URL =
  'https://www.confaz.fazenda.gov.br/legislacao/arquivo-manuais/moc7-visao-geral.pdf';

export const NFE_CHAVE_DFE_PORTAL_URL = 'https://dfe-portal.svrs.rs.gov.br/NFe/Documentos';

/** MOC DANFE NFC-e QR Code page — illustrative chave (DV inconsistent with §2.2.6.2). */
export const NFE_CHAVE_NFCE_QR_ILLUSTRATIVE_URL =
  'http://moc.sped.fazenda.pr.gov.br/DanfeQrCodeNFCe.html';

export const NFE_CHAVE_LENGTH = 44;
export const NFE_CHAVE_BASE_LENGTH = 43;
export const NFE_CHAVE_MOD = 11;
export const NFE_CHAVE_WEIGHT_CYCLE = [2, 3, 4, 5, 6, 7, 8, 9] as const;
export const NFE_CHAVE_NUMERIC_PATTERN = /^\d{44}$/;

/**
 * Golden primary — MOC §2.2.6.2 worked example (sum=644, remainder=6, DV=5).
 * Base 43 digits from MOC table; DV appended per modulo-11 rule.
 */
export const NFE_CHAVE_GOLDEN_PRIMARY = '52060433009911002506550120000007800267301615';

/** Secondary valid vector from MOC online examples. */
export const NFE_CHAVE_GOLDEN_SECONDARY = '41180678393592000146558900000006041028190697';

/** MOC NFC-e QR page illustrative chave — fails DV under §2.2.6.2 (not used as valid golden). */
export const NFE_CHAVE_NFCE_QR_ILLUSTRATIVE = '28170800156225000131650110000151341562040824';

export const NFE_MODELO_NFE = '55';
export const NFE_MODELO_NFCE = '65';
export const NFE_MODELOS = [NFE_MODELO_NFE, NFE_MODELO_NFCE] as const;

/** IBGE UF codes valid in cUF (positions 1–2). */
export const NFE_IBGE_UF_CODES = new Set<number>([
  11, 12, 13, 14, 15, 16, 17,
  21, 22, 23, 24, 25, 26, 27, 28, 29,
  31, 32, 33, 35,
  41, 42, 43,
  50, 51, 52, 53,
]);

/** IBGE cUF → Brazilian UF sigla. */
export const NFE_IBGE_UF_BY_CODE: Readonly<Record<number, UfCode>> = {
  11: 'RO',
  12: 'AC',
  13: 'AM',
  14: 'RR',
  15: 'PA',
  16: 'AP',
  17: 'TO',
  21: 'MA',
  22: 'PI',
  23: 'CE',
  24: 'RN',
  25: 'PB',
  26: 'PE',
  27: 'AL',
  28: 'SE',
  29: 'BA',
  31: 'MG',
  32: 'ES',
  33: 'RJ',
  35: 'SP',
  41: 'PR',
  42: 'SC',
  43: 'RS',
  50: 'MS',
  51: 'MT',
  52: 'GO',
  53: 'DF',
};
