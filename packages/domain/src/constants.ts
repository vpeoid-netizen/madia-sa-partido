export const PARTIDO_MUNICIPALITY_IDS = [
  'MADIA-MUN-CAR',
  'MADIA-MUN-GAR',
  'MADIA-MUN-GOA',
  'MADIA-MUN-LAG',
  'MADIA-MUN-PRE',
  'MADIA-MUN-SAG',
  'MADIA-MUN-SJO',
  'MADIA-MUN-SIR',
  'MADIA-MUN-TIG',
  'MADIA-MUN-TIN',
] as const;

export const MUNICIPALITY_SLUGS = [
  'caramoan',
  'garchitorena',
  'goa',
  'lagonoy',
  'presentacion',
  'sagnay',
  'san-jose',
  'siruma',
  'tigaon',
  'tinambac',
] as const;

export type MunicipalityId = (typeof PARTIDO_MUNICIPALITY_IDS)[number];
export type MunicipalitySlug = (typeof MUNICIPALITY_SLUGS)[number];

export const DEFAULT_TIMEZONE = 'Asia/Manila';
export const DEFAULT_CURRENCY = 'PHP';

export const MUNICIPALITY_BY_SLUG: Record<
  MunicipalitySlug,
  { id: MunicipalityId; psgc: string; displayName: string }
> = {
  caramoan: { id: 'MADIA-MUN-CAR', psgc: '0501711000', displayName: 'Caramoan' },
  garchitorena: { id: 'MADIA-MUN-GAR', psgc: '0501714000', displayName: 'Garchitorena' },
  goa: { id: 'MADIA-MUN-GOA', psgc: '0501715000', displayName: 'Goa' },
  lagonoy: { id: 'MADIA-MUN-LAG', psgc: '0501717000', displayName: 'Lagonoy' },
  presentacion: { id: 'MADIA-MUN-PRE', psgc: '0501729000', displayName: 'Presentacion' },
  sagnay: { id: 'MADIA-MUN-SAG', psgc: '0501731000', displayName: 'Sagñay' },
  'san-jose': { id: 'MADIA-MUN-SJO', psgc: '0501733000', displayName: 'San Jose' },
  siruma: { id: 'MADIA-MUN-SIR', psgc: '0501735000', displayName: 'Siruma' },
  tigaon: { id: 'MADIA-MUN-TIG', psgc: '0501736000', displayName: 'Tigaon' },
  tinambac: { id: 'MADIA-MUN-TIN', psgc: '0501737000', displayName: 'Tinambac' },
};

export function isMunicipalitySlug(value: string): value is MunicipalitySlug {
  return (MUNICIPALITY_SLUGS as readonly string[]).includes(value);
}

export function normalizeSearchText(value?: string | null): string {
  if (!value) return '';
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}
