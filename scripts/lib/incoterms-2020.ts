/** ICC Incoterms 2020 — code and name only (no copyrighted descriptions). */

export interface IncotermSeed {
  codigo: string;
  nome: string;
}

export const INCOTERMS_2020: readonly IncotermSeed[] = [
  { codigo: 'EXW', nome: 'Ex Works' },
  { codigo: 'FCA', nome: 'Free Carrier' },
  { codigo: 'CPT', nome: 'Carriage Paid To' },
  { codigo: 'CIP', nome: 'Carriage and Insurance Paid To' },
  { codigo: 'DAP', nome: 'Delivered at Place' },
  { codigo: 'DPU', nome: 'Delivered at Place Unloaded' },
  { codigo: 'DDP', nome: 'Delivered Duty Paid' },
  { codigo: 'FAS', nome: 'Free Alongside Ship' },
  { codigo: 'FOB', nome: 'Free On Board' },
  { codigo: 'CFR', nome: 'Cost and Freight' },
  { codigo: 'CIF', nome: 'Cost, Insurance and Freight' },
];
