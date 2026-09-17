# Changelog

## 0.1.3 — private local licensing candidate

- Adds the MIT license for this plugin package, with the canonical root license
  mirrored in the portable package and both generated archives.
- Maintains the same three shared skills, OAuth endpoint, and private local
  distribution posture; it does not add a public repository claim.

## 0.1.2 — private local consolidation candidate

- After the separate legacy `bitterclip-operator` disablement, consolidates
  still-relevant guidance into the three shared skills while retaining the
  legacy source:
  `get-started`, `make-a-clip`, and `review-and-export`.
- Keeps the single existing OAuth MCP endpoint and the same package shape; it
  does not add hooks or a second skill source.
- This is local package metadata only. It does not claim a host update, grant,
  publication, or server-side behavior change.

## 0.1.1 — private local patch candidate

- Tightens `make-a-clip` guidance for a `clip_create` result with
  `edge_warnings`: retain the exact created Clip, inspect each flagged child
  edge, and revise that same Clip only when source evidence requires it before
  rendering.
- This is host guidance only. It does not claim server-side warning clearance
  or a render-admission gate.

## 0.1.0 — private local pilot

- Initial package source for `get-started`, `make-a-clip`, and
  `review-and-export`.
- Uses the existing OAuth MCP endpoint.
- Host installation and editorial acceptance remain unverified.
