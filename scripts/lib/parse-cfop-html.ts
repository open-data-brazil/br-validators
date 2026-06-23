/**
 * Parse CFOP codes from CONFAZ SINIEF HTML table (official publication).
 * @see https://www.confaz.fazenda.gov.br/legislacao/ajustes/sinief/cfop_cvsn_70_vigente
 */

export interface CfopRecord {
  codigo: string;
  descricao: string;
}

export function parseCfopHtml(html: string): CfopRecord[] {
  const pattern = /<p[^>]*>\s*(\d)\.(\d{3})\s*[-–]\s*([^<]+)<\/p>/gi;
  const byCode = new Map<string, string>();
  let match: RegExpExecArray | null = pattern.exec(html);

  while (match !== null) {
    const codigo = `${match[1]}${match[2]}`;
    const descricao = match[3].trim();
    if (!byCode.has(codigo)) {
      byCode.set(codigo, descricao);
    }
    match = pattern.exec(html);
  }

  return [...byCode.entries()]
    .map(([codigo, descricao]) => ({ codigo, descricao }))
    .sort((left, right) => left.codigo.localeCompare(right.codigo));
}
