import { cp, mkdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

await mkdir(resolve(projectRoot, "mobile", "public"), { recursive: true });
await cp(
  resolve(projectRoot, "public"),
  resolve(projectRoot, "mobile", "public"),
  {
    recursive: true,
    force: true,
  }
);

const nextBin = resolve(
  projectRoot,
  "node_modules",
  "next",
  "dist",
  "bin",
  "next"
);
const child = spawn(process.execPath, [nextBin, "build", "mobile"], {
  cwd: projectRoot,
  stdio: "inherit",
});

child.on("exit", (code) => process.exit(code ?? 1));
