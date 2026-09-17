import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { buildPackages, endpoint, hasClaudeCli, homepage, mitLicenseText, repoRoot, validateClaudeNative } from "../../scripts/package-lib.mjs";

const plugin = {
  "$schema": "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json",
  name: "bitterclip",
  version: "0.1.0",
  description: "Turn recordings into editable clips and exact video exports.",
  license: "MIT",
  homepage,
  author: { name: "SheetGenius, Inc.", url: "https://company.sheetgenius.com" }
};
const mcp = {
  "$schema": "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json",
  mcpServers: { bitterclip: { type: "streamable-http", url: endpoint } }
};

async function fixture(mutator) {
  const temporaryParent = path.join(repoRoot, ".tmp");
  await mkdir(temporaryParent, { recursive: true });
  const root = await mkdtemp(path.join(temporaryParent, "bitterclip-plugin-test-"));
  const source = path.join(root, "plugin");
  await mkdir(path.join(source, "skills/get-started"), { recursive: true });
  await mkdir(path.join(source, "skills/make-a-clip"), { recursive: true });
  await mkdir(path.join(source, "skills/review-and-export"), { recursive: true });
  await writeFile(path.join(source, "plugin.json"), `${JSON.stringify(plugin, null, 2)}\n`);
  await writeFile(path.join(source, "mcp.json"), `${JSON.stringify(mcp, null, 2)}\n`);
  await writeFile(path.join(source, "LICENSE"), mitLicenseText);
  for (const name of ["get-started", "make-a-clip", "review-and-export"]) {
    await writeFile(path.join(source, `skills/${name}/SKILL.md`), `---\nname: ${name}\ndescription: Test-only portable skill.\n---\n\nUse the current BitterClip MCP documentation.\n`);
  }
  if (mutator) await mutator(source);
  return { root, source, output: path.join(root, "dist") };
}

async function withFixture(mutator, callback) {
  const value = await fixture(mutator);
  try { return await callback(value); } finally { await rm(value.root, { recursive: true, force: true }); }
}

test("build is deterministic and native output preserves each skill byte", async () => {
  await withFixture(null, async ({ root, source, output }) => {
    const first = await buildPackages({ source, output });
    const secondOutput = path.join(root, "dist-second");
    const second = await buildPackages({ source, output: secondOutput });
    assert.deepEqual(first.release.artifacts, second.release.artifacts);
    assert.equal(first.release.skill_tree_sha256, second.release.skill_tree_sha256);
    assert.deepEqual(
      await readFile(path.join(output, "archives", `${plugin.name}-${plugin.version}-agent-plugin.zip`)),
      await readFile(path.join(secondOutput, "archives", `${plugin.name}-${plugin.version}-agent-plugin.zip`))
    );
    assert.deepEqual(
      await readFile(path.join(output, "archives", `${plugin.name}-${plugin.version}-claude-plugin.zip`)),
      await readFile(path.join(secondOutput, "archives", `${plugin.name}-${plugin.version}-claude-plugin.zip`))
    );
    for (const skill of ["get-started", "make-a-clip", "review-and-export"]) {
      assert.deepEqual(
        await readFile(path.join(source, `skills/${skill}/SKILL.md`)),
        await readFile(path.join(output, `claude/plugins/bitterclip/skills/${skill}/SKILL.md`))
      );
    }
    const nativeMcp = JSON.parse(await readFile(path.join(output, "claude/plugins/bitterclip/.mcp.json")));
    assert.deepEqual(nativeMcp, { mcpServers: { bitterclip: { type: "http", url: endpoint } } });
    const nativePlugin = JSON.parse(await readFile(path.join(output, "claude/plugins/bitterclip/.claude-plugin/plugin.json")));
    assert.equal(nativePlugin.license, "MIT");
    assert.equal(nativePlugin.homepage, homepage);
    const archivePaths = execFileSync("unzip", ["-Z1", path.join(output, "archives", `${plugin.name}-${plugin.version}-claude-plugin.zip`)], { encoding: "utf8" }).trim().split("\n");
    assert.ok(archivePaths.includes(".claude-plugin/plugin.json"));
    assert.ok(archivePaths.includes(".mcp.json"));
    assert.ok(!archivePaths.includes("plugin.json"));
    assert.ok(!archivePaths.includes("mcp.json"));
    assert.ok(archivePaths.includes("LICENSE"));
    const portableArchive = path.join(output, "archives", `${plugin.name}-${plugin.version}-agent-plugin.zip`);
    assert.ok(execFileSync("unzip", ["-Z1", portableArchive], { encoding: "utf8" }).trim().split("\n").includes("LICENSE"));
    assert.deepEqual(execFileSync("unzip", ["-p", portableArchive, "LICENSE"]), Buffer.from(mitLicenseText));
    assert.deepEqual(execFileSync("unzip", ["-p", path.join(output, "archives", `${plugin.name}-${plugin.version}-claude-plugin.zip`), "LICENSE"]), Buffer.from(mitLicenseText));
  });
});

test("pinned official schema rejects a portable manifest mutation", async () => {
  await withFixture(async (source) => {
    await writeFile(path.join(source, "plugin.json"), `${JSON.stringify({ ...plugin, unsupported: true }, null, 2)}\n`);
  }, async ({ source, output }) => {
    await assert.rejects(buildPackages({ source, output }), /violates pinned schema/);
  });
});

test("license contract rejects missing, unsupported, drifted, and repository claims", async (t) => {
  await t.test("missing license", async () => withFixture(async (source) => {
    const manifest = structuredClone(plugin);
    delete manifest.license;
    await writeFile(path.join(source, "plugin.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  }, async ({ source, output }) => assert.rejects(buildPackages({ source, output }), /approved MIT license/)));
  await t.test("unsupported license", async () => withFixture(async (source) => {
    await writeFile(path.join(source, "plugin.json"), `${JSON.stringify({ ...plugin, license: "Apache-2.0" }, null, 2)}\n`);
  }, async ({ source, output }) => assert.rejects(buildPackages({ source, output }), /approved MIT license/)));
  await t.test("license drift", async () => withFixture(async (source) => {
    await writeFile(path.join(source, "LICENSE"), "not the canonical MIT text\n");
  }, async ({ source, output }) => assert.rejects(buildPackages({ source, output }), /byte-identical/)));
  await t.test("repository claim", async () => withFixture(async (source) => {
    await writeFile(path.join(source, "plugin.json"), `${JSON.stringify({ ...plugin, repository: "https://example.invalid/bitterclip" }, null, 2)}\n`);
  }, async ({ source, output }) => assert.rejects(buildPackages({ source, output }), /repository claim/)));
});

test("source file allowlist and unsafe package content fail closed", async (t) => {
  await t.test("unknown file", async () => withFixture(async (source) => {
    await writeFile(path.join(source, "internal-notes.md"), "not for distribution\n");
  }, async ({ source, output }) => assert.rejects(buildPackages({ source, output }), /unknown package file/)));
  await t.test("credential-bearing MCP config", async () => withFixture(async (source) => {
    const unsafe = structuredClone(mcp);
    unsafe.mcpServers.bitterclip.headers = { Authorization: "Bearer secret-value" };
    await writeFile(path.join(source, "mcp.json"), `${JSON.stringify(unsafe, null, 2)}\n`);
  }, async ({ source, output }) => assert.rejects(buildPackages({ source, output }), /credential-bearing content|without headers/)));
  await t.test("development endpoint", async () => withFixture(async (source) => {
    const unsafe = structuredClone(mcp);
    unsafe.mcpServers.bitterclip.url = "http://localhost:3000/mcp";
    await writeFile(path.join(source, "mcp.json"), `${JSON.stringify(unsafe, null, 2)}\n`);
  }, async ({ source, output }) => assert.rejects(buildPackages({ source, output }), /development URL|sole streamable-http/)));
  await t.test("symlink", async () => withFixture(async (source) => {
    await symlink(path.join(source, "mcp.json"), path.join(source, "README.md"));
  }, async ({ source, output }) => assert.rejects(buildPackages({ source, output }), /symlink is forbidden/)));
  await t.test("executable SVG", async () => withFixture(async (source) => {
    await mkdir(path.join(source, "assets"));
    await writeFile(path.join(source, "assets/logo.svg"), "<svg onload=\"alert(1)\"/>");
  }, async ({ source, output }) => assert.rejects(buildPackages({ source, output }), /executable or external SVG/)));
  await t.test("symlink source root", async () => withFixture(null, async ({ root, source, output }) => {
    const linked = path.join(root, "linked-plugin");
    await symlink(source, linked);
    await assert.rejects(buildPackages({ source: linked, output }), /non-symlink directory/);
  }));
});

test("available Claude validator accepts the generated native package", async (t) => {
  if (!await hasClaudeCli()) return t.skip("Claude CLI is not installed");
  await withFixture(null, async ({ source, output }) => {
    await buildPackages({ source, output });
    assert.doesNotThrow(() => validateClaudeNative(path.join(output, "claude/plugins/bitterclip")));
  });
});
