# Claude package handoff

BitterClip turns a Recording into a finished Clip from an ordinary creative
request. The agent finds source-supported moments, makes an editable first cut,
renders an exact private Export, and applies later feedback to that same Clip.

This directory supports review of the generated Claude-native 0.1.3 package. It
is not a submission, approval, or public listing.

## Build and inspect

Run from the repository root:

```bash
npm ci
npm test
npm run verify
claude plugin validate --strict --json dist/claude/plugins/bitterclip
```

The builder writes:

- native plugin: `dist/claude/plugins/bitterclip`
- local marketplace: `dist/claude`
- web archive: `dist/archives/bitterclip-0.1.3-claude-plugin.zip`
- release identity: `dist/release-0.1.3.json`

The package contains three skills, one hosted OAuth MCP connection, an MIT
license, and the BitterClip icon. It contains no credentials, customer media,
local server, hooks, or hosted application source.

## Install locally

```bash
claude plugin marketplace add ./dist/claude
claude plugin install bitterclip@bitterclip
```

For Claude web, open <https://claude.ai/customize/plugins>, choose **Add plugin →
Upload plugin**, and select the generated 0.1.3 Claude ZIP. Use only an account
and Recording you are authorized to edit and render.

After installation, start a new conversation and request a real outcome. Confirm
that all three skills are present, OAuth connects to the intended BitterClip
account, the first Export plays and downloads, ordinary feedback revises the
same Clip, and the revised exact Export also plays and downloads. Listen when
audio matters.

Detailed install, reconnect, and troubleshooting guidance lives in
[`../../docs/installation.md`](../../docs/installation.md).

## Listing copy

**Name:** BitterClip

**Short description:** Turn a recording into a finished clip by describing what
you want.

**Long description:** BitterClip helps an agent find worthwhile moments in a
Recording, shape them into one editable Clip, and deliver an exact playable and
downloadable Export. Give creative feedback in ordinary language and the agent
improves the same Clip while preserving earlier versions. Drafts stay drafts,
and publishing still requires the exact Export, destination, and a fresh
confirmation in BitterClip.

**Starter prompts:**

1. Help me make my first clip. Show my recent recordings, or help me upload one.
2. Make a concise portrait clip from this conversation. Keep the opening direct
   and show me the finished video.
3. Open my latest cut, shorten the setup, and give me the revised video.

## Current boundary

The privately installed Claude web candidate is 0.1.2. It showed all three
skills and an existing connected BitterClip connector; an explicit get-started
invocation ran. Claude Code 2.1.269 also passed an isolated native install.

The new local 0.1.3 candidate keeps the 0.1.2 skills unchanged and adds
documentation, license, and metadata. It has not been installed over that web
candidate. There is no public Claude listing, and package validation alone does
not prove OAuth, automatic skill selection, editorial quality, or media review.

Before submission, the publisher still needs authorized reviewer account and
media rights, intended destinations and regions, complete host acceptance, and
authority to accept the vendor's submission terms. Follow the current
[Claude plugin documentation](https://code.claude.com/docs/en/plugins) when
those gates are ready.
