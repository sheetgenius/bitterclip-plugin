<p align="center">
  <img src="plugin/assets/bitterclip-icon.svg" alt="BitterClip" width="88" height="88">
</p>

<h1 align="center">BitterClip for agents</h1>

<p align="center"><strong>Turn a recording into a finished clip by describing what you want.</strong></p>

<p align="center">
  <a href="https://bitterclip.com/">BitterClip</a> ·
  <a href="docs/installation.md">Install</a> ·
  <a href="docs/agent-guide.md">Agent guide</a> ·
  <a href="https://bitterclip.com/docs">Product docs</a> ·
  <a href="https://bitterclip.com/llms.txt">Agent-readable docs</a> ·
  <a href="https://company.sheetgenius.com/bitterclip/support/">Support</a>
</p>

BitterClip gives Claude, Codex, and other compatible agents the context and
tools to make real video edits. Tell the agent the story you want to tell. It
finds supported moments in your Recording, makes a purposeful first cut, and
returns an editable Clip with an exact playable and downloadable Export.

Then keep talking:

> Make a concise clip about why customer interviews changed our roadmap. Keep
> the opening direct and make it work in portrait.

> The opening still takes too long. Start with the strongest claim and keep the
> customer's explanation intact.

That feedback revises the same Clip. The earlier Export stays intact, and the
new Download belongs to the new revision.

## Install the pilot plugin

You need a BitterClip account with an uploaded, ready Recording and a host that
supports one of the install routes below. This package does not include a free
hosted-service entitlement.

For Claude web, [download the v0.1.3 Claude ZIP](https://github.com/sheetgenius/bitterclip-plugin/releases/download/v0.1.3/bitterclip-0.1.3-claude-plugin.zip)
and upload it at **Customize → Plugins → Add plugin → Upload plugin**. No source
build is needed. The [GitHub pilot prerelease](https://github.com/sheetgenius/bitterclip-plugin/releases/tag/v0.1.3)
also includes the portable Agent Plugins ZIP and release identity record.

### Build from source

For Claude Code or a local portable marketplace, start with the source checkout:

```bash
git clone https://github.com/sheetgenius/bitterclip-plugin.git
cd bitterclip-plugin
npm ci
npm test
npm run verify
```

The public default branch currently builds the released three-skill 0.1.3
package. The four-skill 0.2.0 FX Studio work is a local review candidate, not a
public source-build or GitHub download path.

For Claude Code, install the generated local marketplace:

```bash
claude plugin marketplace add ./dist/claude
claude plugin install bitterclip@bitterclip
```

You can also upload a locally built Claude archive to Claude web when that
candidate has been explicitly approved for installation. The available GitHub
release remains 0.1.3; the 0.2.0 archive is a local candidate, not a download.

For Codex, use the unpacked portable package at `dist/portable/bitterclip`
through the documented local marketplace route. The Agent Plugins ZIP is a
release artifact, not a claimed universal import flow. See
[Installation](docs/installation.md#codex-and-chatgpt-desktop).

Your host handles BitterClip sign-in over OAuth. There are no API keys to paste
into the package.

## What the agent does

```text
Recording
  → understand the relevant material
  → choose source-supported moments
  → make one editable Clip
  → render one exact Export
  → take creative feedback
  → improve the same Clip
```

You provide the intent and the creative correction. The agent handles source
search, media inspection, timing evidence, edit sequencing, rendering, and
recovery. You should not need to supply timestamps or choreograph tools.

The local 0.2.0 candidate includes four focused skills:

- [`get-started`](plugin/skills/get-started/SKILL.md) finds a ready Episode or
  helps continue a first upload.
- [`make-a-clip`](plugin/skills/make-a-clip/SKILL.md) creates or revises a
  source-backed Clip.
- [`review-and-export`](plugin/skills/review-and-export/SKILL.md) binds review,
  playback, and Download to the exact current Export.
- [`fx-studio`](plugin/skills/fx-studio/SKILL.md) authors and refines a
  standalone programmable FX Studio scene before separately supported use in a
  production.

See the [Agent guide](docs/agent-guide.md) for good requests and the full working
contract.

## What changes, and what stays true

| You ask for | BitterClip changes | BitterClip preserves |
| --- | --- | --- |
| A first cut | A new editable Clip and, unless you ask for draft-only, a private Export | The original Recording and its source timing |
| A correction | The same Clip gets a new revision and, when finished-result intent remains, a new exact Export | Earlier Exports, source lineage, and draft-only intent |
| Review only | Nothing unless you ask for an edit | The current Clip, Export, and permissions |
| Publishing | A review handoff is prepared | Nothing is dispatched without the exact Export, destination, and fresh confirmation |

## What this repository contains

This is an open-source integration package: skills plus configuration for the
hosted BitterClip OAuth MCP service at `https://app.bitterclip.com/mcp`. It does
not contain the hosted BitterClip application, customer media, credentials, a
local MCP server, or a free hosted-service entitlement.

BitterClip is a product of [SheetGenius, Inc.](https://company.sheetgenius.com).
Learn about the product on the [website](https://bitterclip.com/), read the
[assistant overview](https://bitterclip.com/docs/assistants/overview/), give an
agent the [plain-text product map](https://bitterclip.com/llms.txt), or see
current plans in the [homepage pricing section](https://bitterclip.com/#pricing).

## Host support

Current as of 2026-09-12:

| Host | Package path | Current evidence |
| --- | --- | --- |
| Claude web | Generated Claude ZIP | Private 0.1.2 install showed all three skills and the existing connected BitterClip connector; an explicit get-started invocation ran. |
| Claude Code | Generated local marketplace | Isolated install checked with Claude Code 2.1.269. |
| Codex / ChatGPT desktop | Portable Agent Plugins package through a local or repo marketplace | The package follows the documented portable schema; a fresh BitterClip install and automatic skill-discovery journey have not yet been run. |
| ChatGPT connector | Hosted MCP connection | Connector use is separate from installing the three packaged skills; no public BitterClip plugin listing is claimed. |

The local 0.2.0 candidate adds a fourth FX Studio skill. It has not been
installed in a host; the dated 0.1.2 host evidence above remains unchanged. The
available GitHub release remains 0.1.3. See
[Installation](docs/installation.md#support-status) for the exact boundary.

## Build and verify

Requirements: a current Node.js/npm environment and, for native validation,
the Claude CLI.

```bash
npm ci
npm test
npm run verify
```

For the local 0.2.0 candidate, `npm run verify` builds:

- `dist/archives/bitterclip-0.2.0-claude-plugin.zip`
- `dist/archives/bitterclip-0.2.0-agent-plugin.zip`
- `dist/claude`, the local Claude marketplace
- `dist/portable/bitterclip`, the unpacked portable package

Validation proves package structure and reproducibility. A useful result still
ends with a human watching and, when audio matters, listening to the exact
Export.

## Contributing and trust

Start with [CONTRIBUTING.md](CONTRIBUTING.md). Please report vulnerabilities
privately as described in [SECURITY.md](SECURITY.md). The package is
[MIT licensed](LICENSE); vendored schema and dependency terms are recorded in
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). BitterClip names and marks are
covered by [TRADEMARKS.md](TRADEMARKS.md).

For help with the product or connection, visit
[BitterClip Support](https://company.sheetgenius.com/bitterclip/support/) or
email [hello@bitterclip.com](mailto:hello@bitterclip.com). See the
[privacy policy](https://bitterclip.com/privacy) before connecting an account.
