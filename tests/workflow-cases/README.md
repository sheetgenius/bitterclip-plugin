# Workflow acceptance cases

These fixtures are executable checks of the acceptance-plan structure and human-readable protocols for real host testing. They do not claim that a host, OAuth flow, edit, Render, or Export passed.

Run the fixture check with:

```sh
node --test tests/workflow-cases/*.test.mjs
```

For a real run, copy `record-template.json`, fill every field from observed evidence, and bind it to the exact package hash, server URL, host/client version, date, plan/role, account, target revision, and Export identities. A lead reviewer must watch and listen to editorial cases; tool receipts alone cannot earn the editorial scores.

The [`first-source-backed-clip`](cases.json) case also has focused
[`speech-boundary regressions`](unsupported-speech-boundary.md) for unresolved
pre-create evidence and post-create overlap warnings. Classify any session that
autoloads instructions outside the tested package before scoring package
behavior.
