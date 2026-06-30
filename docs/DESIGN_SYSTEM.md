# Design System — Liquid Glass

## Fonts

- **BARABARA** — wordmark, major titles, municipality names (place licensed files in `apps/web/public/fonts/`)
- **Manrope** — body, forms, metadata, prices

## Tokens

See `packages/ui/src/tokens.ts` for colors, glass surfaces, spacing, radius, and motion.

## Liquid glass usage

Apply `.madia-glass` to navigation, map controls, search, summary panels, bottom sheets, AI composer, and selected cards. Use opaque surfaces for long-form reading.

## Accessibility

- `prefers-reduced-motion` respected globally
- Backdrop-filter fallback to opaque white
- `data-simplified` and `data-high-contrast` document attributes for future settings UI

## i18n

Prepare strings for English, Filipino, and Bikol — use a message catalog in future iteration (not hard-coded in components long term).
