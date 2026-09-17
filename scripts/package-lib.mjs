import { createHash } from "node:crypto";
import { deflateRawSync } from "node:zlib";
import { execFileSync } from "node:child_process";
import {
  cp,
  lstat,
  mkdir,
  readFile,
  readdir,
  realpath,
  rm,
  stat,
  writeFile
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";

const here = path.dirname(fileURLToPath(import.meta.url));
export const repoRoot = path.resolve(here, "..");
export const endpoint = "https://app.bitterclip.com/mcp";
export const identity = Object.freeze({ name: "bitterclip", publisher: "SheetGenius, Inc." });
export const homepage = "https://bitterclip.com/";
export const mitLicenseText = `Copyright (c) 2026 SheetGenius, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
`;

function fail(message) {
  throw new Error(`package validation failed: ${message}`);
}

export function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

async function json(file) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    fail(`${path.relative(repoRoot, file)} is not valid JSON (${error.message})`);
  }
}

async function walk(root, relative = "") {
  const directory = path.join(root, relative);
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const next = path.join(relative, entry.name);
    const full = path.join(root, next);
    const info = await lstat(full);
    if (info.isSymbolicLink()) fail(`symlink is forbidden: ${next}`);
    if (info.isDirectory()) files.push(...await walk(root, next));
    else if (info.isFile()) files.push(next.split(path.sep).join("/"));
    else fail(`non-regular package entry is forbidden: ${next}`);
  }
  return files;
}

function assertSafeRelative(relative) {
  if (!relative || path.isAbsolute(relative) || relative.split("/").includes("..")) {
    fail(`unsafe package path: ${relative}`);
  }
}

function assertTextSafe(relative, content) {
  if (/\[(?:TODO|TBD|INSERT|REPLACE)[^\]]*\]/i.test(content) || /\b(?:CHANGEME|REPLACE_ME)\b/i.test(content)) {
    fail(`unresolved placeholder in ${relative}`);
  }
  if (/https?:\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0|[^/]+\.local)(?::\d+)?(?:\/|$)/i.test(content)) {
    fail(`development URL is forbidden in ${relative}`);
  }
  if (/\bbc_oauth_[A-Za-z0-9_-]+\b/i.test(content) || /\bBearer\s+(?:bc_oauth_[A-Za-z0-9_-]+|sk-[A-Za-z0-9_-]+|[A-Za-z0-9_-]{24,})\b/i.test(content) ||
      /\b(?:authorization|x-api-key|api[_-]?key|client[_-]?secret|access[_-]?token|refresh[_-]?token|password)\s*[:=]\s*(?:["']?\s*)?(?:Bearer\s+)?[A-Za-z0-9_./+=-]{12,}/i.test(content)) {
    fail(`credential or token-bearing content is forbidden in ${relative}`);
  }
}

function assertAssetSafe(relative, content) {
  if (!/\.svg$/i.test(relative)) return;
  const text = content.toString("utf8");
  if (/<script\b|\bon[a-z]+\s*=|<!ENTITY\b[^>]*(?:SYSTEM|PUBLIC)|@import\b/i.test(text)) {
    fail(`executable or external SVG asset is forbidden: ${relative}`);
  }
  for (const match of text.matchAll(/\b(?:href|xlink:href|src)\s*=\s*["']([^"']*)["']/gi)) {
    if (!/^#[A-Za-z_][A-Za-z0-9_.:-]*$/.test(match[1])) fail(`external SVG reference is forbidden: ${relative}`);
  }
  for (const match of text.matchAll(/url\(\s*(['"]?)(.*?)\1\s*\)/gi)) {
    if (!/^#[A-Za-z_][A-Za-z0-9_.:-]*$/.test(match[2])) fail(`external SVG resource is forbidden: ${relative}`);
  }
}

function validateSchema(schema, data, label) {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  const validate = ajv.compile(schema);
  if (!validate(data)) fail(`${label} violates pinned schema: ${ajv.errorsText(validate.errors)}`);
}

async function verifyPinnedSchema(file) {
  const record = await json(path.join(repoRoot, "schemas/sources.json"));
  const expected = record.schemas?.[file];
  if (!expected || expected.url !== `https://agent-plugins.org/schemas/1.0.0/${file}` || !/^[a-f0-9]{64}$/.test(expected.sha256)) {
    fail(`schema retrieval record is invalid for ${file}`);
  }
  const bytes = await readFile(path.join(repoRoot, "schemas", file));
  if (sha256(bytes) !== expected.sha256) fail(`vendored ${file} does not match its pinned retrieval checksum`);
  return JSON.parse(bytes);
}

function assertPortableIdentity(plugin, mcp) {
  if (plugin.name !== identity.name || !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(plugin.version) || typeof plugin.description !== "string" || !plugin.description) {
    fail("portable manifest identity does not match the release contract");
  }
  if (plugin.author?.name !== identity.publisher || plugin.author?.url !== "https://company.sheetgenius.com") {
    fail("portable manifest publisher does not match the release contract");
  }
  if (plugin.homepage !== homepage) fail("portable manifest homepage does not match the approved BitterClip homepage");
  if (plugin.license !== "MIT") fail("portable manifest must declare the approved MIT license");
  if ("repository" in plugin) fail("unapproved public repository claim");
  if (Object.keys(mcp.mcpServers).length !== 1 || !mcp.mcpServers.bitterclip) fail("portable package must have exactly one BitterClip MCP server");
  const server = mcp.mcpServers.bitterclip;
  if (server.type !== "streamable-http" || server.url !== endpoint || Object.keys(server).length !== 2) {
    fail("portable MCP server must be the sole streamable-http BitterClip endpoint without headers");
  }
}

function assertClaudeIdentity(plugin, mcp, marketplace, portable) {
  if (plugin.name !== portable.name || plugin.version !== portable.version || plugin.description !== portable.description || plugin.homepage !== portable.homepage || plugin.license !== portable.license || JSON.stringify(plugin.author) !== JSON.stringify(portable.author)) {
    fail("Claude manifest identity does not match the portable release identity");
  }
  if (plugin.license !== "MIT" || "repository" in plugin) fail("Claude manifest must derive the approved MIT license without a repository claim");
  if ("$schema" in mcp || Object.keys(mcp.mcpServers ?? {}).length !== 1) fail("Claude MCP config must be native-only and have one server");
  const server = mcp.mcpServers.bitterclip;
  if (!server || server.type !== "http" || server.url !== endpoint || Object.keys(server).length !== 2) {
    fail("Claude MCP config must use one native http BitterClip endpoint without headers");
  }
  const entry = marketplace.plugins?.[0];
  if (marketplace.name !== identity.name || marketplace.owner?.name !== identity.publisher || marketplace.plugins?.length !== 1 ||
      entry?.name !== portable.name || entry?.source !== "./plugins/bitterclip" || entry?.version !== portable.version || entry?.description !== portable.description) {
    fail("Claude marketplace metadata does not target the native BitterClip package");
  }
}

async function sourceFiles(source) {
  const layout = await json(path.join(repoRoot, "packaging/package-files.json"));
  if (!Array.isArray(layout.required) || !Array.isArray(layout.optional) || !Array.isArray(layout.assets)) fail("package file allowlist is malformed");
  const allowed = [...layout.required, ...layout.optional, ...layout.assets.map((asset) => `assets/${asset}`)];
  for (const relative of allowed) assertSafeRelative(relative);
  const actual = await walk(source);
  for (const relative of actual) if (!allowed.includes(relative)) fail(`unknown package file: ${relative}`);
  for (const relative of layout.required) {
    let info;
    try { info = await stat(path.join(source, relative)); } catch { fail(`missing required package file: ${relative}`); }
    if (!info.isFile()) fail(`required package path is not a file: ${relative}`);
  }
  return actual.sort();
}

async function assertLicenseFiles(source) {
  const expected = Buffer.from(mitLicenseText, "utf8");
  const rootLicense = await readFile(path.join(repoRoot, "LICENSE")).catch(() => fail("missing root LICENSE"));
  if (!rootLicense.equals(expected)) fail("root LICENSE does not contain the approved canonical MIT text");
  const packageLicense = await readFile(path.join(source, "LICENSE")).catch(() => fail("missing package LICENSE"));
  if (!packageLicense.equals(rootLicense)) fail("package LICENSE must be byte-identical to root LICENSE");
  return rootLicense;
}

export async function validateSource({ source = path.join(repoRoot, "plugin") } = {}) {
  const sourceInfo = await lstat(source).catch(() => fail(`missing package source: ${source}`));
  if (sourceInfo.isSymbolicLink() || !sourceInfo.isDirectory()) fail("package source must be a non-symlink directory");
  if (await realpath(source) !== path.resolve(source)) fail("package source must not resolve through a symlink");
  const files = await sourceFiles(source);
  await assertLicenseFiles(source);
  for (const relative of files) {
    const content = await readFile(path.join(source, relative));
    if (/\.(?:json|md)$/i.test(relative)) assertTextSafe(relative, content.toString("utf8"));
    assertAssetSafe(relative, content);
  }
  const plugin = await json(path.join(source, "plugin.json"));
  const mcp = await json(path.join(source, "mcp.json"));
  const pluginSchema = await verifyPinnedSchema("plugin.schema.json");
  const mcpSchema = await verifyPinnedSchema("mcp.schema.json");
  validateSchema(pluginSchema, plugin, "plugin.json");
  validateSchema(mcpSchema, mcp, "mcp.json");
  assertPortableIdentity(plugin, mcp);
  const claudeOverrides = await json(path.join(repoRoot, "packaging/claude/plugin.json"));
  const claudeMcpTemplate = await json(path.join(repoRoot, "packaging/claude/mcp.json"));
  const marketplaceTemplate = await json(path.join(repoRoot, "packaging/claude/marketplace.json"));
  if (Object.keys(claudeOverrides).length !== 1 || typeof claudeOverrides.native !== "object" || Array.isArray(claudeOverrides.native) || Object.keys(claudeOverrides.native).length !== 0) fail("Claude manifest template must not override shared identity or add hooks, MCP, or arbitrary metadata");
  if (Object.keys(claudeMcpTemplate).length !== 1 || claudeMcpTemplate.transport !== "http") fail("Claude MCP template must request native http transport only");
  if (Object.keys(marketplaceTemplate).length !== 1 || typeof marketplaceTemplate.native !== "object" || Array.isArray(marketplaceTemplate.native) || Object.keys(marketplaceTemplate.native).length !== 0) fail("Claude marketplace template must not override the generated marketplace metadata");
  const claudePlugin = { name: plugin.name, version: plugin.version, description: plugin.description, homepage: plugin.homepage, license: plugin.license, author: plugin.author };
  const claudeMcp = { mcpServers: { bitterclip: { type: claudeMcpTemplate.transport, url: mcp.mcpServers.bitterclip.url } } };
  const marketplace = {
    name: plugin.name,
    description: plugin.description,
    owner: { name: plugin.author.name },
    plugins: [{ name: plugin.name, source: `./plugins/${plugin.name}`, description: plugin.description, version: plugin.version }],
    ...marketplaceTemplate.native
  };
  assertClaudeIdentity(claudePlugin, claudeMcp, marketplace, plugin);
  const skills = files.filter((file) => file.startsWith("skills/"));
  return { files, plugin, mcp, claudePlugin, claudeMcp, marketplace, skills };
}

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function u16(value) { const out = Buffer.alloc(2); out.writeUInt16LE(value); return out; }
function u32(value) { const out = Buffer.alloc(4); out.writeUInt32LE(value >>> 0); return out; }

export function deterministicZip(entries) {
  const locals = [];
  const central = [];
  let offset = 0;
  for (const { name, bytes } of [...entries].sort((a, b) => a.name.localeCompare(b.name))) {
    assertSafeRelative(name);
    const fileName = Buffer.from(name, "utf8");
    const source = Buffer.from(bytes);
    const compressed = deflateRawSync(source, { level: 9 });
    const crc = crc32(source);
    const local = Buffer.concat([Buffer.from("504b0304", "hex"), u16(20), u16(0x0800), u16(8), u16(0), u16(0x21), u32(crc), u32(compressed.length), u32(source.length), u16(fileName.length), u16(0), fileName, compressed]);
    locals.push(local);
    central.push(Buffer.concat([Buffer.from("504b0102", "hex"), u16(0x0314), u16(20), u16(0x0800), u16(8), u16(0), u16(0x21), u32(crc), u32(compressed.length), u32(source.length), u16(fileName.length), u16(0), u16(0), u16(0), u16(0), u32(0o100644 << 16), u32(offset), fileName]));
    offset += local.length;
  }
  const centralBytes = Buffer.concat(central);
  return Buffer.concat([...locals, centralBytes, Buffer.from("504b0506", "hex"), u16(0), u16(0), u16(entries.length), u16(entries.length), u32(centralBytes.length), u32(offset), u16(0)]);
}

async function packageEntries(source, files, prefix = "") {
  return Promise.all(files.map(async (relative) => ({
    name: `${prefix}${relative}`,
    bytes: await readFile(path.join(source, relative))
  })));
}

function skillTreeHash(entries) {
  const lines = entries.filter((entry) => entry.name.includes("skills/")).sort((a, b) => a.name.localeCompare(b.name)).map((entry) => `${entry.name.replace(/^.*skills\//, "skills/")}\0${sha256(entry.bytes)}\n`);
  return sha256(Buffer.from(lines.join("")));
}

async function writeTree(root, entries) {
  await rm(root, { recursive: true, force: true });
  for (const entry of entries) {
    const target = path.join(root, entry.name);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, entry.bytes, { mode: 0o644 });
  }
}

function gitCommit() {
  try { return execFileSync("git", ["rev-parse", "--verify", "HEAD"], { cwd: repoRoot, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(); }
  catch { return null; }
}

function isManagedOutput(output) {
  const resolved = path.resolve(output);
  return resolved === path.join(repoRoot, "dist") || resolved.startsWith(`${path.join(repoRoot, ".tmp")}${path.sep}`);
}

async function assertNoSymlinkAncestry(target, label) {
  const resolved = path.resolve(target);
  if (!(resolved === repoRoot || resolved.startsWith(`${repoRoot}${path.sep}`))) fail(`${label} escapes the repository`);
  const segments = path.relative(repoRoot, resolved).split(path.sep).filter(Boolean);
  let current = repoRoot;
  const rootInfo = await lstat(current);
  if (rootInfo.isSymbolicLink()) fail(`${label} has a symlinked repository root`);
  for (const segment of segments) {
    current = path.join(current, segment);
    const info = await lstat(current).catch(() => null);
    if (info?.isSymbolicLink()) fail(`${label} has a symlinked ancestor: ${path.relative(repoRoot, current)}`);
  }
}

async function assertOutputTreeSafe(output, pluginName, version) {
  await assertNoSymlinkAncestry(output, "output directory");
  for (const relative of [
    "portable",
    `portable/${pluginName}`,
    "claude",
    "claude/.claude-plugin",
    "claude/.claude-plugin/marketplace.json",
    "claude/plugins",
    `claude/plugins/${pluginName}`,
    "archives",
    `archives/${pluginName}-${version}-agent-plugin.zip`,
    `archives/${pluginName}-${version}-claude-plugin.zip`,
    `release-${version}.json`
  ]) {
    await assertNoSymlinkAncestry(path.join(output, relative), "output directory");
  }
}

async function inputFingerprint(source, sourceFiles) {
  const inputs = sourceFiles.map((relative) => ({ name: `plugin/${relative}`, file: path.join(source, relative) }));
  for (const relative of ["LICENSE", "packaging/package-files.json", "packaging/claude/plugin.json", "packaging/claude/mcp.json", "packaging/claude/marketplace.json", "schemas/plugin.schema.json", "schemas/mcp.schema.json", "schemas/sources.json", "scripts/package-lib.mjs", "scripts/build-packages.mjs", "scripts/verify-packages.mjs", "package.json", "package-lock.json"]) {
    inputs.push({ name: relative, file: path.join(repoRoot, relative) });
  }
  const lines = [];
  for (const input of inputs.sort((a, b) => a.name.localeCompare(b.name))) lines.push(`${input.name}\0${sha256(await readFile(input.file))}\n`);
  return sha256(Buffer.from(lines.join("")));
}

function inputGitStatus() {
  try {
    return execFileSync("git", ["status", "--porcelain", "--", "LICENSE", "plugin", "packaging", "schemas", "scripts", "package.json", "package-lock.json"], { cwd: repoRoot, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch { return "unknown"; }
}

export async function buildPackages({ source = path.join(repoRoot, "plugin"), output = path.join(repoRoot, "dist") } = {}) {
  if (!isManagedOutput(output)) fail("output must be the managed dist directory or a fresh repository .tmp proof directory");
  const outputInfo = await lstat(output).catch(() => null);
  if (outputInfo?.isSymbolicLink()) fail("output directory must not be a symlink");
  const validated = await validateSource({ source });
  await assertOutputTreeSafe(output, validated.plugin.name, validated.plugin.version);
  const portableEntries = await packageEntries(source, validated.files);
  const nativeCopied = await packageEntries(source, validated.files.filter((file) => file !== "plugin.json" && file !== "mcp.json"));
  const nativeEntries = [
    { name: ".claude-plugin/plugin.json", bytes: Buffer.from(`${JSON.stringify(validated.claudePlugin, null, 2)}\n`) },
    { name: ".mcp.json", bytes: Buffer.from(`${JSON.stringify(validated.claudeMcp, null, 2)}\n`) },
    ...nativeCopied
  ];
  const marketplaceEntries = [
    { name: ".claude-plugin/marketplace.json", bytes: Buffer.from(`${JSON.stringify(validated.marketplace, null, 2)}\n`) },
    ...nativeEntries.map((entry) => ({ ...entry, name: `plugins/${validated.plugin.name}/${entry.name}` }))
  ];
  await mkdir(output, { recursive: true });
  const portableArchive = deterministicZip(portableEntries);
  const nativeArchive = deterministicZip(nativeEntries);
  const portableRoot = path.join(output, "portable", validated.plugin.name);
  const claudeRoot = path.join(output, "claude", "plugins", validated.plugin.name);
  await assertOutputTreeSafe(output, validated.plugin.name, validated.plugin.version);
  await writeTree(portableRoot, portableEntries);
  await writeTree(claudeRoot, nativeEntries);
  await mkdir(path.join(output, "claude", ".claude-plugin"), { recursive: true });
  await writeFile(path.join(output, "claude", ".claude-plugin", "marketplace.json"), marketplaceEntries[0].bytes, { mode: 0o644 });
  await mkdir(path.join(output, "archives"), { recursive: true });
  await writeFile(path.join(output, "archives", `${validated.plugin.name}-${validated.plugin.version}-agent-plugin.zip`), portableArchive);
  await writeFile(path.join(output, "archives", `${validated.plugin.name}-${validated.plugin.version}-claude-plugin.zip`), nativeArchive);
  const commit = path.resolve(source) === path.join(repoRoot, "plugin") ? gitCommit() : null;
  const dirty = inputGitStatus();
  const release = {
    package: validated.plugin.name,
    version: validated.plugin.version,
    source_commit: commit,
    source_commit_status: !commit ? "uncommitted-source" : dirty ? "dirty-or-untracked-input" : "recorded",
    build_input_sha256: await inputFingerprint(source, validated.files),
    endpoint,
    schemas: await json(path.join(repoRoot, "schemas/sources.json")),
    manifests: {
      portable_plugin_sha256: sha256(portableEntries.find((entry) => entry.name === "plugin.json").bytes),
      portable_mcp_sha256: sha256(portableEntries.find((entry) => entry.name === "mcp.json").bytes),
      claude_plugin_sha256: sha256(nativeEntries.find((entry) => entry.name === ".claude-plugin/plugin.json").bytes),
      claude_mcp_sha256: sha256(nativeEntries.find((entry) => entry.name === ".mcp.json").bytes),
      claude_marketplace_sha256: sha256(marketplaceEntries[0].bytes)
    },
    artifacts: {
      portable: { file: `${validated.plugin.name}-${validated.plugin.version}-agent-plugin.zip`, sha256: sha256(portableArchive) },
      claude: { file: `${validated.plugin.name}-${validated.plugin.version}-claude-plugin.zip`, sha256: sha256(nativeArchive) }
    },
    skill_tree_sha256: skillTreeHash(portableEntries),
    package_files: validated.files
  };
  await writeFile(path.join(output, `release-${validated.plugin.version}.json`), `${JSON.stringify(release, null, 2)}\n`);
  return { output, release, portableEntries, nativeEntries, marketplaceEntries };
}

export async function hasClaudeCli() {
  try { execFileSync("claude", ["--version"], { stdio: "ignore" }); return true; } catch { return false; }
}

export function validateClaudeNative(nativeRoot) {
  execFileSync("claude", ["plugin", "validate", nativeRoot, "--strict"], { encoding: "utf8", stdio: "pipe" });
}
