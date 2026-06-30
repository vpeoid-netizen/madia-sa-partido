# MADIA Design System — Elegant Provincial Liquid Glass

## Brand character

MADIA should feel calm, refined, welcoming, and rooted in Partido. The visual language combines contemporary travel-platform clarity with provincial details inspired by capiz, abaca, coastal water, forested hills, warm sand, terracotta, and local wood.

## Typography

- **Cormorant Garamond** — display headings, attraction names, municipality names, and branded moments
- **Manrope** — navigation, body text, forms, metadata, prices, and utility controls

Both fonts are loaded through `next/font/google`. No proprietary font file is required.

## Color tokens

- Deep forest: `#123126`
- Forest: `#1F4938`
- Coastal blue: `#386F78`
- Muted terracotta: `#B8684E`
- Antique gold: `#B08B4F`
- Coconut cream: `#F5EFE3`
- Capiz white: `#FFFDF7`
- Warm sand: `#DFCEB1`
- Ink: `#203029`

## Liquid glass

Use warm translucent surfaces for navigation, compact controls, itinerary panels, filters, and selected cards. Photography remains the visual focus. Avoid oversized floating panels, excessive glow, neon color, or cold blue glass.

## Photography

- Prefer wide, cinematic tourism photography.
- Use `object-fit: cover` with focal-point-aware cropping.
- Keep overlays restrained and readable.
- Display approved attribution discreetly.
- Use municipality-level scenic imagery when a destination-specific image is unavailable.

## Motion

- Carousel transitions use gentle fades or restrained movement.
- Autoplay pauses on hover, keyboard focus, touch interaction, and reduced-motion preference.
- All motion respects `prefers-reduced-motion`.

## Accessibility

- Minimum 44px touch targets
- Visible focus states
- Keyboard-operable carousel controls
- Swipe support on touch screens
- Semantic headings and landmarks
- Text contrast maintained over imagery
- Opaque fallback for browsers without backdrop filters
