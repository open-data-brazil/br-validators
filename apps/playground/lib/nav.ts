export const ROUTES = [
  { slug: 'cnpj', label: 'CNPJ', description: 'RFB modulo 11 (numeric + alpha)' },
  { slug: 'cpf', label: 'CPF', description: 'RFB modulo 11' },
  { slug: 'cep', label: 'CEP', description: 'Correios postal code' },
  { slug: 'telefone', label: 'Telefone', description: 'DDD + 8/9 digits' },
  { slug: 'placa', label: 'Placa', description: 'Legacy + Mercosul' },
  { slug: 'pis', label: 'PIS/PASEP', description: 'CNIS modulo 11' },
  { slug: 'pix', label: 'PIX Key', description: 'Bacen DICT — 5 types' },
  { slug: 'brcode', label: 'BR Code', description: 'PIX EMV payload' },
  { slug: 'boleto', label: 'Boleto', description: 'FEBRABAN cobrança' },
  { slug: 'cartao', label: 'Cartão de Crédito', description: 'Luhn algorithm' },
  { slug: 'ie', label: 'Inscrição Estadual', description: '27 UFs' },
] as const;
