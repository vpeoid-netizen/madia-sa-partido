#!/usr/bin/env node
/**
 * Standalone production import (no TypeScript build required).
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'csv-parse/sync';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const REPO = join(ROOT, 'data/repository');
const CACHE = join(ROOT, 'data/cache');

const PARTIDO = new Set([
  'MADIA-MUN-CAR', 'MADIA-MUN-GAR', 'MADIA-MUN-GOA', 'MADIA-MUN-LAG', 'MADIA-MUN-PRE',
  'MADIA-MUN-SAG', 'MADIA-MUN-SJO', 'MADIA-MUN-SIR', 'MADIA-MUN-TIG', 'MADIA-MUN-TIN',
]);

const dryRun = process.argv.includes('--dry-run');

function readCsv(name) {
  const raw = readFileSync(join(REPO, name), 'utf8').replace(/^\uFEFF/, '');
  return parse(raw, { columns: true, skip_empty_lines: true, trim: true });
}

function normalizePhotoUrl(url) {
  if (!url?.trim()) return url;
  const trimmed = url.trim();
  const redirectMatch = trimmed.match(/Special:Redirect\/file\/(.+)$/i);
  if (redirectMatch) {
    const filename = decodeURIComponent(redirectMatch[1]);
    return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}?width=1600`;
  }
  if (trimmed.includes('commons.wikimedia.org') && !trimmed.includes('Special:FilePath')) {
    const fileMatch = trimmed.match(/\/wiki\/File:(.+)$/i);
    if (fileMatch) {
      return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(decodeURIComponent(fileMatch[1]))}?width=1600`;
    }
  }
  return trimmed;
}

function mapPhoto(row) {
  const perm = (row.permission_status || '').toLowerCase();
  let permission_status = 'creative_commons_reuse_allowed';
  if (perm.includes('required')) permission_status = 'permission_required';
  if (perm.includes('unclear')) permission_status = 'unclear_do_not_use';
  if (perm.includes('not required') || perm.includes('verified')) {
    permission_status = 'creative_commons_reuse_allowed';
  }
  const original = row.original_image_link ? normalizePhotoUrl(row.original_image_link) : row.original_image_link;
  return {
    photo_id: row.photo_id,
    related_record_id: row.related_record_id,
    municipality_id: row.municipality_id,
    permission_status,
    license: row.license,
    public_use_eligibility: permission_status === 'permission_required' ? 'no' : 'yes',
    required_attribution: row.required_attribution,
    storage_path: row.proposed_app_asset_path || row.saved_filename,
    original_url: original,
  };
}

function readJson(name, fallback) {
  const path = join(REPO, name);
  if (!existsSync(path)) {
    if (fallback !== undefined) return fallback;
    throw new Error(`ENOENT: missing required file ${name} in data/repository`);
  }
  return JSON.parse(readFileSync(path, 'utf8').replace(/^\uFEFF/, ''));
}

function buildSummariesFromPlaces(places, municipalities) {
  return municipalities.map((municipality) => {
    const municipalityPlaces = places.filter((p) => p.municipality_id === municipality.municipality_id);
    const attractions = municipalityPlaces.filter((p) => p.record_type === 'attraction');
    const slug = municipality.municipality_slug || String(municipality.municipality_name || '').toLowerCase().replace(/\s+/g, '-');
    return {
      municipality_id: municipality.municipality_id,
      municipality_name: municipality.municipality_name,
      municipality_slug: slug,
      official_psgc_code: municipality.official_psgc_code,
      short_description: municipality.short_description || '',
      featured_attraction: attractions[0]?.official_name || '',
      attraction_count: attractions.length,
      accommodation_count: municipalityPlaces.filter((p) => p.record_type === 'accommodation').length,
      restaurant_count: municipalityPlaces.filter((p) => p.record_type === 'restaurant').length,
      verified_transportation_route_count: municipalityPlaces.filter(
        (p) => p.record_type === 'transportation_route' && String(p.verification_status || '').toLowerCase().includes('verified'),
      ).length,
      tourism_service_count: municipalityPlaces.filter((p) => p.record_type === 'tourism_service').length,
      overall_data_verification_status: municipality.verification_status || 'PARTIALLY VERIFIED',
      municipality_page_route: municipality.route || `/municipalities/${slug}`,
    };
  });
}

function resolveSeedMeta() {
  if (existsSync(join(REPO, 'madia_seed_data.json'))) {
    return readJson('madia_seed_data.json');
  }
  if (existsSync(join(REPO, 'production_app_config.json'))) {
    const config = readJson('production_app_config.json');
    return { meta: { version: config.release || '0.11-production-experience' } };
  }
  return { meta: { version: '0.11-production-experience' } };
}

function mapPlace(row, record_type) {
  return {
    ...row,
    record_type,
    verification_status: row.verification_status || 'unverified',
  };
}

const municipalities = readCsv('municipalities.csv').filter((m) => PARTIDO.has(m.municipality_id));
const places = [
  ...readCsv('attractions.csv').map((r) => mapPlace(r, 'attraction')),
  ...readCsv('cultural_sites.csv').map((r) => mapPlace(r, 'cultural_site')),
  ...readCsv('accommodations.csv').map((r) => mapPlace(r, 'accommodation')),
  ...readCsv('restaurants.csv').map((r) => mapPlace(r, 'restaurant')),
  ...readCsv('transportation_routes.csv').map((r) => mapPlace(r, 'transportation_route')),
  ...readCsv('tourism_services.csv').map((r) => mapPlace(r, 'tourism_service')),
  ...readCsv('festivals_events.csv').map((r) => mapPlace(r, 'festival_event')),
  ...readCsv('municipal_facilities.csv').map((r) => mapPlace(r, 'facility')),
].filter((p) => PARTIDO.has(p.municipality_id));

let summaries;
if (existsSync(join(REPO, 'municipality_map_summaries.json'))) {
  summaries = readJson('municipality_map_summaries.json');
} else if (existsSync(join(ROOT, 'data/cache/madia-runtime.json'))) {
  summaries = JSON.parse(readFileSync(join(ROOT, 'data/cache/madia-runtime.json'), 'utf8')).summaries || [];
  writeFileSync(join(REPO, 'municipality_map_summaries.json'), JSON.stringify(summaries, null, 2));
} else {
  summaries = buildSummariesFromPlaces(places, municipalities);
  writeFileSync(join(REPO, 'municipality_map_summaries.json'), JSON.stringify(summaries, null, 2));
}

const photos = readCsv('photos.csv').map(mapPhoto);
const seed = resolveSeedMeta();
if (!existsSync(join(REPO, 'madia_seed_data.json'))) {
  writeFileSync(join(REPO, 'madia_seed_data.json'), JSON.stringify(seed, null, 2));
}

const runtime = {
  meta: {
    batch_id: `import-${Date.now()}`,
    repository_version: seed.meta?.version || '0.10-media-expansion',
    imported_at: new Date().toISOString(),
    timezone: 'Asia/Manila',
    currency: 'PHP',
  },
  municipalities,
  summaries,
  places,
  photos,
};

if (!dryRun) {
  mkdirSync(CACHE, { recursive: true });
  writeFileSync(join(CACHE, 'madia-runtime.json'), JSON.stringify(runtime, null, 2));
  syncBrandLogo();
}

function syncBrandLogo() {
  const candidates = [
    join(REPO, 'Logo', 'MADIA logo.png'),
    join(ROOT, 'Logo', 'MADIA logo.png'),
  ];
  const source = candidates.find((path) => existsSync(path));
  if (!source) return;

  const targets = [
    join(ROOT, 'apps/web/public/images/madia-logo.png'),
    join(ROOT, 'apps/web/src/app/icon.png'),
  ];

  for (const target of targets) {
    mkdirSync(dirname(target), { recursive: true });
    copyFileSync(source, target);
  }
}

console.log(JSON.stringify({
  dry_run: dryRun,
  municipalities: municipalities.length,
  places: places.length,
  photos: photos.length,
  cache: dryRun ? null : join(CACHE, 'madia-runtime.json'),
}, null, 2));
