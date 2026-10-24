# PROJECT STATE — Technocore Signal

## Phase 1 — Discovery
- **Done**: Read all official sources (flop.finance, docs.flop.network, technocore-chat API, sign.py/verify.py, contribution-mapper). Determined API endpoints, message sweep format, signature format (86-char base64url Ed25519, last char [AQgw]), DID format (did:key:z6Mk...). Wrote docs/SOURCES.md.
- **In progress**: Creating initial PROJECT_STATE.md and README.md
- **Next**: Commit and push Phase 1 artifacts; then begin Phase 2 (backend core)
- **Known issues**: Live API access unconfirmed yet; will build sample-data fallback if live endpoints are unreachable
- **Live vs sample**: Sample data mode will be used if live API is unavailable; clearly labeled

## Phase 2 — Backend core (no UI)
- **To do**: Room message fetching (live + sample-data adapter behind same interface), signature verification logic + status labels, open-questions rule, REST endpoints (GET /api/messages, GET /api/open-questions, GET /api/health)
- **Status**: Not started

## Phase 3 — Backend testing
- **To do**: Unit tests for signature status and open-questions rule; endpoint tests (curl/scripts); docs/BACKEND_TEST_REPORT.md
- **Status**: Not started

## Phase 4 — Frontend
- **To do**: Build UI against tested API; loading, empty, error states; dark navy/ice-white/accent color scheme
- **Status**: Not started

## Phase 5 — Integration check
- **To do**: Run full app, confirm UI renders real API output, confirm filters and badges match backend results
- **Status**: Not started

## Phase 6 — Final polish
- **To do**: Final README polish, assets/ folder for screenshots, final cleanup, summarize live vs sample
- **Status**: Not started