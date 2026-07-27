import { spawn } from "node:child_process";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

function start(name, command, args) {
  const proc = spawn(command, args, {
    cwd: ROOT,
    stdio: ["ignore", "inherit", "inherit"],
    shell: true,
  });
  proc.on("close", (code) => {
    console.log(`[${name}] exited (${code})`);
    process.exit(code);
  });
  return proc;
}

console.log("Starting API server (port 5173) and Vite dev server (port 80)...\n");
const api = start("api", "node", ["server/index.js"]);
const vite = start("vite", "npx", ["vite", "--configLoader", "runner"]);

process.on("SIGINT", () => {
  api.kill();
  vite.kill();
  process.exit(0);
});
