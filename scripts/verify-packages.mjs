#!/usr/bin/env node
import path from "node:path";
import { buildPackages, hasClaudeCli, repoRoot, validateClaudeNative } from "./package-lib.mjs";

const args = process.argv.slice(2);
const valueAfter = (flag, fallback) => {
  const index = args.indexOf(flag);
  return index === -1 ? fallback : path.resolve(args[index + 1]);
};
const output = valueAfter("--output", path.join(repoRoot, "dist"));
const result = await buildPackages({ source: valueAfter("--source", path.join(repoRoot, "plugin")), output });
if (await hasClaudeCli()) validateClaudeNative(path.join(output, "claude", "plugins", result.release.package));
else process.stdout.write("Claude CLI unavailable; native validation not run.\n");
process.stdout.write(`verified ${result.release.package}@${result.release.version}\n`);
