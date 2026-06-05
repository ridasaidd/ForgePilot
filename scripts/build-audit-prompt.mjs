import { readFile, writeFile, access } from "node:fs/promises";
import { resolve, basename } from "node:path";
import { parseArgs } from "node:util";

const STALE_PATTERNS = [/\[PASTE/i, /\bTODO\b/, /\bPLACEHOLDER\b/];
const PLACEHOLDER_RE = /\{\{[A-Z_]+\}\}/g;

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function die(message) {
  process.stderr.write(`ERROR: ${message}\n`);
  process.exit(1);
}

async function main() {
  const rawArgs = process.argv.slice(2);
  const args = rawArgs[0] === "--" && rawArgs.length > 1 ? rawArgs.slice(1) : rawArgs;

  const { values } = parseArgs({
    args,
    options: {
      "task-id": { type: "string" },
      "task-title": { type: "string" },
      packet: { type: "string" },
      result: { type: "string" },
      verify: { type: "string" },
      status: { type: "string" },
      diff: { type: "string" },
      out: { type: "string" },
    },
  });

  const taskId = values["task-id"];
  const taskTitle = values["task-title"];
  const packetPath = values.packet;
  const resultPath = values.result;
  const verifyPath = values.verify;
  const statusPath = values.status;
  const diffPath = values.diff;
  const outPath = values.out;

  if (!taskId) die("--task-id is required");
  if (!taskTitle) die("--task-title is required");
  if (!packetPath) die("--packet is required");
  if (!resultPath) die("--result is required");
  if (!verifyPath) die("--verify is required");
  if (!statusPath) die("--status is required");
  if (!diffPath) die("--diff is required");
  if (!outPath) die("--out is required");

  const files = {
    packet: packetPath,
    result: resultPath,
    verify: verifyPath,
    status: statusPath,
    diff: diffPath,
  };

  for (const [label, filePath] of Object.entries(files)) {
    const resolved = resolve(filePath);
    if (!(await fileExists(resolved))) {
      die(`input file not found: ${resolved} (--${label})`);
    }
  }

  const templatePath = resolve("prompts/audit-template.md");
  if (!(await fileExists(templatePath))) {
    die(`template file not found: ${templatePath}`);
  }

  const template = await readFile(templatePath, "utf-8");

  const [packetContent, resultContent, verifyContent, statusContent, diffContent] =
    await Promise.all([
      readFile(resolve(packetPath), "utf-8"),
      readFile(resolve(resultPath), "utf-8"),
      readFile(resolve(verifyPath), "utf-8"),
      readFile(resolve(statusPath), "utf-8"),
      readFile(resolve(diffPath), "utf-8"),
    ]);

  let output = template
    .replace(/\{\{TASK_ID\}\}/g, taskId)
    .replace(/\{\{TASK_TITLE\}\}/g, taskTitle)
    .replace(/\{\{ORIGINAL_PACKET\}\}/g, packetContent.trim())
    .replace(/\{\{EXECUTOR_RESULT\}\}/g, resultContent.trim())
    .replace(/\{\{VERIFICATION_OUTPUT\}\}/g, verifyContent.trim())
    .replace(/\{\{GIT_STATUS\}\}/g, statusContent.trim())
    .replace(/\{\{RELEVANT_DIFF\}\}/g, diffContent.trim());

  const unreplaced = output.match(PLACEHOLDER_RE);
  if (unreplaced) {
    die(`unreplaced placeholders remain: ${unreplaced.join(", ")}`);
  }

  for (const pattern of STALE_PATTERNS) {
    if (pattern.test(output)) {
      die(`stale content detected matching: ${pattern}`);
    }
  }

  const resolvedOut = resolve(outPath);
  await writeFile(resolvedOut, output, "utf-8");
  process.stderr.write(`Audit prompt written to ${resolvedOut}\n`);
}

main();
