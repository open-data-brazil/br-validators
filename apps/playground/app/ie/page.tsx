'use client';

import { useMemo, useState } from 'react';
import {
  IE_OFFICIAL_SOURCE_URLS,
  IE_SP_GOLDEN,
  IE_SUPPORTED_UFS,
  formatInscricaoEstadual,
  stripInscricaoEstadual,
  validateInscricaoEstadual,
  type UfCode,
} from '@br-validators/core';
import { CliCommandHint } from '@/components/molecules/CliCommandHint';
import { DocumentInput } from '@/components/molecules/DocumentInput';
import { OfficialSourceLink } from '@/components/molecules/OfficialSourceLink';
import { ResultRow } from '@/components/molecules/ResultRow';
import { ResultSection } from '@/components/molecules/ResultSection';
import { Select } from '@/components/atoms/Select';
import { Label } from '@/components/atoms/Label';
import { ValidatorPanel } from '@/components/organisms/ValidatorPanel';
import { generateIe, IE_SAMPLES } from '@/lib/generators';

const UF_LABELS: Record<UfCode, string> = {
  AC: 'Acre', AL: 'Alagoas', AM: 'Amazonas', AP: 'Amapá', BA: 'Bahia', CE: 'Ceará',
  DF: 'Distrito Federal', ES: 'Espírito Santo', GO: 'Goiás', MA: 'Maranhão', MG: 'Minas Gerais',
  MS: 'Mato Grosso do Sul', MT: 'Mato Grosso', PA: 'Pará', PB: 'Paraíba', PE: 'Pernambuco',
  PI: 'Piauí', PR: 'Paraná', RJ: 'Rio de Janeiro', RN: 'Rio Grande do Norte', RO: 'Rondônia',
  RR: 'Roraima', RS: 'Rio Grande do Sul', SC: 'Santa Catarina', SE: 'Sergipe', SP: 'São Paulo',
  TO: 'Tocantins',
};

const UF_ALGORITHM_LABELS: Record<UfCode, string> = {
  AC: 'SEFAZ AC modulo 11',
  AL: 'SEFAZ AL weighted check digit',
  AM: 'SEFAZ AM modulo 11',
  AP: 'SEFAZ AP weighted check digit',
  BA: 'SEFAZ BA modulo 10/11 by range',
  CE: 'SEFAZ CE modulo 11',
  DF: 'SEFAZ DF dual modulo 11',
  ES: 'SEFAZ ES modulo 11',
  GO: 'SEFAZ GO weighted check digit',
  MA: 'SEFAZ MA modulo 11',
  MG: 'SEFAZ MG custom split + modulo 11',
  MS: 'SEFAZ MS modulo 11',
  MT: 'SEFAZ MT modulo 11',
  PA: 'SEFAZ PA modulo 11',
  PB: 'SEFAZ PB modulo 11',
  PE: 'SEFAZ PE weighted check digit',
  PI: 'SEFAZ PI modulo 11',
  PR: 'SEFAZ PR dual modulo 11',
  RJ: 'SEFAZ RJ modulo 11',
  RN: 'SEFAZ RN weighted check digit',
  RO: 'SEFAZ RO modulo 11',
  RR: 'SEFAZ RR modulo 9',
  RS: 'SEFAZ RS modulo 11',
  SC: 'SEFAZ SC modulo 11',
  SE: 'SEFAZ SE modulo 11',
  SP: 'SEFAZ SP dual check digits',
  TO: 'SEFAZ TO weighted check digit',
};

export default function IePlaygroundPage() {
  const [uf, setUf] = useState<UfCode>('SP');
  const [input, setInput] = useState(IE_SP_GOLDEN);

  const source = IE_OFFICIAL_SOURCE_URLS[uf];

  const stripped = useMemo(() => (input ? stripInscricaoEstadual(input) : ''), [input]);
  const validation = useMemo(
    () => (input ? validateInscricaoEstadual(input, { uf }) : null),
    [input, uf],
  );
  const formatted = useMemo(
    () => (input ? formatInscricaoEstadual(input, { uf }) : null),
    [input, uf],
  );

  const cliCommand = input
    ? `br-validators ie validate ${stripped || '<value>'} --uf ${uf}`
    : '';

  return (
    <ValidatorPanel title="Inscrição Estadual" description="Check digits only · all 27 UFs (UC-009)">
      <div>
        <Label htmlFor="ie-uf">UF</Label>
        <Select
          id="ie-uf"
          value={uf}
          onChange={(e) => {
            const next = e.target.value as UfCode;
            setUf(next);
            setInput(IE_SAMPLES[next]);
          }}
        >
          {IE_SUPPORTED_UFS.map((code) => (
            <option key={code} value={code}>
              {code} — {UF_LABELS[code]}
            </option>
          ))}
        </Select>
      </div>

      <DocumentInput
        id="ie-input"
        label="Input"
        value={input}
        onChange={(value) => {
          setInput(value);
        }}
        onGenerate={() => {
          setInput(generateIe(uf));
        }}
      />

      <ResultSection>
        <ResultRow label="Strip" value={stripped || '—'} />
        <ResultRow
          label="Valid"
          value={
            validation
              ? validation.ok
                ? `yes (${validation.uf})`
                : `no — ${validation.code}`
              : '—'
          }
        />
        <ResultRow label="Value" value={validation?.ok ? validation.value : '—'} />
        <ResultRow label="Format" value={formatted?.ok ? formatted.formatted : formatted?.ok === false ? formatted.message : '—'} />
        <ResultRow label="Algorithm" value={UF_ALGORITHM_LABELS[uf]} />
      </ResultSection>

      <OfficialSourceLink href={source} label={`Official source (${uf})`} />
      <CliCommandHint code={cliCommand} />
    </ValidatorPanel>
  );
}
