import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const mod = await import("file:///home/ridasaidd/forgepilot-chatgpt-mcp/src/opencode-worker.ts") as {
  abortOpenCodeWorker: (input: { packetId: string; workerId: string; approval: string }) => Promise<any>;
};

const RUNS_ROOT = "/home/ridasaidd/forgepilot/runs";
const OPENCODE_BIN = "/home/ridasaidd/.nvm/versions/node/v24.4.1/bin/opencode";
const packetId = "FP-026-ABORT-REGRESSION";
const root = path.join(RUNS_ROOT, packetId, "opencode-workers");
fs.rmSync(path.join(RUNS_ROOT, packetId), { recursive: true, force: true });
fs.mkdirSync(root, { recursive: true });

function workerDir(workerId: string) { return path.join(root, workerId); }
function processActive(pid: number): boolean {
  try { process.kill(pid, 0); return true; } catch { return false; }
}
async function waitForExit(pid: number, ms = 2500): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < ms) {
    if (!processActive(pid)) return true;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return !processActive(pid);
}
function makeStatus(workerId: string, pid: number, status = "RUNNING", executable = OPENCODE_BIN) {
  const dir = workerDir(workerId);
  fs.mkdirSync(dir, { recursive: true });
  const now = new Date().toISOString();
  const statusPath = path.join(dir, "status.json");
  const startRequestPath = path.join(dir, "start-request.json");
  const stdoutPath = path.join(dir, "stdout.log");
  const stderrPath = path.join(dir, "stderr.log");
  fs.writeFileSync(startRequestPath, JSON.stringify({ packetId, workerId, synthetic: true }, null, 2) + "\n");
  fs.writeFileSync(stdoutPath, "");
  fs.writeFileSync(stderrPath, "");
  const record = {
    workerId,
    packetId,
    requestId: null,
    modelId: "deepseek-v4-pro-high",
    targetWorkspaceId: "forgepilot-chatgpt-mcp",
    workspacePath: "/home/ridasaidd/forgepilot-chatgpt-mcp",
    promptFile: "/home/ridasaidd/forgepilot/runs/FP-024/executor-prompts/first-shadow-extraction.md",
    promptFileSha256: "synthetic-test-fixture",
    pid,
    status,
    startedAt: now,
    updatedAt: now,
    completedAt: status === "RUNNING" ? null : now,
    abortRequestedAt: null,
    abortedAt: null,
    abortSignal: null,
    timeoutSeconds: 60,
    stdoutPath,
    stderrPath,
    statusPath,
    startRequestPath,
    workerDir: dir,
    approvalSource: "CHATGPT_MCP_TOOL_APPROVAL",
    approvedToolName: "forgepilot_start_opencode_worker",
    command: { executable, args: ["synthetic"] },
    reasons: ["SYNTHETIC_ABORT_REGRESSION_FIXTURE"]
  };
  fs.writeFileSync(statusPath, JSON.stringify(record, null, 2) + "\n");
  return { dir, statusPath, startRequestPath, stdoutPath, stderrPath, record };
}
function spawnLongRunning(): ReturnType<typeof spawn> {
  const child = spawn("/bin/sh", ["-c", "trap 'exit 143' TERM; while true; do sleep 1; done"], {
    detached: true,
    stdio: "ignore",
  });
  child.unref();
  if (!child.pid) throw new Error("child pid missing");
  return child;
}
function cleanupPid(pid: number) {
  try { process.kill(-pid, "SIGTERM"); } catch {}
  try { process.kill(pid, "SIGTERM"); } catch {}
}

const results: Record<string, any> = {};

try {
  await mod.abortOpenCodeWorker({ packetId, workerId: "WORKER-NOT-FOUND", approval: "ABORT_OPENCODE_WORKER" });
  results.unknown_worker_refused = false;
} catch (error) {
  results.unknown_worker_refused = true;
  results.unknown_worker_error = error instanceof Error ? error.message : String(error);
}

makeStatus("WORKER-COMPLETED", 999999, "SUCCEEDED");
try {
  await mod.abortOpenCodeWorker({ packetId, workerId: "WORKER-COMPLETED", approval: "ABORT_OPENCODE_WORKER" });
  results.completed_worker_refused = false;
} catch (error) {
  results.completed_worker_refused = true;
  results.completed_worker_error = error instanceof Error ? error.message : String(error);
}

const malformedChild = spawnLongRunning();
const malformedPid = malformedChild.pid!;
makeStatus("WORKER-MALFORMED", malformedPid, "RUNNING", "/bin/sh");
try {
  await mod.abortOpenCodeWorker({ packetId, workerId: "WORKER-MALFORMED", approval: "ABORT_OPENCODE_WORKER" });
  results.malformed_record_refused = false;
} catch (error) {
  results.malformed_record_refused = true;
  results.malformed_record_error = error instanceof Error ? error.message : String(error);
  results.malformed_process_still_active_after_refusal = processActive(malformedPid);
}
cleanupPid(malformedPid);
await waitForExit(malformedPid);

const successChild = spawnLongRunning();
const successPid = successChild.pid!;
const successFixture = makeStatus("WORKER-SUCCESS", successPid, "RUNNING", OPENCODE_BIN);
const abortResult = await mod.abortOpenCodeWorker({ packetId, workerId: "WORKER-SUCCESS", approval: "ABORT_OPENCODE_WORKER" });
const exitedAfterAbort = await waitForExit(successPid);
const finalStatus = JSON.parse(fs.readFileSync(successFixture.statusPath, "utf8"));

results.successful_abort = {
  aborted: abortResult.aborted === true,
  signal: abortResult.signal,
  signalTarget: abortResult.signalTarget,
  processActiveBeforeAbort: abortResult.processActiveBeforeAbort,
  processExitedAfterAbort: exitedAfterAbort,
  finalStatus: finalStatus.status,
  completedAtSet: typeof finalStatus.completedAt === "string",
  abortRequestedAtSet: typeof finalStatus.abortRequestedAt === "string",
  abortedAtSet: typeof finalStatus.abortedAt === "string",
  abortSignal: finalStatus.abortSignal,
  reasons: finalStatus.reasons,
  statusArtifactExists: fs.existsSync(successFixture.statusPath),
  startRequestArtifactExists: fs.existsSync(successFixture.startRequestPath),
  stdoutArtifactExists: fs.existsSync(successFixture.stdoutPath),
  stderrArtifactExists: fs.existsSync(successFixture.stderrPath),
  partialWorkspaceRollbackPerformed: abortResult.partialWorkspaceRollbackPerformed,
};

const passed =
  results.unknown_worker_refused === true &&
  results.completed_worker_refused === true &&
  results.malformed_record_refused === true &&
  results.malformed_process_still_active_after_refusal === true &&
  results.successful_abort.aborted === true &&
  results.successful_abort.finalStatus === "ABORTED" &&
  results.successful_abort.processExitedAfterAbort === true &&
  results.successful_abort.completedAtSet === true &&
  results.successful_abort.abortRequestedAtSet === true &&
  results.successful_abort.abortedAtSet === true &&
  results.successful_abort.abortSignal === "SIGTERM" &&
  results.successful_abort.statusArtifactExists === true &&
  results.successful_abort.startRequestArtifactExists === true &&
  results.successful_abort.stdoutArtifactExists === true &&
  results.successful_abort.stderrArtifactExists === true &&
  results.successful_abort.partialWorkspaceRollbackPerformed === false;

const output = {
  packet_id: "FP-026",
  result: passed ? "WORKER_ABORT_PRIMITIVE_REGRESSION_PASS" : "WORKER_ABORT_PRIMITIVE_REGRESSION_FAIL",
  fixture_packet_id: packetId,
  scope_boundary: "Synthetic recorded worker process used for abort verification; no OpenCode worker was started and no workspace rollback was attempted.",
  ...results,
};
fs.writeFileSync("runs/FP-026/abort-regression-result.json", JSON.stringify(output, null, 2) + "\n");
console.log(JSON.stringify(output, null, 2));
if (!passed) process.exit(1);
