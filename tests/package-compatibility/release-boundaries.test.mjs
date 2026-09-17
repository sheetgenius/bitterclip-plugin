import assert from "node:assert/strict";
import { cp, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { buildPackages, repoRoot } from "../../scripts/package-lib.mjs";

async function specimen(run) {
  await mkdir(path.join(repoRoot, ".tmp"), { recursive: true });
  const root = await mkdtemp(path.join(repoRoot, ".tmp", "release-boundary-"));
  const source = path.join(root, "source");
  await cp(path.join(repoRoot, "plugin"), source, { recursive: true });
  try { await run({ root, source, output: path.join(root, "output") }); }
  finally { await rm(root, { recursive: true, force: true }); }
}

test("package rejects token-bearing prose without banning OAuth explanations", async () => {
  await specimen(async ({ source, output }) => {
    await writeFile(path.join(source, "README.md"), "Authorization uses OAuth; never paste a password.\n");
    await buildPackages({ source, output });
    await writeFile(path.join(source, "README.md"), "Authorization: Bearer bc_oauth_test_fixture_not_a_real_credential\n");
    await assert.rejects(buildPackages({ source, output }), /credential|secret|token/i);
  });
});

test("package rejects external SVG references including protocol-relative URLs", async () => {
  await specimen(async ({ source, output }) => {
    await writeFile(path.join(source, "assets/bitterclip-icon.svg"), '<svg xmlns="http://www.w3.org/2000/svg"><image href="//example.invalid/track.svg"/></svg>');
    await assert.rejects(buildPackages({ source, output }), /SVG|asset/i);
  });
});

test("a symlink in the generated-output ancestry cannot redirect or erase writes", async () => {
  await specimen(async ({ root, source, output }) => {
    const protectedTree = path.join(root, "protected");
    await mkdir(path.join(protectedTree, "bitterclip"), { recursive: true });
    const sentinel = path.join(protectedTree, "bitterclip", "sentinel.txt");
    await writeFile(sentinel, "keep me");
    await mkdir(output);
    await symlink(protectedTree, path.join(output, "portable"));
    await assert.rejects(buildPackages({ source, output }), /symlink|output/i);
    assert.equal(await readFile(sentinel, "utf8"), "keep me");
  });
});

test("caller-supplied fixture source cannot be attributed to the checkout commit", async () => {
  await specimen(async ({ source, output }) => {
    const { release } = await buildPackages({ source, output });
    assert.notEqual(release.source_commit_status, "recorded");
  });
});

test("existing archive and release-record symlinks cannot redirect final writes", async () => {
  for (const relativeForSource of [
    async (source) => {
      const manifest = JSON.parse(await readFile(path.join(source, "plugin.json"), "utf8"));
      return `archives/${manifest.name}-${manifest.version}-claude-plugin.zip`;
    },
    async (source) => {
      const manifest = JSON.parse(await readFile(path.join(source, "plugin.json"), "utf8"));
      return `release-${manifest.version}.json`;
    }
  ]) {
    await specimen(async ({ root, source, output }) => {
      const relative = await relativeForSource(source);
      const sentinel = path.join(root, "protected.txt");
      await writeFile(sentinel, "keep me");
      await mkdir(path.dirname(path.join(output, relative)), { recursive: true });
      await symlink(sentinel, path.join(output, relative));
      await assert.rejects(buildPackages({ source, output }), /symlink|output/i);
      assert.equal(await readFile(sentinel, "utf8"), "keep me");
    });
  }
});
