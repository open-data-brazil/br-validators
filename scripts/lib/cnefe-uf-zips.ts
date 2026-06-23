export const CNEFE_UF_ZIP_BASE_URL =
  'https://ftp.ibge.gov.br/Cadastro_Nacional_de_Enderecos_para_Fins_Estatisticos/Censo_Demografico_2022/Arquivos_CNEFE/CSV/UF';

export const CNEFE_UF_ZIP_FILES = [
  '11_RO.zip',
  '12_AC.zip',
  '13_AM.zip',
  '14_RR.zip',
  '15_PA.zip',
  '16_AP.zip',
  '17_TO.zip',
  '21_MA.zip',
  '22_PI.zip',
  '23_CE.zip',
  '24_RN.zip',
  '25_PB.zip',
  '26_PE.zip',
  '27_AL.zip',
  '28_SE.zip',
  '29_BA.zip',
  '31_MG.zip',
  '32_ES.zip',
  '33_RJ.zip',
  '35_SP.zip',
  '41_PR.zip',
  '42_SC.zip',
  '43_RS.zip',
  '50_MS.zip',
  '51_MT.zip',
  '52_GO.zip',
  '53_DF.zip',
] as const;

export function cnefeUfZipUrl(fileName: string): string {
  return `${CNEFE_UF_ZIP_BASE_URL}/${fileName}`;
}
