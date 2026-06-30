# Interactive Map Implementation Brief

The landing page must display the ten Partido municipalities as separate selectable polygons. Use `official_psgc_code` or `municipality_id` as the join key, never the display name alone.

Required interactions:
- fit all municipalities by default;
- hover and keyboard focus outline;
- first mobile tap selects without navigating;
- a separate Explore action opens `/municipalities/[slug]`;
- text municipality list and screen-reader labels;
- selection must not rely on color alone;
- reset clears selection and restores the full extent;
- reduced-motion support.

Use `municipality_map_summaries.json` for lightweight cards. Do not embed full establishment records in GeoJSON.
