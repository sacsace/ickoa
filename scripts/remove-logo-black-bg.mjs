/**
 * Prefer `node scripts/build-ci-logos.mjs` — it rebuilds CI PNGs with
 * edge flood-fill knockout (keeps black wordmarks) instead of nuking all near-black.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const result = spawnSync(process.execPath, [path.join(root, "scripts/build-ci-logos.mjs")], {
  stdio: "inherit",
});
process.exit(result.status ?? 1);
