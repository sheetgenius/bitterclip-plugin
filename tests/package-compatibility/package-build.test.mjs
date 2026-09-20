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
const skillNames = ["fx-studio", "get-started", "make-a-clip", "review-and-export"];

async function fixture(mutator) {
  const temporaryParent = path.join(repoRoot, ".tmp");
  await mkdir(temporaryParent, { recursive: true });
  const root = await mkdtemp(path.join(temporaryParent, "bitterclip-plugin-test-"));
  const source = path.join(root, "plugin");
  for (const name of skillNames) await mkdir(path.join(source, "skills", name), { recursive: true });
  await writeFile(path.join(source, "plugin.json"), `${JSON.stringify(plugin, null, 2)}\n`);
  await writeFile(path.join(source, "mcp.json"), `${JSON.stringify(mcp, null, 2)}\n`);
  await writeFile(path.join(source, "LICENSE"), mitLicenseText);
  for (const name of skillNames) {
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
    for (const skill of skillNames) {
      assert.deepEqual(
        await readFile(path.join(source, `skills/${skill}/SKILL.md`)),
        await readFile(path.join(output, `portable/bitterclip/skills/${skill}/SKILL.md`))
      );
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
    const portableArchivePaths = execFileSync("unzip", ["-Z1", portableArchive], { encoding: "utf8" }).trim().split("\n");
    assert.ok(portableArchivePaths.includes("LICENSE"));
    const expectedSkillFiles = skillNames.map((skill) => `skills/${skill}/SKILL.md`).sort();
    assert.deepEqual(portableArchivePaths.filter((file) => file.startsWith("skills/")).sort(), expectedSkillFiles);
    assert.deepEqual(archivePaths.filter((file) => file.startsWith("skills/")).sort(), expectedSkillFiles);
    assert.deepEqual(execFileSync("unzip", ["-p", portableArchive, "LICENSE"]), Buffer.from(mitLicenseText));
    assert.deepEqual(execFileSync("unzip", ["-p", path.join(output, "archives", `${plugin.name}-${plugin.version}-claude-plugin.zip`), "LICENSE"]), Buffer.from(mitLicenseText));
  });
});

test("four-skill package contract rejects a dropped or unapproved skill", async (t) => {
  await t.test("dropped fx-studio", async () => withFixture(async (source) => {
    await rm(path.join(source, "skills/fx-studio"), { recursive: true, force: true });
  }, async ({ source, output }) => assert.rejects(buildPackages({ source, output }), /missing required package file/)));
  await t.test("unapproved skill", async () => withFixture(async (source) => {
    await mkdir(path.join(source, "skills/unapproved"), { recursive: true });
    await writeFile(path.join(source, "skills/unapproved/SKILL.md"), "---\nname: unapproved\ndescription: Test-only unapproved skill.\n---\n");
  }, async ({ source, output }) => assert.rejects(buildPackages({ source, output }), /unknown package file/)));
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
