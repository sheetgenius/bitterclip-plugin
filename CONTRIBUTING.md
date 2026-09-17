# Contributing to the BitterClip plugin

Thanks for helping make agent-led video editing clearer, safer, and more useful.
This repository contains the open-source plugin package, not the hosted
BitterClip application.

## Quick start

Use a current Node.js/npm environment, then run from the repository root:

```bash
npm ci
npm test
npm run verify
```

`npm run verify` validates the portable package, builds the Claude adapter, and
checks reproducible archives. If the Claude CLI is present, it also runs native
Claude validation.

## Make a focused change

- Keep `plugin/` as the canonical portable Agent Plugins source.
- Keep host adapters generated; do not maintain separate copies of the skills.
- Keep each editorial behavior owned by one canonical skill.
- Preserve source timing, permissions, exact Clip/revision custody, draft-only
  intent, retained Exports, and the publishing confirmation gate.
- Never add credentials, tokens, customer media, private fixtures, account
  identifiers, or development endpoints.
- Avoid hardcoded pricing or host-availability claims that can drift. Link to
  the product or official host documentation instead.

Changes to a skill should begin with an observable creator outcome and include a
workflow case when behavior changes. Documentation changes should keep relative
links valid both in the repository and, for `plugin/README.md`, inside generated
portable and Claude packages.

## Before requesting review

Run:

```bash
npm test
npm run verify
git diff --check
```

Then summarize:

- the creator-visible outcome;
- the files and package surfaces changed;
- the checks that actually ran;
- any host installation, OAuth, playback, listening, or publishing boundary
  that was not tested.

Validation is not customer acceptance. For editorial changes, the strongest
proof is a real first cut, an ordinary creative correction applied to the same
Clip, and watched/listened playback plus Download of both exact Exports.

## Security, licensing, and marks

Report security issues privately through [SECURITY.md](SECURITY.md), not a public
issue. Contributions to our original package are accepted under the
[MIT License](LICENSE). Changes to third-party material retain its applicable
upstream license.
Vendored schema and dependency terms are listed in
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). Use of BitterClip names and
marks is governed by [TRADEMARKS.md](TRADEMARKS.md).

For product questions, visit
[BitterClip Support](https://company.sheetgenius.com/bitterclip/support/) or
email [hello@bitterclip.com](mailto:hello@bitterclip.com).
