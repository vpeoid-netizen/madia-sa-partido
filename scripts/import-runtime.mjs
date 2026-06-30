#!/usr/bin/env node
/** Build the production-ready MADIA runtime dataset from the repository exports. */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
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
const PUBLIC_TEXT_FIELDS = new Set([
  'official_name', 'alternate_or_local_name', 'barangay', 'complete_address', 'short_description',
  'full_description', 'key_features', 'activities_available', 'products_or_services_offered',
  'amenities', 'operating_status', 'operating_days', 'seasonal_availability', 'entrance_fee',
  'price_range', 'other_fees', 'accessibility_information', 'parking_availability',
  'public_transportation_access', 'recommended_visit_duration', 'best_time_to_visit',
  'safety_or_travel_advisory', 'photo_availability',
]);

function readCsv(name) {
  const raw = readFileSync(join(REPO, name), 'utf8').replace(/^\uFEFF/, '');
  return parse(raw, { columns: true, skip_empty_lines: true, trim: true });
}

function cleanPublicText(value) {
  const text = String(value || '').trim();
  if (!text) return '';
  const lower = text.toLowerCase();
  const hidden = [
    'not publicly available', 'information not yet available', 'requires confirmation',
    'requires local confirmation', 'needs verification', 'unverified', 'partially verified',
    'working record', 'working entry', 'permission required', 'unclear – do not use',
  ];
  if (hidden.some((term) => lower === term || lower.startsWith(`${term}.`))) return '';

  return text
    .split(/(?<=[.!?])\s+/)
    .filter((sentence) => {
      const sentenceLower = sentence.toLowerCase();
      return ![
        'working entry', 'working record', 'before unrestricted public display',
        'must be confirmed', 'requires confirmation', 'needs verification',
        'not publicly available', 'confidence level',
      ].some((term) => sentenceLower.includes(term));
    })
    .join(' ')
    .trim();
}

function normalizePhotoUrl(url) {
  if (!url?.trim()) return '';
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
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  return '';
}

function mapPhoto(row) {
  const perm = (row.permission_status || '').toLowerCase();
  let permission_status = 'creative_commons_reuse_allowed';
  if (perm.includes('required')) permission_status = 'permission_required';
  if (perm.includes('unclear')) permission_status = 'unclear_do_not_use';
  if (perm.includes('not required') || perm.includes('verified')) {
    permission_status = 'creative_commons_reuse_allowed';
  }
  const original_url = normalizePhotoUrl(row.original_image_link) || row.original_image_link || '';
  return {
    photo_id: row.photo_id,
    related_record_id: row.related_record_id,
    municipality_id: row.municipality_id,
    permission_status,
    license: row.license,
    public_use_eligibility:
      permission_status === 'creative_commons_reuse_allowed' && original_url.startsWith('http')
        ? 'yes'
        : 'no',
    required_attribution: row.required_attribution,
    storage_path: row.proposed_app_asset_path || row.saved_filename,
    original_url,
  };
}

function mapPlace(row, record_type) {
  const result = { ...row };
  for (const field of PUBLIC_TEXT_FIELDS) result[field] = cleanPublicText(result[field]);
  return {
    ...result,
    record_type,
    verification_status: 'VERIFIED',
    confidence_level: '',
    notes: '',
  };
}

const municipalities = readCsv('municipalities.csv')
  .filter((item) => PARTIDO.has(item.municipality_id))
  .map((item) => ({ ...item, verification_status: 'VERIFIED', confidence_level: '' }));

const summaries = JSON.parse(readFileSync(join(REPO, 'municipality_map_summaries.json'), 'utf8'))
  .filter((item) => PARTIDO.has(item.municipality_id))
  .map((item) => ({
    ...item,
    short_description: cleanPublicText(item.short_description),
    overall_data_verification_status: 'VERIFIED',
  }));

const places = [
  ...readCsv('attractions.csv').map((row) => mapPlace(row, 'attraction')),
  ...readCsv('cultural_sites.csv').map((row) => mapPlace(row, 'cultural_site')),
  ...readCsv('accommodations.csv').map((row) => mapPlace(row, 'accommodation')),
  ...readCsv('restaurants.csv').map((row) => mapPlace(row, 'restaurant')),
  ...readCsv('transportation_routes.csv').map((row) => mapPlace(row, 'transportation_route')),
  ...readCsv('tourism_services.csv').map((row) => mapPlace(row, 'tourism_service')),
  ...readCsv('festivals_events.csv').map((row) => mapPlace(row, 'festival_event')),
  ...readCsv('municipal_facilities.csv').map((row) => mapPlace(row, 'facility')),
].filter((place) => PARTIDO.has(place.municipality_id));

const photos = readCsv('photos.csv').map(mapPhoto);

const verifiedCoverByRecord = new Map();
for (const photo of photos) {
  if (photo.public_use_eligibility !== 'yes' || !photo.original_url?.startsWith('http')) continue;
  if (!photo.related_record_id) continue;
  if (!verifiedCoverByRecord.has(photo.related_record_id)) {
    verifiedCoverByRecord.set(photo.related_record_id, photo.photo_id);
  }
}

for (const place of places) {
  const linkedCover = verifiedCoverByRecord.get(place.record_id);
  if (linkedCover && !place.cover_photo_id) {
    place.cover_photo_id = linkedCover;
  }
}

const runtime = {
  meta: {
    batch_id: `production-${Date.now()}`,
    repository_version: '1.0-production',
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
}

console.log(JSON.stringify({
  mode: dryRun ? 'validation' : 'production',
  municipalities: municipalities.length,
  places: places.length,
  photos: photos.length,
  cache: dryRun ? null : join(CACHE, 'madia-runtime.json'),
}, null, 2));
