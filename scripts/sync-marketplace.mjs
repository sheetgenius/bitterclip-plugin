#!/usr/bin/env node
// Keeps the installable marketplaces at the repository root in step with the
// canonical plugin/ source, so people can install straight from GitHub:
//
//   claude plugin marketplace add sheetgenius/bitterclip-plugin
//   codex plugin marketplace add https://github.com/sheetgenius/bitterclip-plugin.git --ref main
//
// Everything written here is generated. Edit plugin/ or packaging/, then run
// `npm run marketplace`. `--check` fails when the committed files have drifted.
import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { buildPackages, repoRoot } from "./package-lib.mjs";

const CHECK = process.argv.includes("--check");
const STARTER_PROMPT =
  "Using BitterClip, help me make my first clip. Briefly explain how you can help, then show my recent recordings or help me upload one.";

const tmp = path.join(repoRoot, ".tmp", `marketplace-${randomUUID()}`);
const { marketplaceEntries, release } = await buildPackages({ output: tmp });
await rm(tmp, { recursive: true, force: true });

const plugin = JSON.parse(await readFile(path.join(repoRoot, "plugin", "plugin.json"), "utf8"));
const pluginRoot = `plugins/${plugin.name}`;
const json = (value) => Buffer.from(`${JSON.stringify(value, null, 2)}\n`);

const codexPlugin = {
  name: plugin.name,
  version: plugin.version,
  description: plugin.description,
  author: plugin.author,
  homepage: "https://bitterclip.com/connect",
  repository: "https://github.com/sheetgenius/bitterclip-plugin",
  license: plugin.license,
  keywords: ["video", "editing", "clips", "transcripts", "mcp"],
  skills: "./skills/",
  interface: {
    displayName: "BitterClip",
    shortDescription: "Turn recordings into editable clips and finished videos",
    longDescription:
      "Find the moment worth sharing in a recording, cut it into an editable clip, and render the exact finished video. " +
      "BitterClip keeps every cut linked to its source recording, and every prepared post waits for your confirmation in BitterClip.",
    developerName: plugin.author.name,
    category: "Productivity",
    capabilities: ["Interactive", "Read", "Write"],
    websiteURL: "https://bitterclip.com",
    defaultPrompt: [STARTER_PROMPT]
  },
  mcpServers: "./.mcp.json"
};

const codexMarketplace = {
  name: plugin.name,
  interface: { displayName: "BitterClip" },
  plugins: [
    {
      name: plugin.name,
      source: { source: "local", path: `./${pluginRoot}` },
      policy: { installation: "AVAILABLE", authentication: "ON_INSTALL" },
      category: "Productivity"
    }
  ]
};

const generated = [
  ...marketplaceEntries,
  { name: `${pluginRoot}/.codex-plugin/plugin.json`, bytes: json(codexPlugin) },
  { name: ".agents/plugins/marketplace.json", bytes: json(codexMarketplace) }
];

if (CHECK) {
  const drifted = [];
  for (const entry of generated) {
    const committed = await readFile(path.join(repoRoot, entry.name)).catch(() => null);
    if (!committed || !committed.equals(entry.bytes)) drifted.push(entry.name);
  }
  if (drifted.length) {
    process.stderr.write(`Marketplace files are out of date; run npm run marketplace:\n  ${drifted.join("\n  ")}\n`);
    process.exit(1);
  }
  process.stdout.write(`marketplace in step with ${release.package}@${release.version}\n`);
} else {
  await rm(path.join(repoRoot, pluginRoot), { recursive: true, force: true });
  for (const entry of generated) {
    const target = path.join(repoRoot, entry.name);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, entry.bytes, { mode: 0o644 });
  }
  process.stdout.write(`wrote marketplace for ${release.package}@${release.version}\n`);
}
