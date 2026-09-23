# OpenAI package handoff

BitterClip turns a Recording into a finished Clip from an ordinary creative
request. The agent chooses source-supported moments, makes an editable first
cut, renders an exact private Export, and applies later feedback to that same
Clip.

This directory builds BitterClip 0.2.1 from the current source checkout in
Agent Plugins 1.0 format. It is not a release, submission, approval, public
listing, or claim that a fresh Codex install has passed. The available GitHub
download remains v0.1.3.

## Package

Build and verify from the repository root:

```bash
npm ci
npm test
npm run verify
```

Review:

- archive: `dist/archives/bitterclip-0.2.1-agent-plugin.zip`
- unpacked source: `dist/portable/bitterclip`
- release identity: `dist/release-0.2.1.json`

The portable root contains `plugin.json`, `mcp.json`, and four skills used by
the Claude package. It connects to the hosted BitterClip service with
host-managed OAuth. It contains no credentials, customer media, local server,
or hosted application source.

OpenAI documents this root layout and local/repo marketplace installation for
Codex and ChatGPT desktop. Follow the current
[plugin packaging guide](https://developers.openai.com/plugins/build/plugins)
and the detailed [local installation guide](../../docs/installation.md#codex-and-chatgpt-desktop).
Do not present the ZIP as a universal drag-and-drop import or a public listing.

Separately, the private 0.2.0 pilot installed four individual `.skill` ZIPs in
ChatGPT web via **Skills → Create → Upload from your computer**. Each contained
one unchanged `SKILL.md`; this did not import the portable package or add a new
MCP connection. See the [pilot upload route](../../docs/installation.md#chatgpt-web-pilot-skill-upload).

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
- [ ] A fresh install exposes all four skills and the one intended MCP service.
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

The 0.2.1 portable source package follows OpenAI's documented schema with four
skills; it has not been host-installed. In the separate 0.2.0 ChatGPT web
pilot, FX was explicitly invoked. Initial Clip application needed coaching;
ordinary creative feedback then revised the same scene and Clip without it.
Earlier and revised exact Exports remained available, and the revised video
visibly played in first-party Outputs. Embedded review cards stayed stale or
failed; download, audio, and host delivery remain unverified. This does
not validate whole-package import or automatic discovery. The public v0.1.3
release remains the available download; fresh Codex installation is unverified,
and there is no public ChatGPT or Codex listing.
