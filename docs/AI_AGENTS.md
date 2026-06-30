# AI Agents

## MVP implementation

- **Grounded concierge** (`packages/ai/src/concierge.ts`) — rule-based retrieval over MADIA records
- **AI phrasing** (`packages/ai/src/providers.ts`) — optional natural-language answers from free/local providers
- Server route `/api/ai/chat`

## Reliability rules

- No invented entities, prices, schedules, or contacts
- Report `Information not yet available` for missing fields
- Return `grounded_records` with verification metadata

## AI providers (automatic)

**Default: local Ollama** (free, no API key, runs on your Mac).

```bash
# One-time: Ollama is installed under madia-platform/.tools/ollama/
# Start local AI + pull model:
npm run start:ollama

# Dev server auto-starts Ollama via predev hook
npm run dev
```

Configured in `apps/web/.env`:
- `AI_PROVIDER=ollama`
- `OLLAMA_MODEL=llama3.2:1b` (lightweight, good for MacBook Air)

Optional cloud fallbacks (set `AI_PROVIDER=auto`):
- **Groq** — `GROQ_API_KEY` from https://console.groq.com
- **Google Gemini** — `GEMINI_API_KEY` from https://aistudio.google.com
- **OpenAI** — `AI_API_KEY` (paid)

If no AI engine is reachable, the assistant still answers using grounded MADIA records.

## Planned agents

Orchestrator, itinerary planner, budget, route, verification, contribution assistant, moderation, admin data-quality — see master specification. Tool names exported as `AI_TOOL_NAMES`.
