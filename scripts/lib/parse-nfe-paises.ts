/** Parse NF-e / Bacen country table (pipe, semicolon, or tab delimited). */

export interface PaisBacenRecord {
  codigo: string;
  nome: string;
}

function normalizeCodigo(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 0) {
    return '';
  }
  return digits.padStart(4, '0').slice(-4);
}

function parseDelimitedLine(line: string): PaisBacenRecord | null {
  const trimmed = line.trim();
  if (trimmed.length === 0 || /^cod/i.test(trimmed)) {
    return null;
  }

  const parts = trimmed.split(/[|;\t]/).map((part) => part.trim());
  if (parts.length < 2) {
    return null;
  }

  const codigo = normalizeCodigo(parts[0] ?? '');
  const nome = (parts[1] ?? '').trim();
  if (codigo.length !== 4 || nome.length === 0) {
    return null;
  }

  return { codigo, nome };
}

export function parseNfePaisesTable(text: string): PaisBacenRecord[] {
  const records: PaisBacenRecord[] = [];
  const seen = new Set<string>();

  for (const line of text.split(/\r?\n/)) {
    const record = parseDelimitedLine(line);
    if (record === null || seen.has(record.codigo)) {
      continue;
    }
    seen.add(record.codigo);
    records.push(record);
  }

  return records.sort((left, right) => left.codigo.localeCompare(right.codigo));
}
