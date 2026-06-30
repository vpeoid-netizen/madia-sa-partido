import { parse } from 'csv-parse/sync';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  MunicipalitySchema,
  MunicipalityMapSummarySchema,
  PlaceSchema,
  PhotoSchema,
  PARTIDO_MUNICIPALITY_IDS,
  type Place,
} from '@madia/domain';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../../..');
const REPO_DIR = join(ROOT, 'data/repository');
const CACHE_DIR = join(ROOT, 'data/cache');

export interface ImportReport {
  batch_id: string;
  repository_version: string;
  started_at: string;
  completed_at: string;
  dry_run: boolean;
  files: Array<{ name: string; checksum: string; status: 'ok' | 'missing' | 'error'; message?: string }>;
  counts: {
    inserted: number;
    updated: number;
    unchanged: number;
    rejected: number;
    quarantined: number;
  };
  errors: string[];
  warnings: string[];
}

function checksum(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}

function readCsv(path: string): Record<string, string>[] {
  const content = readFileSync(path, 'utf8');
  return parse(content, { columns: true, skip_empty_lines: true, trim: true });
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T;
}

function slugifyRoute(route?: string, name?: string): string {
  if (route) {
    const parts = route.split('/').filter(Boolean);
    return parts[parts.length - 1] || '';
  }
  return (name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function mapPlaceRow(row: Record<string, string>, recordType: Place['record_type']): Place {
  const route = row.application_page_route || '';
  return PlaceSchema.parse({
    ...row,
    record_id: row.record_id,
    municipality_id: row.municipality_id,
    official_name: row.official_name,
    category: row.category,
    verification_status: row.verification_status || 'unverified',
    application_page_route: route,
    record_type: recordType,
  });
}

export function runImport(options: { dryRun?: boolean } = {}): ImportReport {
  const dryRun = options.dryRun ?? false;
  const startedAt = new Date().toISOString();
  const batchId = `import-${Date.now()}`;
  const errors: string[] = [];
  const warnings: string[] = [];
  const files: ImportReport['files'] = [];

  const requiredFiles = [
    'municipalities.csv',
    'municipality_map_summaries.json',
    'madia_seed_data.json',
    'attractions.csv',
    'cultural_sites.csv',
    'accommodations.csv',
    'restaurants.csv',
    'transportation_routes.csv',
    'tourism_services.csv',
    'festivals_events.csv',
    'municipal_facilities.csv',
    'photos.csv',
    'sources.csv',
    'records_requiring_verification.csv',
  ];

  for (const name of requiredFiles) {
    const path = join(REPO_DIR, name);
    if (!existsSync(path)) {
      files.push({ name, checksum: '', status: 'missing', message: 'Required repository file not found' });
      warnings.push(`Missing file: ${name}`);
      continue;
    }
    const content = readFileSync(path, 'utf8');
    files.push({ name, checksum: checksum(content), status: 'ok' });
  }

  if (files.some((f) => f.status === 'missing')) {
    return {
      batch_id: batchId,
      repository_version: 'unknown',
      started_at: startedAt,
      completed_at: new Date().toISOString(),
      dry_run: dryRun,
      files,
      counts: { inserted: 0, updated: 0, unchanged: 0, rejected: 0, quarantined: 0 },
      errors: ['Cannot import until required repository files are present'],
      warnings,
    };
  }

  const municipalities = readCsv(join(REPO_DIR, 'municipalities.csv')).map((row) =>
    MunicipalitySchema.parse(row),
  );
  const invalidMunicipalities = municipalities.filter(
    (m) => !PARTIDO_MUNICIPALITY_IDS.includes(m.municipality_id as never),
  );
  if (invalidMunicipalities.length) {
    errors.push(`Found ${invalidMunicipalities.length} municipalities outside Partido scope`);
  }

  const summaries = readJson<unknown[]>(join(REPO_DIR, 'municipality_map_summaries.json')).map((row) =>
    MunicipalityMapSummarySchema.parse(row),
  );

  const places: Place[] = [
    ...readCsv(join(REPO_DIR, 'attractions.csv')).map((row) => mapPlaceRow(row, 'attraction')),
    ...readCsv(join(REPO_DIR, 'cultural_sites.csv')).map((row) => mapPlaceRow(row, 'cultural_site')),
    ...readCsv(join(REPO_DIR, 'accommodations.csv')).map((row) => mapPlaceRow(row, 'accommodation')),
    ...readCsv(join(REPO_DIR, 'restaurants.csv')).map((row) => mapPlaceRow(row, 'restaurant')),
    ...readCsv(join(REPO_DIR, 'transportation_routes.csv')).map((row) =>
      mapPlaceRow(row, 'transportation_route'),
    ),
    ...readCsv(join(REPO_DIR, 'tourism_services.csv')).map((row) => mapPlaceRow(row, 'tourism_service')),
    ...readCsv(join(REPO_DIR, 'festivals_events.csv')).map((row) => mapPlaceRow(row, 'festival_event')),
    ...readCsv(join(REPO_DIR, 'municipal_facilities.csv')).map((row) => mapPlaceRow(row, 'facility')),
  ];

  const quarantined: string[] = [];
  const validPlaces = places.filter((place) => {
    if (!PARTIDO_MUNICIPALITY_IDS.includes(place.municipality_id as never)) {
      quarantined.push(place.record_id);
      return false;
    }
    return true;
  });

  const photos = readCsv(join(REPO_DIR, 'photos.csv'))
    .map((row) => {
      try {
        return PhotoSchema.parse({
          photo_id: row.photo_id,
          related_record_id: row.related_record_id,
          municipality_id: row.municipality_id,
          permission_status: row.permission_status,
          license: row.license,
          public_use_eligibility: row.public_use_eligibility,
          required_attribution: row.required_attribution,
          storage_path: row.storage_path,
          original_url: row.original_url || row.source_original_file_url,
        });
      } catch {
        quarantined.push(row.photo_id || 'unknown-photo');
        return null;
      }
    })
    .filter(Boolean) as ReturnType<typeof PhotoSchema.parse>[];

  const seed = readJson<{ meta?: { version?: string } }>(join(REPO_DIR, 'madia_seed_data.json'));
  const repositoryVersion = seed.meta?.version || '0.10-media-expansion';

  const runtime = {
    meta: {
      batch_id: batchId,
      repository_version: repositoryVersion,
      imported_at: new Date().toISOString(),
      timezone: 'Asia/Manila',
      currency: 'PHP',
    },
    municipalities,
    summaries,
    places: validPlaces,
    photos,
    import_report: {
      quarantined_count: quarantined.length,
      place_count: validPlaces.length,
      municipality_count: municipalities.length,
    },
  };

  if (!dryRun) {
    mkdirSync(CACHE_DIR, { recursive: true });
    writeFileSync(join(CACHE_DIR, 'madia-runtime.json'), JSON.stringify(runtime, null, 2));
    writeFileSync(
      join(CACHE_DIR, 'latest-import-report.json'),
      JSON.stringify(
        {
          batch_id: batchId,
          repository_version: repositoryVersion,
          imported_at: runtime.meta.imported_at,
          quarantined,
        },
        null,
        2,
      ),
    );
  }

  return {
    batch_id: batchId,
    repository_version: repositoryVersion,
    started_at: startedAt,
    completed_at: new Date().toISOString(),
    dry_run: dryRun,
    files,
    counts: {
      inserted: validPlaces.length,
      updated: 0,
      unchanged: 0,
      rejected: errors.length,
      quarantined: quarantined.length,
    },
    errors,
    warnings,
  };
}
