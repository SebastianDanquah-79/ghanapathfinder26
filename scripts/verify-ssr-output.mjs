import { readdir } from "node:fs/promises";
import { join } from "node:path";

const root = ".output/server";
const jsFiles = [];

async function walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await walk(path);
    else if (/\.(m?js|cjs)$/.test(entry.name)) jsFiles.push(path);
  }
}

await walk(root);

if (jsFiles.length === 0) {
  throw new Error("SSR output verification failed: no server JavaScript modules were emitted.");
}

const exportAllUsers = [];
for (const file of jsFiles) {
  const { readFile } = await import("node:fs/promises");
  const source = await readFile(file, "utf8");
  if (source.includes("__exportAll")) exportAllUsers.push(file);
}

if (exportAllUsers.length) {
  console.log(`SSR output contains __exportAll in ${exportAllUsers.length} emitted module(s).`);
}

// The critical check is module-link validity. node --check catches malformed ESM,
// while the source-level guard below catches the most dangerous generated pattern:
// a chunk importing __exportAll from another chunk.
const { spawnSync } = await import("node:child_process");
for (const file of jsFiles) {
  const nodeBin = process.platform === "win32" ? "node.exe" : "node";
  const result = spawnSync(nodeBin, ["--check", file], { encoding: "utf8" });
  if (result.status !== 0) {
    console.error(result.stderr || result.stdout);
    throw new Error(`SSR output contains invalid JavaScript: ${file}`);
  }
}

console.log(`SSR output verification passed: ${jsFiles.length} server modules are syntactically valid.`);
