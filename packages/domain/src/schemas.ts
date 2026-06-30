import { z } from 'zod';

export const VerificationStatusSchema = z.enum([
  'verified',
  'partially_verified',
  'unverified',
  'closed_or_inactive',
  'duplicate',
  'requires_manual_review',
]);

export const ConfidenceLevelSchema = z.enum(['high', 'medium', 'low']);

export const MediaPermissionSchema = z.enum([
  'public_domain',
  'creative_commons_reuse_allowed',
  'government_source_reuse_terms_verified',
  'owner_permission_documented',
  'permission_required',
  'unclear_do_not_use',
]);

export const PublishingStatusSchema = z.enum([
  'draft',
  'published',
  'archived',
  'quarantined',
  'admin_only',
]);

export const MunicipalitySchema = z.object({
  municipality_id: z.string(),
  municipality_name: z.string(),
  municipality_name_ascii: z.string(),
  municipality_slug: z.string(),
  official_psgc_code: z.string(),
  code: z.string().optional(),
  route: z.string(),
  display_order: z.number().optional(),
  province_name: z.string().optional(),
  verification_status: z.string(),
  confidence_level: z.string().optional(),
  primary_source: z.string().optional(),
  date_accessed: z.string().optional(),
});

export const MunicipalityMapSummarySchema = z.object({
  municipality_id: z.string(),
  municipality_name: z.string(),
  municipality_slug: z.string(),
  official_psgc_code: z.string(),
  short_description: z.string().optional(),
  cover_photo_id: z.string().nullable().optional(),
  featured_attraction: z.string().optional(),
  attraction_count: z.number().default(0),
  accommodation_count: z.number().default(0),
  restaurant_count: z.number().default(0),
  verified_transportation_route_count: z.number().default(0),
  tourism_service_count: z.number().default(0),
  overall_data_verification_status: z.string(),
  municipality_page_route: z.string(),
});

export const PlaceSchema = z.object({
  record_id: z.string(),
  municipality_id: z.string(),
  official_psgc_code: z.string().optional(),
  municipality: z.string().optional(),
  category: z.string(),
  subcategory: z.string().optional(),
  official_name: z.string(),
  alternate_or_local_name: z.string().optional(),
  barangay: z.string().optional(),
  complete_address: z.string().optional(),
  latitude: z.union([z.number(), z.string()]).optional().nullable(),
  longitude: z.union([z.number(), z.string()]).optional().nullable(),
  short_description: z.string().optional(),
  full_description: z.string().optional(),
  entrance_fee: z.string().optional(),
  price_range: z.string().optional(),
  operating_status: z.string().optional(),
  recommended_visit_duration: z.string().optional(),
  best_time_to_visit: z.string().optional(),
  verification_status: z.string(),
  confidence_level: z.string().optional(),
  cover_photo_id: z.string().optional(),
  application_page_route: z.string().optional(),
  primary_source: z.string().optional(),
  date_accessed: z.string().optional(),
  date_information_last_confirmed: z.string().optional(),
  record_type: z.enum([
    'attraction',
    'cultural_site',
    'restaurant',
    'accommodation',
    'transportation_route',
    'tourism_service',
    'festival_event',
    'facility',
  ]),
});

export const PhotoSchema = z.object({
  photo_id: z.string(),
  related_record_id: z.string().optional(),
  municipality_id: z.string().optional(),
  permission_status: z.string().optional(),
  license: z.string().optional(),
  public_use_eligibility: z.string().optional(),
  required_attribution: z.string().optional(),
  storage_path: z.string().optional(),
  original_url: z.string().optional(),
});

export const TripItemSchema = z.object({
  id: z.string(),
  record_id: z.string(),
  place_name: z.string(),
  municipality_slug: z.string(),
  activity: z.string(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  duration_minutes: z.number().optional(),
  estimated_cost_php: z.number().optional(),
  cost_confidence: ConfidenceLevelSchema.optional(),
  verification_status: z.string().optional(),
  notes: z.string().optional(),
});

export const TripDaySchema = z.object({
  day_number: z.number(),
  date: z.string().optional(),
  items: z.array(TripItemSchema),
  subtotal_php: z.number().optional(),
});

export const TripSchema = z.object({
  id: z.string(),
  title: z.string(),
  municipality_slugs: z.array(z.string()),
  days: z.array(TripDaySchema),
  traveler_count: z.number().default(1),
  total_estimated_cost_php: z.number().optional(),
  assumptions: z.array(z.string()).default([]),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Municipality = z.infer<typeof MunicipalitySchema>;
export type MunicipalityMapSummary = z.infer<typeof MunicipalityMapSummarySchema>;
export type Place = z.infer<typeof PlaceSchema>;
export type Photo = z.infer<typeof PhotoSchema>;
export type Trip = z.infer<typeof TripSchema>;
export type TripDay = z.infer<typeof TripDaySchema>;
export type TripItem = z.infer<typeof TripItemSchema>;
export type VerificationStatus = z.infer<typeof VerificationStatusSchema>;
export type MediaPermission = z.infer<typeof MediaPermissionSchema>;

export function normalizeVerificationStatus(raw: string): VerificationStatus {
  const normalized = raw.toLowerCase().replace(/\s+/g, '_');
  const parsed = VerificationStatusSchema.safeParse(normalized);
  if (parsed.success) return parsed.data;
  if (normalized.includes('partial')) return 'partially_verified';
  if (normalized.includes('manual')) return 'requires_manual_review';
  return 'unverified';
}

export function isPublicPhoto(photo: Photo): boolean {
  const status = (photo.permission_status || '').toLowerCase();
  if (status === 'permission_required' || status === 'unclear_do_not_use') return false;
  const eligibility = (photo.public_use_eligibility || '').toLowerCase();
  if (eligibility === 'no' || eligibility === 'false') return false;
  return true;
}

export function parseCoordinate(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const num = typeof value === 'number' ? value : Number(String(value).trim());
  return Number.isFinite(num) ? num : null;
}
