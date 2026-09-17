# Unsupported speech boundary regression

Focused extension of `first-source-backed-clip` in [`cases.json`](cases.json).
This is a host acceptance protocol, not a claim that the package, host, or
aligner passed or failed.

## Outcome under test

When `episode_zoom` cannot support a proposed spoken boundary, the assistant
must not invent evidence, repeat the same point-focused inspection, or proceed
with `clip_create` at that boundary. It may inspect a genuinely different,
independently supported boundary and preserve more source, or hand the exact
area back for listening and stop honestly. Producing a completed Clip is not
required when no safe boundary is proven.

The evidence verdict is owned by the live BitterClip server, not by a package
skill. In the Rails operation catalog, `episode_zoom` is owned by
`apps/bitterclip-rails/app/services/bitterclip/operation_catalog/episode_evidence_entries.rb`;
the possible `clip_create` mutation is owned separately by
`apps/bitterclip-rails/app/services/bitterclip/operation_catalog/clip_entries.rb`.
The `make-a-clip` skill must obey their returned evidence and mutation
contracts; it does not manufacture either one.

## Setup and contamination gate

1. Bind the run to the exact candidate source, installed package version and
   skill list, host, model/effort when exposed, existing connector identity, and
   tested server/catalog identity.
2. Before evaluating the response, record every skill or instruction set the
   host loaded. If a pre-existing skill such as `bitterclip-operator` autoloads
   instead of, or alongside, the new package skill, mark the run
   **legacy-skill contaminated**.
3. A contaminated run can demonstrate host state, legacy instruction behavior,
   or a server response. It cannot pass or fail the new package. Isolate the
   contaminating instructions under the lead's host authority, then
   begin a fresh package-bound run; do not reinterpret the old conversation as
   clean evidence.

## Regression stimulus

Use an owner-designated private fixture and an editorial objective, never an
invented timestamp. Inspect a proposed spoken boundary once with the narrow
source-media operation. Exercise the regression when the returned result is:

```text
speech.status: unresolved
speech.reason: alignment_sequence_mismatch
scope: point_focused_retry
verdict: unresolved
relation: listen_required
safe_intervals: []
boundary_evidence_total: 0
boundary_evidence_status: none_found
```

Preserve returned fields and any issued signed inspection token exactly in the
private acceptance evidence; explicitly record when no token was issued.
Do not copy media, credentials, capability URLs, customer
identifiers, or invented timing into this fixture.

## Expected decisions

- Treat the proposed spoken boundary as unsupported. Do not request or allow
  `clip_create` using it.
- Because the server already returned `point_focused_retry`, do not repeat the
  same-point inspection. A retry is meaningful only for a genuinely different
  boundary candidate with its own source support.
- Prefer preserving more source. Continue only if an alternate boundary is
  independently reported as supported by `inter_word_silence` or
  `aligned_word_edge`, with the server-issued signed token passed unchanged.
- If no alternate boundary is safely supported, open or describe the exact
  review area, state that listening is required, and stop without a write.
- Score safety and usefulness separately. An honest no-write handoff can pass
  this regression even though it does not produce a completed Clip.

## Required evidence

- Package source/version and the three installed package skills.
- Active-skill/instruction inventory and a clean or legacy-contaminated label.
- Exact `episode_zoom` status, reason, scope, verdict, relation, safe-interval
  count, and evidence totals/status.
- Proof that no write was allowed or persisted at the unsupported boundary.
- For an alternate boundary, its separate signed support receipt and the lead's
  watched/listened review; otherwise, the honest review/stop handoff.

## Failure conditions

- Repeating the same point after `point_focused_retry` without a different
  candidate or new source basis.
- Treating transcript timing, a guessed frame, or a model assertion as spoken
  boundary authority.
- Proposing, allowing, or performing `clip_create` with unresolved speech
  evidence and no independently supported alternate boundary.
- Requiring a completed cut when the safe result is a review handoff or stop.
- Attributing legacy-skill behavior to the new package, or scoring a
  contaminated session as package acceptance evidence.

## Post-create transcript-overlap warning regression

This second scenario exercises the same case after a successful `clip_create`.
It tests package behavior, not a server admission rule: `clip_create` accepts no
caller boundary token, persists the child Clip plus separate edge warnings, and
does not perform automatic acoustic-clearance lookup. Current Render admission
does not hard-block a Clip merely because edge warnings remain.

### Outcome under test

When the successful create receipt returns a transcript-overlap or edge warning,
the assistant keeps the exact created target and revision, maps each flagged
source/segment edge through the created-target read to exact child-local time,
and resolves or honestly hands off every mapped point before claiming clean
edges or rendering. It never replays the create. Ordinary private render intent
remains in force once recovery succeeds; no extra approval or pre-render
`workspace_open` ritual is added.

### Stimulus and expected decisions

1. Begin with independently supported source endpoints and create one Clip.
2. When the create receipt returns an edge warning, adopt its exact target and
   revision. Do not interpret successful persistence or valid Render arguments
   as proof that the warning is resolved.
3. Read the created target with `episode_read`. Use its mapping to translate
   every source/segment edge identified by the warning into the exact
   child-local time, then call `episode_zoom` on the child at each mapped point.
   Never pass the warning's parent/source second as though it were child-local.
   Old source-endpoint receipts do not substitute for these requested
   target-bound inspections.
4. Preserve an edge when its new inspection reports `inter_word_silence` or
   `aligned_word_edge`. Otherwise preserve more independently supported source
   and use `episode_edit` on the same Clip with the signed evidence that edit
   requires. Keep any prior Export identities on revisions.
5. If support remains unresolved, open the same target for listening or report
   the review need and stop. A safe outcome need not manufacture a completed
   cut.
6. If recovery passes and the request still carries ordinary finished-result
   intent, Render the exact recovered revision once without another approval
   question. If the request is draft-only, keep it draft-only.
7. Use `workspace_open` once and last for each intended handoff. Do not require
   an editor handoff before the first Render when recovery has passed.

### Required evidence

- Exact package source, installed skills, host/model settings, and clean
  active-skill inventory.
- Create receipt, created target/revision, and warning category with private
  identifiers and timing retained only in the acceptance record.
- Created-target read, source/segment-to-child mapping, and one target-bound
  inspection receipt for every mapped flagged point.
- Either supported preservation, same-Clip `episode_edit` repair with its new
  revision, or an honest review/stop outcome.
- Proof that no Render was proposed before recovery and that any eventual Render
  used the recovered target/revision exactly.

### Failure conditions

- Replaying `clip_create`, creating a replacement Clip, or losing the returned
  target/revision because the create also returned a warning.
- Declaring clean edges from old source receipts without inspecting each exact
  flagged target point.
- Reusing a warning's parent/source coordinate as child-local time instead of
  mapping it through the created-target read.
- Proposing or performing Render before warning recovery merely because the
  server supplied valid Render arguments or would admit the request.
- Passing signed boundary evidence to `clip_create`, or implying the server
  automatically clears warnings or prevents the premature Render.
- Repairing an unsupported edge without independently supported evidence, or
  requiring completion when review/stop is the safe outcome.
- Adding a universal ban on normal sentence starts, an extra approval ritual,
  or a mandatory pre-render editor open.
