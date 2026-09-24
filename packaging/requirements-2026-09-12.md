# Package and host contract — 2026-09-12

This is a dated implementation contract, not proof of installation, host acceptance, submission, or approval. Official pages below were fetched on 2026-09-12. Current package versions are recorded in the manifests; dated host evidence is summarized in the [installation guide](../docs/installation.md#support-status).

## Settled package shape

- Maintain one Agent Plugins 1.0 source under `plugin/`: required root `plugin.json`, fixed `skills/<name>/SKILL.md`, and root `mcp.json`.
- `plugin.json` uses `https://agent-plugins.org/schemas/1.0.0/plugin.schema.json`; `name` is `bitterclip`; pilot `version` is `0.1.0`. The closed portable schema permits identity/discovery fields and client data only under `extensions`. The MCP schema version must match the plugin schema version.
- `mcp.json` uses `https://agent-plugins.org/schemas/1.0.0/mcp.schema.json` and exactly one server: `bitterclip`, `type: "streamable-http"`, `url: "https://app.bitterclip.com/mcp"`.
- Agent Plugins 1.0 has no portable OAuth or credential-reference fields. The host manages authentication. Include no headers, secrets, hooks, local commands, subprocesses, environment references, development URLs, or editor copies.
- Each shared skill has required Agent Skills frontmatter `name` and `description`; its directory and name match. The Claude build copies all three skill trees byte-for-byte.

Official sources: [Agent Plugins manifest](https://agent-plugins.org/plugin-authors/manifest), [Agent Plugins MCP configuration](https://agent-plugins.org/plugin-authors/mcp-servers), [Agent Plugins specification](https://agent-plugins.org/specification), [Agent Skills specification](https://agentskills.io/specification), [OpenAI packaging](https://developers.openai.com/plugins/build/plugins).

## Claude-native build and host constraints

- Generate, do not separately maintain, `.claude-plugin/plugin.json`. Copy `name`, `version`, `description`, author, homepage, repository, license, and keywords when those source values exist; `name` is the only Claude-required manifest field.
- Generate root `.mcp.json` with exactly `mcpServers.bitterclip = {"type":"http","url":"https://app.bitterclip.com/mcp"}`. Do not copy portable `mcp.json` or its schema into the native artifact as a second active configuration.
- Validate the generated root with `claude plugin validate <path> --strict`. Then test real installation and OAuth separately; validation is not host acceptance.
- Claude's documented plugin surfaces are paid-plan web Chat, Desktop Chat, and Cowork; skills work across those three. Claude Code has its own native plugin install/validation path. Remote connectors originate from Anthropic cloud infrastructure and therefore require public reachability. Team/Enterprise custom connector setup is owner-controlled; individual Pro/Max users may add a custom connector themselves.
- Claude supports DCR and CIMD OAuth. Refresh tokens for public clients must rotate or be sender-constrained; `/token` accepts form encoding and `/register` accepts JSON. The current pilot may accurately disclose reauthorization, but refresh/rotation is a separate Rails decision before broad promotion.

Official sources: [Claude plugin reference](https://code.claude.com/docs/en/plugins-reference), [Claude MCP configuration](https://code.claude.com/docs/en/mcp), [using plugins in Claude](https://support.claude.com/en/articles/13837440-use-plugins-in-claude), [custom remote connectors](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp), [Claude connector authentication](https://claude.com/docs/connectors/building/authentication), [Claude plugin submission](https://claude.com/docs/plugins/submit).

## OpenAI build, auth, and submission constraints

- New packages use the portable root manifest and MCP configuration above. Put OpenAI listing/interface data under `extensions.com.openai` only when the real assets, policy links, and presentation values exist. A `.codex-plugin/plugin.json` compatibility overlay is optional and is not the maintained source.
- OpenAI's documented workspace marketplace import accepts a ZIP containing `plugin.json` and may also include `mcp.json`. That import table currently marks remote and local MCP servers as **Desktop only**; treat this as a constraint of that workspace-import route, not a prohibition on the separate web submission path below.
- OAuth 2.1 requires protected-resource metadata, authorization-server metadata, the `resource` parameter throughout, authorization-code PKCE with `S256`, and CIMD, DCR, or a predefined client. Current OpenAI guidance prefers CIMD when supported; DCR remains supported.
- Public submission uses **With MCP** and the stable public HTTPS server. Submit the server afresh for scan/review; do not submit or package a personal `plugin_asdk_app...` integration reference. Submission access, organization verification, listing fields, tool scans, test cases, and policy attestations are external gates.

Official sources (fetched 2026-09-12): [OpenAI workspace plugin management](https://learn.chatgpt.com/docs/enterprise/plugin-management), [OpenAI authentication](https://developers.openai.com/plugins/build/auth), [OpenAI submission](https://developers.openai.com/plugins/deploy/submission), [OpenAI remote MCP review](https://developers.openai.com/plugins/deploy/app-review).

## Current BitterClip operation map

All names below are model-visible MCP tools owned by `Bitterclip::OperationCatalog::MODEL_VISIBLE_MCP_TOOL_NAMES`. Dispatch runs through `apps/bitterclip-rails/app/services/bitterclip/mcp_server.rb`; documentation discovery is owned by `apps/bitterclip-rails/app/services/bitterclip/mcp_docs.rb` and `operation_catalog/docs_entries.rb`.

| Shared skill | Existing operations and exact catalog owners |
| --- | --- |
| `get-started` | account ambiguity: `account_context_get` (`operation_catalog/account_context_entries.rb`); discovery: `projects_list` (`project_entries.rb`), `recordings_list` (`recording_entries.rb`), `episodes_list` (`search_entries.rb`); upload: `upload_link_create` (`recording_entries.rb`); requested exact handoff: `workspace_open` (`workspace_entries.rb`); narrow docs: `help` (`mcp_server.rb`, `mcp_docs.rb`) |
| `make-a-clip` | locate/read: `transcript_search`, `episodes_list` (`search_entries.rb`), `episode_read`, `episode_create` (`episode_entries.rb`); cut-grade media: `episode_zoom` (`episode_evidence_entries.rb`), `episode_sample_frames`/`recording_sample_frames` (`frame_sampling_entries.rb`); one range: `clip_create` (`clip_entries.rb`); same-target revision: `episode_edit` (`program_entries.rb`); finish: `render_create`, `render_status` (`render_entries.rb`); exact handoff: `workspace_open` (`workspace_entries.rb`) |
| `review-and-export` | bind target: `episode_read` (`episode_entries.rb`), `render_status` (`render_entries.rb`); rendered pixels: `export_sample_frames` (`frame_sampling_entries.rb`); same-Clip feedback: `episode_edit` (`program_entries.rb`); new current private result: `render_create` then `render_status` (`render_entries.rb`); requested editor handoff: `workspace_open` (`workspace_entries.rb`); external publication remains behind `publish_prepare`/`publish_update`/`publish_send` (`publishing_entries.rb`) and fresh server-bound confirmation |

The skills use live tool descriptors and `Bitterclip::McpDocs` only when needed; they do not copy argument schemas or the catalog.

## Meaningful drift and open decisions

- OpenAI's local Plugin Creator currently scaffolds the legacy compatibility layout (`.codex-plugin/plugin.json`, `.mcp.json`). Current OpenAI documentation explicitly directs new portable packages to root `plugin.json` and `mcp.json`; the portable layout governs this build.
- The 2026-09-11 package plan suggested `workspace_open mode:"upload"`; current `workspace_open` accepts only `review`, `edit`, or `publish`. First upload therefore uses `upload_link_create`.
- `Bitterclip::McpDocs` calls rendering “confirmation-bound,” while the current `render_create` descriptor says ordinary make/cut/create language is explicit private-render intent. The current tool contract and user intent govern; draft-only, review-first, and no-render requests still stop before rendering.
- Public source distribution was authorized on 2026-09-17 at `https://github.com/sheetgenius/bitterclip-plugin`, under MIT. This does not authorize or establish a vendor marketplace listing. Permanent listing slugs, countries, reviewer account/media rights, and submission-role availability remain separate decisions.
- Host acceptance remains candidate-specific: an upload entrance or successful MCP connection alone does not prove skill loading, a complete editorial journey, or public marketplace availability. Consult the [installation guide](../docs/installation.md#support-status) for the observed boundary.
