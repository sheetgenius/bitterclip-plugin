import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const fixtureUrl = new URL("./cases.json", import.meta.url);
const fixture = JSON.parse(await readFile(fixtureUrl, "utf8"));
const cases = fixture.cases;

test("workflow fixtures are uniquely identified, runnable protocols", () => {
  assert.equal(fixture.schema, "bitterclip.plugin.workflow-cases.v1");
  assert.ok(Array.isArray(cases) && cases.length > 0);
  assert.equal(new Set(cases.map(({ id }) => id)).size, cases.length);

  for (const workflowCase of cases) {
    for (const field of ["title", "prompt"]) {
      assert.equal(typeof workflowCase[field], "string", `${workflowCase.id}.${field}`);
      assert.ok(workflowCase[field].length > 0, `${workflowCase.id}.${field}`);
    }
    for (const field of ["covers", "surfaces", "preconditions", "expected_decisions", "required_evidence", "failure_conditions"]) {
      assert.ok(Array.isArray(workflowCase[field]) && workflowCase[field].length > 0, `${workflowCase.id}.${field}`);
    }
  }
});

test("the declared matrix covers every pilot host and required recovery dimension", () => {
  const actualSurfaces = new Set(cases.flatMap(({ surfaces }) => surfaces));
  const requiredSurfaces = [
    "claude-web-chat",
    "claude-desktop-chat",
    "claude-cowork",
    "claude-code",
    "chatgpt-web-chat",
    "chatgpt-work",
    "codex"
  ];
  assert.deepEqual([...actualSurfaces].sort(), requiredSurfaces.sort());

  const actualCoverage = new Set(cases.flatMap(({ covers }) => covers));
  const requiredCoverage = [
    "install", "oauth", "setup", "signup", "empty-account", "upload", "processing",
    "first-result", "revision", "same-target", "export-retention", "denied", "draft-only",
    "publish", "reconnect", "expired-auth", "stale-head", "replay", "restart", "upgrade",
    "rollback", "comparison", "editorial-review"
  ];
  for (const dimension of requiredCoverage) {
    assert.ok(actualCoverage.has(dimension), `missing coverage: ${dimension}`);
  }
});

test("acceptance records start explicitly unobserved", async () => {
  const templateUrl = new URL("./record-template.json", import.meta.url);
  const template = JSON.parse(await readFile(templateUrl, "utf8"));
  assert.equal(template.result, "not_run");
  assert.equal(template.run_at, null);
  assert.deepEqual(Object.values(template.scores), [null, null, null, null, null]);
  assert.equal(template.server_url, "https://app.bitterclip.com/mcp");
});
