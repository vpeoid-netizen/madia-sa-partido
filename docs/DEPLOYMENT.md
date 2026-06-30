# Deployment

## Web (Vercel or Node)

1. Set environment variables from `.env.example`
2. Run `npm run import:data` in CI or release pipeline
3. Apply Supabase migrations: `supabase db push`
4. `npm run build --workspace=@madia/web`
5. Deploy `apps/web`

## Supabase

- Enable PostGIS extension
- Configure storage buckets for licensed media only
- Set RLS policies from migrations

## Data releases

Each production data release should:

1. Record repository version and checksums
2. Run dry-run import
3. Create import batch and snapshot
4. Invalidate municipality summary caches

## PWA

`manifest.webmanifest` is served from `apps/web/public/`. Add icon assets before store submission.
