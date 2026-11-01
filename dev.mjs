import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(fileURLToPath(import.meta.url));
const isWin = process.platform === "win32";
const npmCmd = isWin ? "npm.cmd" : "npm";

function startService(name, folder, colorCode) {
  const cwd = resolve(rootDir, folder);
  const child = spawn(npmCmd, ["run", "dev"], {
    cwd,
    stdio: ["ignore", "pipe", "pipe"],
    shell: isWin,
    env: { ...process.env, FORCE_COLOR: "1" },
  });

  const prefix = `\x1b[${colorCode}m[${name}]\x1b[0m `;

  child.stdout.on("data", (chunk) => {
    for (const line of chunk.toString().split(/\r?\n/)) {
      if (line.trim()) process.stdout.write(`${prefix}${line}\n`);
    }
  });

  child.stderr.on("data", (chunk) => {
    for (const line of chunk.toString().split(/\r?\n/)) {
      if (line.trim()) process.stderr.write(`${prefix}${line}\n`);
    }
  });

  child.on("exit", (code) => {
    if (code !== 0 && code !== null) {
      console.error(`${prefix}exited with code ${code}`);
    }
  });

  return child;
}

console.log("\x1b[33mStarting StudioSpace Backend (port 5000) + Frontend (port 3000)...\x1b[0m\n");

const serverProc = startService("SERVER :5000", "studiospace-server", "36");
const clientProc = startService("CLIENT :3000", "studiospace-client", "35");

function shutdown() {
  serverProc.kill();
  clientProc.kill();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

