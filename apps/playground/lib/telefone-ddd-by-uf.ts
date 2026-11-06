import { ANATEL_DDDS, type UfCode } from '@br-validators/core';

/** Anatel CN/DDD grouped by UF — @see TELEFONE_ANATEL_DDD_PANEL_URL */
export const TELEFONE_DDD_BY_UF: Record<UfCode, readonly string[]> = {
  AC: ['68'],
  AL: ['82'],
  AM: ['92', '97'],
  AP: ['96'],
  BA: ['71', '73', '74', '75', '77'],
  CE: ['85', '88'],
  DF: ['61'],
  ES: ['27', '28'],
  GO: ['62', '64'],
  MA: ['98', '99'],
  MG: ['31', '32', '33', '34', '35', '37', '38'],
  MS: ['67'],
  MT: ['65', '66'],
  PA: ['91', '93', '94'],
  PB: ['83'],
  PE: ['81', '87'],
  PI: ['86', '89'],
  PR: ['41', '42', '43', '44', '45', '46'],
  RJ: ['21', '22', '24'],
  RN: ['84'],
  RO: ['69'],
  RR: ['95'],
  RS: ['51', '53', '54', '55'],
  SC: ['47', '48', '49'],
  SE: ['79'],
  SP: ['11', '12', '13', '14', '15', '16', '17', '18', '19'],
  TO: ['63'],
};

const ANATEL_DDD_SET = new Set<string>(ANATEL_DDDS);

export function dddsForUf(uf: UfCode): readonly string[] {
  return TELEFONE_DDD_BY_UF[uf];
}

export function isTelefoneDddInUf(ddd: string, uf: UfCode): boolean {
  return TELEFONE_DDD_BY_UF[uf].includes(ddd);
}

/** Ensures every mapped DDD is an official Anatel code. */
export function assertTelefoneDddMapping(): void {
  for (const [uf, ddds] of Object.entries(TELEFONE_DDD_BY_UF) as [UfCode, readonly string[]][]) {
    for (const ddd of ddds) {
      if (!ANATEL_DDD_SET.has(ddd)) {
        throw new Error(`DDD ${ddd} for ${uf} is not in ANATEL_DDDS`);
      }
    }
  }
}

assertTelefoneDddMapping();
