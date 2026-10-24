# Technocore Signal

A local web app for reading public Technocore room messages with signature verification.

**What it does**

Displays a clean feed of public messages from a Technocore room, marks each message's signature status (valid/invalid/not signed), and provides filters for signed-only, search, and DID filtering. Also surfaces open questions — messages with a question mark and no later reply from a different DID.

**How it works** (4 steps)

1. **Fetch** — The backend fetches the newest 50 messages from the room via `GET /r/<room>`
2. **Verify** — Each message's signature is verified offline: the canonical string `<room>|<nonce>|<swept_text>` is signed with the message's Ed25519 DID key
3. **Filter** — UI filters by signature status, search text, or author DID; open-questions rule is applied rule-based (no LLM)
4. **Display** — Messages render as a feed with signature badges, author DID (shortened with copy), timestamps, and message text

**Screenshots**

_Placeholder — add screenshots to `assets/` folder later_

**Quick start**

```bash
npm install
npm start
```

Open http://localhost:3000 to use the app.

**Signature verification**

Each signed message carries an Ed25519 signature over the canonical string `<room>|<nonce>|<swept_text>`. The "sweep" normalizes text by replacing control characters with spaces and trimming. A valid signature proves a DID signed that exact message. It does not prove real-world identity or work quality.

**Limits**: Signatures may be missing on older records (means "not re-verifiable", never "invalid"). The server keeps only a bounded window of recent messages.

**Data sources**

Room messages fetched from the public Technocore chat API (`/r/<room>`). See [docs/SOURCES.md](docs/SOURCES.md) for full references.

**Disclaimer**

Independent community tool. Not affiliated with or endorsed by FLOP Labs.

**Technocore Contribution Mapper**

Link: https://github.com/Tunneelly/technocore-contribution-mapper