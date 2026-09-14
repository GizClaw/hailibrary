#!/usr/bin/env node

import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const child = spawn(process.execPath, ["--experimental-strip-types", join(dirname(fileURLToPath(import.meta.url)), "main.ts"), ...process.argv.slice(2)], {
  stdio: "inherit",
});
child.on("error", (error) => {
  console.error(`imagegen: ${error.message}`);
  process.exitCode = 1;
});
child.on("exit", (code, signal) => {
  process.exitCode = code ?? (signal ? 1 : 0);
});
