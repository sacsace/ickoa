/**
 * Force NODE_ENV=production for `next build`.
 * A shell or Railway env of NODE_ENV=development breaks App Router prerender
 * (/_global-error) with: Cannot read properties of null (reading 'useContext').
 */
process.env.NODE_ENV = "production";

import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const nextBin = require.resolve("next/dist/bin/next");

const result = spawnSync(process.execPath, [nextBin, "build", ...process.argv.slice(2)], {
  stdio: "inherit",
  env: { ...process.env, NODE_ENV: "production" },
});

process.exit(result.status ?? 1);
