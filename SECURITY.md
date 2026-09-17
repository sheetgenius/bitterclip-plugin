# Security and privacy

## Report a vulnerability privately

Email [hello@bitterclip.com](mailto:hello@bitterclip.com) with the subject
“BitterClip plugin security”. Describe the affected package version, host,
expected behavior and a minimal reproduction using synthetic data.

Do not post credentials, OAuth callbacks, signed media links, customer
recordings or private account details in a public issue. Do not attach raw
media to a report; we can agree on a safe way to investigate if needed.
For ordinary product help, use [BitterClip support](https://company.sheetgenius.com/bitterclip/support/).

## What installation connects

The plugin contains workflow instructions and the hosted MCP endpoint
`https://app.bitterclip.com/mcp`. It contains no credentials, customer media,
executable hooks or local server. Repository build scripts are development
tools, not installed plugin hooks.

Connecting through your host's OAuth flow gives that host access within the
permissions you approve. Account authorization and media access are enforced
by BitterClip, not by a skill file. Confirm the account before working and
use only recordings you are authorized to access. Never paste an access token
into a prompt, manifest or bug report.

The skills honor draft-only requests and distinguish rendering or private
download from external publication. Publishing requires a separate confirmation
of the exact Export and destination. Installing or modifying this repository
does not authorize renders, account changes, public sharing or security tests
against the hosted service.

The [BitterClip privacy policy](https://bitterclip.com/privacy) describes the
hosted service. Your chosen assistant has its own data-handling terms; this
package does not make a local-only processing or no-retention promise.
