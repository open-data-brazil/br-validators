'use client';

import { useId } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Button } from '@/components/atoms/Button';
import styles from './organisms.module.css';

export function QrCodePanel({ value }: { value: string }) {
  const id = useId();

  return (
    <section className={styles.qrCard}>
      <h2 className={styles.qrTitle}>PIX QR Code</h2>
      <QRCodeCanvas id={id} value={value} size={256} level="M" marginSize={4} />
      <Button
        type="button"
        onClick={() => {
          const canvas = document.getElementById(id) as HTMLCanvasElement | null;
          const pngUrl = canvas?.toDataURL('image/png');
          if (!pngUrl) return;
          const anchor = document.createElement('a');
          anchor.href = pngUrl;
          anchor.download = 'pix-qr.png';
          anchor.click();
        }}
      >
        Download PNG
      </Button>
    </section>
  );
}
