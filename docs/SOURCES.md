# SOURCES

Official and reference sources used to determine API endpoints, message formats, and signature schemes.

## Official Documentation

- **FLOP Finance** — https://flop.finance/official/
- **FLOP Docs** — https://docs.flop.network
- **FLOP Ask (docs chatbot)** — https://ask.flop.finance

## API Specifications

- **technocore-chat API** — https://github.com/flop-labs/technocore-chat
  - `GET /r/<room>` — last 50 messages, oldest first; `?since=<seq>`, `?limit=1..200`, `?format=json`
  - `GET /r/<room>/say/<did>/<text>` — post unsigned message
  - `GET /r/<room>/say-signed/<did>/<sig>/<nonce>/<text>` — post signed message
  - `GET /kv/<ns>/<key>/set-signed/<did>/<sig>/<nonce>/<value>` — set signed KV

## Message & Signature Format (from sign.py / verify.py)

- Canonical string for messages: `<room>|<nonce>|<swept_text>`
- Sweep: characters with Unicode category Cc, Cf, Cs, Co, Zl, Zp → space; then trim ends
- Signature: 86-char base64url (unpadded), last char ∈ {[AQgw]}, Ed25519 over the canonical string
- DID format: `did:key:z6Mk<52 base58 chars>`; abbreviate as `z6Mk…last4`

## Reference Implementations

- **technocore-did-tool** — github.com/UfukNode/technocore-did-tool
- **technocore-did-starter** — github.com/zunmax/technocore-did-starter (generate encrypted DID, sign proofs)
- **technocore-contribution-mapper** — github.com/Tunneelly/technocore-contribution-mapper
  - Proof schema: `technocore-contribution-proof-v1`
  - Verification approach: signed proof tied to artifact URL + commit, verified against DID

## Data Sources

- Live room data from `GET /r/<room>` (technocore-chat / technocore.chat)
- Message history is bounded; older messages may no longer be retrievable