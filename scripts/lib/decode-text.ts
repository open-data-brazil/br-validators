/**
 * Decode official-source text payloads whose charset is not declared reliably.
 *
 * Several Brazilian government files (MTE CBO CSV, TSE municipio_tse_ibge.csv,
 * RFB CNPJ tables) are published in ISO-8859-1 / Windows-1252 without a charset
 * header. Decoding them as UTF-8 replaces every accented letter with U+FFFD.
 */

const UTF8_BOM = [0xef, 0xbb, 0xbf] as const;

function stripUtf8Bom(bytes: Uint8Array): Uint8Array {
  if (bytes.length >= 3 && bytes[0] === UTF8_BOM[0] && bytes[1] === UTF8_BOM[1] && bytes[2] === UTF8_BOM[2]) {
    return bytes.subarray(3);
  }
  return bytes;
}

/** UTF-8 when the payload is valid UTF-8; Windows-1252 (superset of ISO-8859-1) otherwise. */
export function decodeTextBuffer(bytes: Uint8Array): string {
  const payload = stripUtf8Bom(bytes);
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(payload);
  } catch {
    return new TextDecoder('windows-1252').decode(payload);
  }
}
