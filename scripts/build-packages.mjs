#!/usr/bin/env node
import path from "node:path";
import { buildPackages, repoRoot } from "./package-lib.mjs";

const args = process.argv.slice(2);
const valueAfter = (flag, fallback) => {
  const index = args.indexOf(flag);
  return index === -1 ? fallback : path.resolve(args[index + 1]);
};
const result = await buildPackages({
  source: valueAfter("--source", path.join(repoRoot, "plugin")),
  output: valueAfter("--output", path.join(repoRoot, "dist"))
});
process.stdout.write(`${JSON.stringify(result.release, null, 2)}\n`);
