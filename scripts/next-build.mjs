/**
 * Force NODE_ENV=production and prefer webpack for production builds.
 * - Shell/Railway NODE_ENV=development breaks /_global-error prerender (useContext null).
 * - Turbopack production builds often OOM on small Railway builders.
 */
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const nextBin = require.resolve("next/dist/bin/next");

const result = spawnSync(
  process.execPath,
  [nextBin, "build", "--webpack", ...process.argv.slice(2)],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      NODE_ENV: "production",
      NODE_OPTIONS: [process.env.NODE_OPTIONS, "--max-old-space-size=4096"]
        .filter(Boolean)
        .join(" "),
    },
  },
);

process.exit(result.status ?? 1);
