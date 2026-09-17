# OpenAI package handoff

BitterClip turns a Recording into a finished Clip from an ordinary creative
request. The agent chooses source-supported moments, makes an editable first
cut, renders an exact private Export, and applies later feedback to that same
Clip.

This directory supports review of BitterClip 0.1.3 in Agent Plugins 1.0 format. It
is not a submission, approval, public listing, or claim that a fresh Codex
install has passed.

## Package

Build and verify from the repository root:

```bash
npm ci
npm test
npm run verify
```

Review:

- archive: `dist/archives/bitterclip-0.1.3-agent-plugin.zip`
- unpacked source: `dist/portable/bitterclip`
- release identity: `dist/release-0.1.3.json`

The portable root contains `plugin.json`, `mcp.json`, and the same three skills
used by the Claude package. It connects to the hosted BitterClip service with
host-managed OAuth. It contains no credentials, customer media, local server,
or hosted application source.

OpenAI documents this root layout and local/repo marketplace installation for
Codex and ChatGPT desktop. Follow the current
[plugin packaging guide](https://developers.openai.com/plugins/build/plugins)
and the detailed [local installation guide](../../docs/installation.md#codex-and-chatgpt-desktop).
Do not present the ZIP as a universal drag-and-drop import or a public listing.

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

## Starter prompts

1. Help me make my first clip. Show my recent recordings, or help me upload one.
2. Make a concise portrait clip from this conversation. Keep the opening direct
   and show me the finished video.
3. Open my latest cut, shorten the setup, and give me the revised video.

## Review checklist

- [ ] Build identity and archive hash are recorded.
- [ ] A fresh install exposes all three skills and the one intended MCP service.
- [ ] OAuth connects the intended authorized BitterClip account without keys in
      the package.
- [ ] The agent makes a worthwhile first cut without asking for timestamps or
      tool sequencing.
- [ ] Ordinary feedback revises the same Clip and preserves the earlier Export.
- [ ] Both exact Exports play and download; a reviewer listens when audio matters.
- [ ] Draft-only requests do not render, and no publication occurs without the
      exact destination-bound confirmation.
- [ ] No customer media, private identifiers, or unsupported availability claim
      appears in review material.

## Current boundary

The 0.1.3 portable package follows OpenAI's documented schema. Its three skills
are unchanged from 0.1.2, but a fresh Codex install and automatic skill-discovery
journey have not been completed. A direct-file agent run of those 0.1.2 skills
did produce a first cut and revised same-Clip Export without procedural coaching;
audio acceptance was unavailable. There is no public ChatGPT or Codex listing.
