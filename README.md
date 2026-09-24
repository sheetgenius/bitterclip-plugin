# BitterClip plugin source has moved

The [BitterClip marketing repository](https://github.com/sheetgenius/bitterclip-marketing) is the public authoring source for MCP tool contracts, extended guides, and the four plugin skills. Review the [tool reference](https://bitterclip.com/docs/assistants/tool-reference/) and send improvements to that repository.

Install the current plugin from its marketplace:

```bash
claude plugin marketplace add sheetgenius/bitterclip-marketing
claude plugin install bitterclip@bitterclip
```

```bash
codex plugin marketplace add https://github.com/sheetgenius/bitterclip-marketing.git --ref main
codex plugin add bitterclip@bitterclip
codex mcp login bitterclip
```

This repository is retired. Its earlier commits and releases remain historical records; files here no longer define the served MCP contract or current plugin guidance. Product runtime and authorization live in [sheetgenius/bitterclip](https://github.com/sheetgenius/bitterclip).
