# Install BitterClip for agents

The current source checkout combines four focused skills with the hosted
BitterClip OAuth MCP service. The latest published GitHub download is still the
three-skill v0.1.3 pilot. Installation adds a package to your agent host; it
does not run the BitterClip application locally.

## Before you start

You need:

- a BitterClip account with access to the Recordings you want to edit;
- either a pilot ZIP from the GitHub prerelease or a source checkout;
- a current Node.js/npm environment only if building from source; and
- the relevant host application or CLI.

No BitterClip API key belongs in the package. The host opens the OAuth sign-in
flow when it first connects to `https://app.bitterclip.com/mcp`.

## Download the pilot ZIPs

The [v0.1.3 GitHub prerelease](https://github.com/sheetgenius/bitterclip-plugin/releases/tag/v0.1.3)
provides the tested pilot packages:

| Download | Use |
| --- | --- |
| [Claude plugin ZIP](https://github.com/sheetgenius/bitterclip-plugin/releases/download/v0.1.3/bitterclip-0.1.3-claude-plugin.zip) | Upload directly to Claude web; no build required |
| [Portable Agent Plugins ZIP](https://github.com/sheetgenius/bitterclip-plugin/releases/download/v0.1.3/bitterclip-0.1.3-agent-plugin.zip) | Unpack for the documented portable marketplace route below |
| [Release identity record](https://github.com/sheetgenius/bitterclip-plugin/releases/download/v0.1.3/release-0.1.3.json) | Package hashes and build identity |

These are GitHub pilot downloads, not a vendor marketplace listing. The portable
ZIP does not imply a universal drag-and-drop import flow.

## Build from source

Clone the public repository, then build and verify:

```bash
git clone https://github.com/sheetgenius/bitterclip-plugin.git
cd bitterclip-plugin
npm ci
npm test
npm run verify
```

The current source checkout produces the four-skill 0.2.1 packages. Version
0.2.1 is not a GitHub release or vendor listing, and its generated packages
have not completed host acceptance. The final command writes:

| Output | Use |
| --- | --- |
| `dist/archives/bitterclip-0.2.1-claude-plugin.zip` | Claude web upload |
| `dist/archives/bitterclip-0.2.1-agent-plugin.zip` | Portable Agent Plugins archive |
| `dist/claude` | Claude Code marketplace from a local build (the repository root serves the same generated package) |
| `dist/portable/bitterclip` | Unpacked portable package |

For a local build, do not install an archive produced before `npm run verify`
completes.

## Claude web

1. Open <https://claude.ai/customize/plugins>.
2. Choose **Add plugin**, then **Upload plugin**.
3. Select the downloaded `bitterclip-0.1.3-claude-plugin.zip`, or the locally
   built `bitterclip-0.2.1-claude-plugin.zip` in `dist/archives/` when you are
   authorized to connect that account and media.
4. Confirm the skills match the installed version: released 0.1.3 has
   `get-started`, `make-a-clip`, and `review-and-export`; the four-skill 0.2.1
   source package also has `fx-studio`.
5. Start a new conversation and ask: “Use BitterClip to help me make my first
   clip.”
6. Complete BitterClip sign-in if Claude asks you to connect.

Uploading the ZIP and connecting the service are related but distinct. If the
skills appear while the connection is unavailable, use the reconnect steps
below instead of uploading the plugin again.

### Connector-only fallback

If your Claude plan or organization uses custom connectors separately, open the
[prefilled BitterClip connector setup](https://claude.ai/customize/connectors?modal=add-custom-connector&connectorName=BitterClip&connectorUrl=https%3A%2F%2Fapp.bitterclip.com%2Fmcp).

This gives Claude access to the hosted MCP service. It does not install the
four packaged skills from the ZIP.

## Claude Code

Install from this repository's marketplace:

```bash
claude plugin marketplace add sheetgenius/bitterclip-plugin
claude plugin install bitterclip@bitterclip
```

Start a new Claude Code session, run `/mcp`, choose the BitterClip server and
authenticate, then invoke BitterClip's `get-started` skill. Native validation
alone does not establish that the connection or skills work in a model
conversation.

To update, run `claude plugin marketplace update bitterclip` and
`claude plugin update bitterclip@bitterclip`. Check `claude plugin --help` for
the commands your installed CLI supports before changing configuration.

## Codex and ChatGPT desktop

Codex (the CLI and the ChatGPT desktop app share configuration) installs from
this repository's marketplace at `.agents/plugins/marketplace.json`:

```bash
codex plugin marketplace add https://github.com/sheetgenius/bitterclip-plugin.git --ref main
codex plugin add bitterclip@bitterclip
codex mcp login bitterclip
```

The last command opens the browser to sign in to BitterClip. Start a new task
to load the skills. See OpenAI's current
[plugin packaging documentation](https://developers.openai.com/plugins/build/plugins)
for marketplace locations and managed-workspace options.

As of 2026-09-24, adding the marketplace and installing the plugin succeed with
Codex CLI 0.156.1, and Codex registers the `bitterclip` server with OAuth. A
signed-in skill conversation in the ChatGPT desktop app has not yet been
recorded.

## ChatGPT web: pilot skill upload

The private 0.2.0 pilot installed four separate single-skill `.skill` ZIPs at
**Plugins → Skills → Create → Upload from your computer**. Each contained one
unchanged `SKILL.md`, and ChatGPT showed all four as Installed. These are not
the public 0.1.3 Agent Plugins archive or a whole-plugin import. They are not
offered as public downloads here; use only reviewed files from an approved
checkout. See [OpenAI's skill guidance](https://developers.openai.com/plugins/build/skills)
for the skill/package distinction.

Skill upload does not add the BitterClip MCP connection. The pilot reused its
existing production connection without a new OAuth grant. Confirm the intended
connection separately; Installed status alone does not prove invocation or a
finished video. The 0.2.1 Claude and ChatGPT web packages have not completed
package-level host acceptance. BitterClip's embedded Agent receives the four
source skills through Rails, without installing a marketplace package.

## Reconnect without losing the edit

If BitterClip asks you to sign in again:

1. Reconnect or reauthenticate the existing BitterClip MCP connection in the
   host.
2. Return to the same conversation if practical.
3. Tell the agent to read the current Clip and Export before continuing.
4. Confirm that a correction updates the same Clip rather than creating a
   duplicate.

BitterClip connections renew in the background with rotating refresh tokens, so
signing in again should be rare. If a host still asks, reconnect the existing
connection; reinstalling the package is usually unnecessary.

## Troubleshooting

### The skills are missing

- Confirm you installed the plugin package, not only the MCP connector.
- In Claude web, verify the skill count matches the installed version: three
  for released 0.1.3, or four including `fx-studio` for a source-built 0.2.1
  package.
- In local hosts, restart the app and begin a new conversation after install.
- Rebuild with `npm run verify` if the expected archive or marketplace is absent.

### The skills appear, but BitterClip is disconnected

- Reconnect the existing BitterClip service through the host's connection UI.
- Confirm the endpoint is exactly `https://app.bitterclip.com/mcp`.
- Complete OAuth in the browser window opened by the host.
- Do not paste bearer tokens or add custom authorization headers.

### OAuth succeeds, but the agent cannot see a Recording

- Confirm you signed into the intended BitterClip account or studio.
- Ask the agent to orient the account and show a small choice of ready Episodes.
- If a Recording is still processing, let the agent continue that exact upload;
  do not create another upload just because processing takes time.

### An Export is slow or missing

Ask the agent to check the same Clip's render status. A slow render should be
polled, not duplicated. A ready Download must match the exact current Clip
revision.

### The package validates but the result is poor

Package validation checks structure, not editorial quality. Give an ordinary
creative correction, such as “shorten the opening and keep the speaker framed,”
then review the revised same-Clip Export. Watch the whole result and listen when
audio matters.

For unresolved connection or product issues, visit
[BitterClip Support](https://company.sheetgenius.com/bitterclip/support/) or
email [hello@bitterclip.com](mailto:hello@bitterclip.com).

## Support status

Evidence through 2026-09-21:

- Claude web privately installed 0.1.2 with all three skills and an existing
  connected BitterClip connector. An explicit get-started invocation was seen.
- Claude Code 2.1.269 passed an isolated native install.
- A direct-file agent run using the same 0.1.2 skills made a first cut, revised
  the same Clip from ordinary feedback, and produced two downloadable MP4s
  without procedural coaching. Audio acceptance was not available.
- The public 0.1.3 release kept those three skills unchanged while adding
  repository documentation, license, and metadata. It remains the available
  GitHub download, not a vendor marketplace listing.
- A private 0.2.0 Claude web install enabled all four named skills with the
  existing connected BitterClip Custom connector and no new OAuth grant. FX,
  Clip, and review skills loaded automatically. After coaching around host
  friction, scene and scoped-Clip work advanced. A first exact private Export
  was ready and visibly played in the host card, but its opening failed
  editorial review. Ordinary feedback then changed the same Clip to a complete
  thought and retained the first Export. The revised video visibly played in
  the host and downloaded as a complete 1080p MP4 with an audio track. Listening
  was unavailable, and the agent used Program rather than exact-Export samples;
  neither its narration nor the download establishes full editorial acceptance.
- ChatGPT web installed four separate 0.2.0 skills; FX was explicitly invoked.
  The initial application needed coaching around missing values. Ordinary
  creative feedback then advanced the same scene and Clip without further
  coaching. Earlier and revised exact Exports remained independently available;
  the revised video visibly played in first-party Outputs, including the
  requested bridge and brighter, earlier title. Embedded review cards remained
  stale or failed, and the host's claimed review opening did not establish
  visible delivery. Browser Download was blocked; a separate download action
  returned no receipt or completed file. Download and audio remain unverified.
- The 0.2.1 source package tightens FX authoring, target, and continuation
  guidance. It passed local package checks; its Claude and ChatGPT web packages
  have not completed package-level host acceptance. Rails delivers these four
  source skills to new embedded Agent sessions through an authenticated MCP
  resource. This does not prove a finished customer production.
- Codex packaging is documented, but a fresh installed journey and automatic
  skill discovery remain unverified. No public Claude, ChatGPT, or Codex listing
  is claimed.
