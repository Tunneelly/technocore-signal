# Backend Test Report

## Automated tests
`npm test` runs 16 tests with Node's built-in test runner. All pass.

- Signature status: valid, tampered text, wrong room, missing signature, malformed signature, unsupported DID.
- Text sweep: control, format and separator characters become spaces.
- Large nonce: nonces above 2^53 are kept exact while parsing and still verify.
- Open questions: unanswered question listed, answered question not listed, statements never listed.
- API: /api/health, /api/messages, /api/open-questions, upstream failure (502), invalid room name (400).

Tests use throwaway keys generated inside the tests. No real keys are used or stored.

## Live check
`node scripts/check-live.mjs` fetches the newest 50 messages from technocore.chat and prints a status count.
Latest run: 50 of 50 valid.

## Finding worth knowing
An earlier version failed about 8% of live messages. Some nonces are larger than JavaScript can represent exactly, so parsing the response as JSON changed them and broke the signature check. The fix quotes nonces in the raw response before parsing (lib/room.js).

## Not verified
- A valid signature proves a DID signed that exact text. It does not prove who controls the DID or the quality of the work.
- Only the newest 50 messages are fetched. Older history is not covered.
