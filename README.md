# MADIA sa Partido


Mixed-Reality AI Destination and Itinerary Assistant for the Partido Area, Fourth Legislative District of Camarines Sur, Philippines.


MADIA is a production tourism platform for discovering attractions, exploring municipalities, building itineraries, and receiving grounded travel assistance. The public experience uses an elegant provincial visual system with warm liquid-glass surfaces, large destination photography, and responsive interaction.


## Authoritative project files


Read these first:


1. 00 MADIA App Builder Handoff
2. 01 MADIA Final App Database v1.0


The final app database contains 57 published attraction records. The landing page must display all 57 in one full-width attraction carousel. Each slide must show the attraction name, address, type, municipality, brief description, image or approved provincial fallback, Explore Attraction action, and Add to Itinerary action.


The interactive Partido map is a secondary exploration feature placed after the carousel or on a dedicated map route.


## Builder compatibility


The repository must remain portable across Cursor, Codex, Windsurf, Replit, VS Code, GitHub Codespaces, and comparable Node.js environments. Use standard repository files, environment variables, database migrations, seed scripts, and npm commands. Do not depend on hidden state or proprietary orchestration from one builder.


Required runtime: Node.js 20 or newer.


Core commands:


npm install
npm run setup
npm run dev
npm run build
npm run test
npm run lint


## Public experience rules


The application is final and production-facing. Do not display demo, sample, preliminary, draft, needs review, needs confirmation, confidence level, low confidence, unverified, missing data, limitation, issue note, or similar workflow language on public pages or in public APIs.


When an optional value is absent, omit the field or use the approved provincial image fallback. Never show broken-image frames, placeholder cards, raw technical identifiers, database errors, or internal source-review information.


Do not use BARABARA. Use a refined display serif such as Cormorant Garamond or Libre Baskerville, paired with Manrope or Inter.


## Required application scope


The complete frontend includes:


- all-attractions landing carousel;
- destination discovery and filtering;
- municipality and attraction pages;
- interactive map and accessible list alternative;
- search;
- AI tourism assistant;
- itinerary builder;
- saved attractions and trips;
- authentication and account pages;
- responsive mobile, tablet, and desktop layouts; and
- a role-protected administrator console.


The complete backend includes:


- PostgreSQL or Supabase schema and migrations;
- authentication and role-based authorization;
- public and administrator APIs;
- attractions, municipalities, media, accommodations, restaurants, festivals, tourism services, transportation, users, favorites, trips, itinerary days, itinerary stops, and audit records;
- media storage and attribution;
- search indexes;
- itinerary and AI grounding services;
- validation, security, rate limiting, monitoring, analytics, backups, and deployment configuration; and
- reproducible setup, migration, seed, test, and build commands.


## Design direction


The interface must feel elegant, calm, welcoming, and distinctly provincial. Use capiz white, coconut cream, forest green, coastal blue, muted terracotta, sand, and restrained antique gold. Apply subtle capiz or abaca texture at low opacity, generous whitespace, refined cards, soft shadows, fine borders, and restrained motion.


The quality target is comparable to leading travel applications such as Airbnb and Agoda, while maintaining an original MADIA identity.


## Acceptance requirement


A clean checkout must be installable, configurable, seeded, tested, built, and deployed using documented commands. All public routes and actions must work. The final application must not contain unfinished controls, dead links, temporary copy, or limitation documents in the active handoff.