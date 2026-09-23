# Claude package handoff

BitterClip turns a Recording into a finished Clip from an ordinary creative
request. The agent finds source-supported moments, makes an editable first cut,
renders an exact private Export, and applies later feedback to that same Clip.

This directory builds the Claude-native 0.2.1 package from the current source
checkout. Version 0.2.1 is not installed, submitted, approved, released, or
publicly listed. The available GitHub download remains v0.1.3; a separate 0.2.0
pilot was installed privately.

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
- web archive: `dist/archives/bitterclip-0.2.1-claude-plugin.zip`
- release identity: `dist/release-0.2.1.json`

The package contains four skills, one hosted OAuth MCP connection, an MIT
license, and the BitterClip icon. It contains no credentials, customer media,
local server, hooks, or hosted application source.

## Install locally

```bash
claude plugin marketplace add ./dist/claude
claude plugin install bitterclip@bitterclip
```

For Claude web, use the generated 0.2.1 Claude ZIP only with an account and
Recording you are authorized to edit and render. Building the package does not
establish that it works in the host.

After an approved installation, start a new conversation and request a real
outcome. Confirm that all four skills are present, OAuth connects to the
intended BitterClip account, the first Export plays and downloads, ordinary
feedback revises the same Clip, and the revised exact Export also plays and
downloads. For FX Studio work, separately confirm the scene remains source-only
until a supported exact-target application path is used. Listen when audio
matters.

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

The earlier private 0.1.2 Claude web install showed three skills and an
explicit get-started invocation; Claude Code 2.1.269 passed an isolated native
install. On 2026-09-21, a separate private 0.2.0 Claude web install enabled all
four named skills, preserving the existing connected BitterClip Custom
connector without a new OAuth grant. FX, Clip, and review skills loaded
automatically. After engineering coaching, a first exact private Export was
ready and visibly played in the host card, but its opening failed editorial
review. Ordinary feedback improved that same Clip and retained its earlier
Export. The revised video visibly played in the host and downloaded as a
complete 1080p MP4. Listening was unavailable; the agent used Program rather
than exact-Export frame samples, and full editorial acceptance remains open.

The 0.2.1 source package has passed local validation but is not installed. The
available GitHub release remains v0.1.3. There is no public Claude listing;
installation and package validation alone do not prove editorial quality,
download, audio review, or accepted FX Studio behavior.

Before submission, the publisher still needs authorized reviewer account and
media rights, intended destinations and regions, complete host acceptance, and
authority to accept the vendor's submission terms. Follow the current
[Claude plugin documentation](https://code.claude.com/docs/en/plugins) when
those gates are ready.
