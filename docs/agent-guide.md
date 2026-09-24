# Agent guide

BitterClip works best when the person describes the outcome and the agent owns
the mechanics.

## Before you begin

You need:

- the BitterClip plugin installed in a compatible host;
- an authenticated BitterClip connection;
- an uploaded, ready Recording or permission to help with one; and
- the person's creative intent.

Reading the files in this repository gives an agent instructions. It does not
prove that a host installed the plugin, discovered its skills automatically, or
connected the hosted service.

## Ask for the result

Useful requests sound like this:

- “Help me make my first clip. Show my recent recordings, or help me upload
  one.”
- “Make a concise portrait clip explaining why we changed direction. Keep the
  opening direct and show me the finished video.”
- “Open my latest cut, shorten the setup, and keep the customer's explanation
  intact.”
- “Keep this as a draft. I want to review the edit before rendering.”

The person should not need to provide timestamps or sequence tools. Ask a
creative question only when the answer would materially change the result.

## Route to the maintained skill

These files are the canonical working instructions. Link to them; do not copy
them into a host-specific guide.

1. [`get-started`](../plugin/skills/get-started/SKILL.md) for setup, account
   orientation, a ready Episode, first upload, or processing recovery.
2. [`make-a-clip`](../plugin/skills/make-a-clip/SKILL.md) for a first cut,
   source-backed editing, revision of the same Clip, and finish intent.
3. [`review-and-export`](../plugin/skills/review-and-export/SKILL.md) for exact
   playback, Download, render recovery, or feedback on an existing result.
4. [`fx-studio`](../plugin/skills/fx-studio/SKILL.md) for a standalone
   programmable scene or ordinary visual feedback on that same scene. It is not
   a Recording, Clip, Render, or production-application shortcut.

Use BitterClip's live tool descriptions and call its `help` tool with a short
question or exact `bitterclip://docs` URI when an operation contract matters.
For the current product model and public guidance, read:

- [agent-readable BitterClip documentation](https://bitterclip.com/llms.txt)
- [product documentation](https://bitterclip.com/docs)
- [assistant overview](https://bitterclip.com/docs/assistants/overview/)

## Keep the promise

The intended result is simple: a purposeful editable Clip, an exact private
Export when requested, and later creative feedback applied to that same Clip.
The Recording remains the timing authority; earlier Exports remain earlier
versions; drafts stay drafts; and publishing still requires the exact reviewed
Export, named destination, and fresh confirmation in BitterClip.

Be honest about what the host could inspect. Package validation and direct-file
skill use do not prove installation, playback, listening, or editorial quality.

## Package and service boundary

This open-source package contains skills and MCP configuration. The hosted
BitterClip application, media processing, storage, account permissions, and
service plan are operated by SheetGenius, Inc. They are not included or licensed
as part of this repository.

See [Installation](installation.md) for host setup, OAuth, reconnect guidance,
and the current support boundary.
