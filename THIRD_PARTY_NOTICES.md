# Third-party notices

Our original plugin skills, code and documentation are licensed under [MIT](LICENSE).
The third-party materials below retain their own licenses.

## Agent Plugins validation schemas

`schemas/plugin.schema.json` and `schemas/mcp.schema.json` are unmodified
Agent Plugins 1.0.0 schemas from the [Agent Plugins contributors](https://github.com/agentplugins/agent-plugins-spec).
They are licensed under [Apache-2.0](LICENSES/Apache-2.0.txt), as specified by
the [upstream licensing policy](https://github.com/agentplugins/agent-plugins-spec/blob/main/LICENSE.md).

Retrieval URLs, date and exact checksums are recorded in
[`schemas/sources.json`](schemas/sources.json). The upstream licensing policy
was checked on 2026-09-12. These schemas support local validation; they are not
included in the generated plugin ZIPs. Do not replace their notices with this
repository's MIT notice.

## Development dependencies

The locked development dependencies are installed by `npm ci`, not vendored
into this repository or bundled into the plugin ZIPs. Their license files remain
with their packages:

| Package | License |
| --- | --- |
| `ajv` | MIT |
| `fast-deep-equal` | MIT |
| `fast-uri` | BSD-3-Clause |
| `json-schema-traverse` | MIT |
| `require-from-string` | MIT |

[`package-lock.json`](package-lock.json) records the exact versions. Preserve
the upstream notices if you redistribute any of these dependencies.
