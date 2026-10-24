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
- **Done**: 
  - Created docs/BACKEND_TEST_REPORT.md with full endpoint test results
  - Confirmed all 3 endpoints working against live Technocore room data
  - Signature verification logic implemented (Ed25519 over canonical string format)
  - Open questions rule computed (0 open questions found among 50 messages)
  - Verified live vs sample data: backend reading live data from https://technocore.chat/r/technocore
- **Status**: Completed
- **Next**: Align canonical string format for signature verification; configure test framework; begin Phase 4 frontend

## Phase 4 — Frontend
- **To do**: Build UI against tested API; loading, empty, error states; dark navy/ice-white/accent color scheme
- **Status**: Not started

## Phase 5 — Integration check
- **To do**: Run full app, confirm UI renders real API output, confirm filters and badges match backend results
- **Status**: Not started

## Phase 6 — Final polish
- **To do**: Final README polish, assets/ folder for screenshots, final cleanup, summarize live vs sample
- **Status**: Not started