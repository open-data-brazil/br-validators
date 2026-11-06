/**
 * Static PIX BR Code builder — EMV TLV + CRC16-CCITT (Bacen Manual BR Code).
 * @see BRCODE_OFFICIAL_SOURCE_URL
 * @see BRCODE_PIX_INITIATION_MANUAL_URL
 */
import {
  BRCODE_COUNTRY_CODE,
  BRCODE_CURRENCY_BRL,
  BRCODE_PAYLOAD_FORMAT_INDICATOR,
  BRCODE_PIX_GUI,
} from './constants.js';
import { computeCrc16Ccitt } from './crc16.js';

export type StaticPixBrCodeInput = {
  pixKey: string;
  merchantName: string;
  merchantCity: string;
  /** Omit for permanent static QR (payer sets amount). Decimal with up to 2 fraction digits. */
  amount?: string;
  /** Defaults to `***` per Manual de Padrões PIX static QR. */
  txid?: string;
};

function encodeTlv(tag: string, value: string): string {
  return `${tag}${value.length.toString().padStart(2, '0')}${value}`;
}

function normalizeAmount(raw: string): string | undefined {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return undefined;
  }
  const normalized = trimmed.replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    return undefined;
  }
  return normalized;
}

/** Build static PIX BR Code EMV payload. Validate output with `validateBrCode`. */
export function buildStaticPixBrCode(input: StaticPixBrCodeInput): string {
  const key = input.pixKey.trim();
  const merchantName = input.merchantName.trim().slice(0, 25);
  const merchantCity = input.merchantCity.trim().slice(0, 15).toUpperCase();
  const txid = (input.txid?.trim() || '***').slice(0, 25);
  const amount = input.amount ? normalizeAmount(input.amount) : undefined;

  const pixGui = encodeTlv('00', BRCODE_PIX_GUI);
  const pixKeyField = encodeTlv('01', key);
  const merchantAccount = encodeTlv('26', `${pixGui}${pixKeyField}`);

  let payload = '';
  payload += encodeTlv('00', BRCODE_PAYLOAD_FORMAT_INDICATOR);
  payload += merchantAccount;
  payload += encodeTlv('52', '0000');
  payload += encodeTlv('53', BRCODE_CURRENCY_BRL);
  if (amount) {
    payload += encodeTlv('54', amount);
  }
  payload += encodeTlv('58', BRCODE_COUNTRY_CODE);
  payload += encodeTlv('59', merchantName);
  payload += encodeTlv('60', merchantCity);
  payload += encodeTlv('62', encodeTlv('05', txid));
  payload += '6304';

  return payload + computeCrc16Ccitt(payload);
}
