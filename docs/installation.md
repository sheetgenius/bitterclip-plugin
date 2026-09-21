# Install BitterClip for agents

The public 0.1.3 plugin combines three focused skills with the hosted BitterClip
OAuth MCP service; a local 0.2.1 candidate includes FX Studio as a fourth.
Installation adds the package to your agent host; it does not run the BitterClip
application locally.

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

The public default branch currently produces the released three-skill 0.1.3
package. The four-skill 0.2.1 recovery candidate is not a GitHub download or
public source-build path; use it only from an explicitly approved local review
checkout. The privately installed pilot is 0.2.0, not this candidate.

For an approved local 0.2.1 candidate checkout, the final command writes:

| Output | Use |
| --- | --- |
| `dist/archives/bitterclip-0.2.1-claude-plugin.zip` | Claude web upload |
| `dist/archives/bitterclip-0.2.1-agent-plugin.zip` | Portable Agent Plugins archive |
| `dist/claude` | Claude Code local marketplace |
| `dist/portable/bitterclip` | Unpacked portable package |

For a local build, do not install an archive produced before `npm run verify`
completes.

## Claude web

1. Open <https://claude.ai/customize/plugins>.
2. Choose **Add plugin**, then **Upload plugin**.
3. Select the downloaded `bitterclip-0.1.3-claude-plugin.zip`, or an explicitly
   approved locally built 0.2.1 candidate in `dist/archives/`.
4. Confirm the skills match the installed version: released 0.1.3 has
   `get-started`, `make-a-clip`, and `review-and-export`; a four-skill 0.2.1
   candidate also has `fx-studio`.
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

After building, register the generated marketplace and install its one plugin:

```bash
claude plugin marketplace add ./dist/claude
claude plugin install bitterclip@bitterclip
```

Start a new Claude Code session, invoke BitterClip's `get-started` skill, and
complete OAuth when prompted. Native validation alone does not establish that
the connection or skills work in a model conversation.

If you rebuild a newer version, use the Claude CLI's documented update flow, or
uninstall and reinstall `bitterclip@bitterclip`. Check `claude plugin --help`
for the commands supported by your installed CLI before changing configuration.

## Codex and ChatGPT desktop

BitterClip 0.2.1 uses the portable Agent Plugins layout documented by OpenAI:
root `plugin.json`, root `mcp.json`, and four folders under `skills/`. OpenAI's
local installation route uses a repo or personal marketplace, then the Plugins
Directory in the ChatGPT desktop app.

Use the unpacked portable ZIP, or the generated folder
`dist/portable/bitterclip` from a source build. Place a copy inside
your local marketplace root and add an entry whose `source.path` begins with
`./`, is relative to that root, and stays inside it. For example:

```text
my-bitterclip-marketplace/
├── .agents/
│   └── plugins/
│       └── marketplace.json
└── plugins/
    └── bitterclip/
        ├── plugin.json
        ├── mcp.json
        └── skills/
```

In `.agents/plugins/marketplace.json`, use this catalog. Its plugin path is
relative to `my-bitterclip-marketplace`, the marketplace root, not to the
directory containing the catalog:

```json
{
  "name": "bitterclip-local",
  "interface": { "displayName": "BitterClip local" },
  "plugins": [
    {
      "name": "bitterclip",
      "source": { "source": "local", "path": "./plugins/bitterclip" },
      "policy": {
        "installation": "AVAILABLE",
        "authentication": "ON_INSTALL"
      },
      "category": "Productivity"
    }
  ]
}
```

Register that marketplace root:

```bash
codex plugin marketplace add ./my-bitterclip-marketplace
```

Restart the ChatGPT desktop app, open the Plugins Directory, choose **BitterClip
local**, install BitterClip, and test it in a new chat. See OpenAI's current
[plugin packaging documentation](https://developers.openai.com/plugins/build/plugins)
for marketplace locations and managed-workspace options.

This portable route is documented by OpenAI, but BitterClip 0.1.3 has not yet
completed a fresh Codex install and automatic skill-discovery journey. The ZIP
is not a claim of a universal drag-and-drop import flow or a public listing.

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
finished video. The 0.2.1 recovery candidate has not been installed in a host.

## Reconnect without losing the edit

If BitterClip asks you to sign in again:

1. Reconnect or reauthenticate the existing BitterClip MCP connection in the
   host.
2. Return to the same conversation if practical.
3. Tell the agent to read the current Clip and Export before continuing.
4. Confirm that a correction updates the same Clip rather than creating a
   duplicate.

BitterClip access tokens currently expire after 30 days and the service does
not advertise a refresh-token grant. Reauthorization is expected; reinstalling
the package is usually unnecessary.

## Troubleshooting

### The skills are missing

- Confirm you installed the plugin package, not only the MCP connector.
- In Claude web, verify the skill count matches the installed version: three
  for released 0.1.3, or four including `fx-studio` for an approved 0.2.1
  candidate.
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
- The local 0.2.1 recovery candidate tightens FX authoring, target, and
  continuation guidance. It passed local package checks but has not been
  installed in either host. A separate Rails discoverability fix is local and
  not deployed; do not infer that the missing values are fixed in production.
- Codex packaging is documented, but a fresh installed journey and automatic
  skill discovery remain unverified. No public Claude, ChatGPT, or Codex listing
  is claimed.
