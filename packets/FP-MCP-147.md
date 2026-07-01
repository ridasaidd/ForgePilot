# FP-MCP-147 — Human-Approved Terminal Command MCP Tool

## Status

DRAFT

## Purpose

Add a controlled terminal command capability to the ForgePilot ChatGPT MCP bridge so GPT can request shell commands against allowlisted workspaces, while every execution remains human-approved, bounded, observable, and evidence-recorded.

This packet exists to reduce the user’s role as a manual copy/paste relay between ChatGPT, the terminal, OpenCode, and repository files.

The desired workflow is:

```text
GPT proposes an exact command.
The human sees the command, working directory, risk classification, and expected effect.
The human approves or denies.
The MCP bridge executes only the exact approved command.
The result is returned to GPT with stdout, stderr, exit code, timing, and evidence paths.
```

This gives GPT “hands” without granting silent or unrestricted shell access.

## Background

The current MCP bridge can list/read limited ForgePilot artifacts, create OpenCode request artifacts for existing packets, and attempt guarded runner starts. However, GPT cannot yet:

* create a new packet file,
* inspect arbitrary allowlisted workspace files,
* run `git status`,
* run `git diff`,
* run builds/tests,
* save exact generated text into the repository,
* inspect command output directly.

As a result, the human operator still has to manually run commands, paste output, save files, and bridge context between the terminal and ChatGPT.

This packet introduces a controlled terminal surface so GPT can request those actions through MCP with human approval.

## Non-Goals

This packet must not:

* grant silent shell access,
* grant unrestricted shell access,
* bypass human approval,
* bypass ForgePilot evidence discipline,
* grant access outside allowlisted workspaces,
* expose secrets,
* allow arbitrary background daemons,
* mutate request artifacts silently,
* start OpenCode directly,
* replace the existing guarded runner start path,
* add autonomous execution,
* add model routing,
* add cost optimization,
* add long-running job orchestration beyond a bounded command timeout.

## Scope

Implement a human-approved terminal command flow in the MCP bridge.

The initial allowed workspaces are:

```json
[
  {
    "workspaceId": "forgepilot",
    "path": "/home/ridasaidd/forgepilot"
  },
  {
    "workspaceId": "forgepilot-chatgpt-mcp",
    "path": "/home/ridasaidd/forgepilot-chatgpt-mcp"
  }
]
```

Unknown workspaces must fail closed.

All commands must execute with an explicit working directory inside one of the allowlisted workspaces.

## Required MCP Tools

### 1. `forgepilot_prepare_terminal_command`

Prepare a terminal command request without executing it.

This tool is non-executing.

It must return a durable command approval artifact containing the exact command to be approved.

#### Input

```ts
{
  packetId?: string;
  targetWorkspaceId: string;
  workingDirectory?: string;
  command: string;
  rationale: string;
  timeoutSeconds?: number;
  approval: "PREPARE_TERMINAL_COMMAND";
}
```

#### Rules

* `targetWorkspaceId` must be allowlisted.
* `workingDirectory`, if provided, must resolve inside the target workspace.
* `command` must be non-empty.
* `rationale` must be non-empty.
* `timeoutSeconds` must default to a safe value, for example 30 seconds.
* `timeoutSeconds` must be capped, for example 120 seconds in v1.
* The tool must not execute the command.
* The tool must compute a canonical command hash.
* The tool must classify risk before approval.
* The tool must return a human-readable approval summary.

#### Output

```ts
{
  prepared: true;
  terminalCommandRequestId: string;
  packetId: string | null;
  targetWorkspaceId: string;
  workspacePath: string;
  workingDirectory: string;
  command: string;
  commandSha256: string;
  rationale: string;
  riskLevel: "READ_ONLY" | "TEST_COMMAND" | "SAFE_WRITE" | "GIT_MUTATION" | "SERVICE_MUTATION" | "NETWORK" | "HIGH_RISK" | "BLOCKED";
  writesLikely: boolean;
  networkLikely: boolean;
  secretsRiskLikely: boolean;
  timeoutSeconds: number;
  approvalInstruction: string;
  evidencePath: string;
  reasons: string[];
}
```

### 2. `forgepilot_execute_approved_terminal_command`

Execute a previously prepared terminal command only after exact human approval.

#### Input

```ts
{
  terminalCommandRequestId: string;
  commandSha256: string;
  approval: "EXECUTE_APPROVED_TERMINAL_COMMAND";
}
```

#### Rules

* The prepared request must exist.
* The command hash must match exactly.
* The command must not be reinterpreted, rewritten, or substituted.
* The command must execute only in the recorded working directory.
* The command must execute with the recorded timeout.
* The command must use a sanitized environment.
* The command must capture stdout.
* The command must capture stderr.
* The command must capture exit code.
* The command must capture signal if terminated.
* The command must record started/completed timestamps.
* The command must record pre/post git status when the working directory is inside a git repository.
* The command must write an append-only result artifact.
* The tool must return truncated stdout/stderr inline and full evidence paths.

#### Output

```ts
{
  executed: true;
  terminalCommandRequestId: string;
  packetId: string | null;
  targetWorkspaceId: string;
  workingDirectory: string;
  command: string;
  commandSha256: string;
  exitCode: number | null;
  signal: string | null;
  timedOut: boolean;
  durationMs: number;
  stdout: string;
  stderr: string;
  stdoutTruncated: boolean;
  stderrTruncated: boolean;
  preGitStatusShort: string | null;
  postGitStatusShort: string | null;
  changedFilesLikely: string[];
  requestEvidencePath: string;
  resultEvidencePath: string;
  reasons: string[];
}
```

## Evidence Paths

Prepared command requests must be recorded under:

```text
runs/<packetId-or-OPERATOR>/terminal-commands/<terminalCommandRequestId>-request.json
```

Execution results must be recorded under:

```text
runs/<packetId-or-OPERATOR>/terminal-commands/<terminalCommandRequestId>-result.json
```

Full stdout/stderr may be recorded as:

```text
runs/<packetId-or-OPERATOR>/terminal-commands/<terminalCommandRequestId>-stdout.log
runs/<packetId-or-OPERATOR>/terminal-commands/<terminalCommandRequestId>-stderr.log
```

The result JSON must include hashes of stdout/stderr log files when present.

## Command Request ID Format

Use a durable ID such as:

```text
TERM-YYYYMMDDTHHMMSSmmmZ-<8 hex chars>
```

Example:

```text
TERM-20260701T161500123Z-a1b2c3d4
```

## Risk Classification

The prepare tool must classify commands before approval.

Initial risk classes:

### `READ_ONLY`

Commands expected not to mutate files or system state.

Examples:

```bash
git status --short
git diff --stat
git log --oneline -10
ls
find . -maxdepth 2 -type f
sed -n '1,120p' packets/FP-MCP-147.md
cat package.json
```

### `TEST_COMMAND`

Commands that may create cache/build/test artifacts but are normal project verification commands.

Examples:

```bash
pnpm build
pnpm test
node --check src/server.ts
```

### `SAFE_WRITE`

Commands that write specific files inside allowlisted workspaces.

Examples:

```bash
cat > packets/FP-MCP-147.md
printf '%s\n' 'text' > docs/example.md
```

### `GIT_MUTATION`

Commands that mutate git state.

Examples:

```bash
git add packets/FP-MCP-147.md
git commit -m "Add FP-MCP-147 terminal command packet"
git checkout -b fp-mcp-147-terminal-command-tool
```

### `SERVICE_MUTATION`

Commands that affect services.

Examples:

```bash
systemctl --user restart forgepilot-chatgpt-mcp.service
```

### `NETWORK`

Commands that may contact the network.

Examples:

```bash
pnpm install
curl https://example.com
```

### `HIGH_RISK`

Commands that may be valid but require special caution.

Examples:

```bash
rm file
mv directory
chmod file
```

### `BLOCKED`

Commands that must not execute in v1.

Examples:

```bash
sudo ...
su ...
rm -rf /
rm -rf ~
curl ... | sh
wget ... | sh
cat ~/.ssh/id_rsa
cat .env
env
printenv
ssh ...
scp ...
```

## Hard Blocks

The implementation must block execution of commands that attempt to:

* use `sudo`,
* use `su`,
* read private keys,
* read `.env` files,
* read secret/token files,
* access `.git` internals directly,
* execute outside the allowlisted workspace,
* write outside the allowlisted workspace,
* use destructive recursive deletes,
* pipe remote network content directly into a shell,
* start unbounded background processes,
* run without a timeout.

Human approval must not override hard blocks in v1.

## Environment

Commands must execute with a sanitized environment.

The implementation must not expose secrets through environment variables.

At minimum:

* do not pass raw process environment wholesale,
* preserve only necessary safe variables such as `PATH`, `HOME`, `SHELL`, `USER`, `LANG`, and package-manager related non-secret values if required,
* do not include tokens,
* do not include API keys,
* do not include SSH agent variables in v1 unless explicitly justified later.

## Shell Semantics

The command may be executed through a shell to preserve normal terminal usefulness, for example:

```bash
/bin/bash -lc "<command>"
```

However:

* the exact command string must be displayed before approval,
* the exact command string must be hashed,
* the exact approved command string must be the executed command,
* the working directory must be controlled separately,
* command output must be captured.

## Approval Binding

The execute tool must bind approval to:

* `terminalCommandRequestId`,
* `commandSha256`,
* `targetWorkspaceId`,
* `workingDirectory`,
* `command`,
* `timeoutSeconds`.

If any of these differ from the prepared artifact, execution must fail closed.

## Expected First Use Case

After this packet is implemented, GPT should be able to request:

```bash
cat > packets/FP-MCP-148.md <<'EOF'
...
EOF
```

The human operator should approve the exact command.

Then GPT should receive:

* exit code,
* stdout,
* stderr,
* pre/post git status,
* evidence path.

This removes the manual packet creation bottleneck.

## Acceptance Criteria

The implementation is acceptable only if all of the following hold:

1. MCP exposes `forgepilot_prepare_terminal_command`.
2. MCP exposes `forgepilot_execute_approved_terminal_command`.
3. Prepare command does not execute anything.
4. Prepare command records a request artifact.
5. Prepare command returns exact command and SHA-256 hash.
6. Execute command refuses unknown request IDs.
7. Execute command refuses mismatched command hashes.
8. Execute command runs only inside allowlisted workspaces.
9. Execute command rejects unknown `targetWorkspaceId`.
10. Execute command captures stdout, stderr, exit code, signal, timeout state, and duration.
11. Execute command records a result artifact.
12. Execute command captures pre/post git status when possible.
13. Hard-blocked commands are refused even if approval string is present.
14. Secret paths are blocked.
15. `.env` reads are blocked.
16. `sudo` is blocked.
17. `rm -rf /` and equivalent destructive commands are blocked.
18. Network-to-shell patterns such as `curl ... | sh` are blocked.
19. Timeout is enforced.
20. Existing ForgePilot request artifacts are not mutated.
21. Existing guarded OpenCode runner start behavior is not weakened.
22. `pnpm build` passes in the MCP bridge repo.
23. Existing tests pass.
24. New tests cover prepare, execute, hash mismatch, workspace rejection, hard blocks, timeout handling, stdout/stderr capture, and evidence artifacts.

## Verification Commands

Run in the MCP bridge repo:

```bash
cd /home/ridasaidd/forgepilot-chatgpt-mcp
pnpm build
pnpm test
```

If no test suite exists for the new terminal module yet, add focused tests and document any remaining test gaps in the executor result.

Also verify service restart:

```bash
systemctl --user restart forgepilot-chatgpt-mcp.service
systemctl --user --no-pager --full status forgepilot-chatgpt-mcp.service | sed -n '1,100p'
```

Rediscover MCP tools after restart and confirm both new tools are visible.

## Executor Instructions

Implement this in the ForgePilot MCP bridge repository:

```text
/home/ridasaidd/forgepilot-chatgpt-mcp
```

Do not implement it in the ForgePilot control repository unless a small shared policy artifact is explicitly required.

Preserve the existing MCP bridge behavior.

Do not refactor unrelated server code unless necessary.

If `src/server.ts` is too large to safely modify directly, introduce a small terminal-command module and wire it into the existing server with minimal changes.

## Success Result

A successful result means ChatGPT can request a human-approved terminal command through MCP, receive command output directly, and rely on durable evidence artifacts for what was requested and what executed.

The human operator remains the approval authority.

GPT gains controlled hands.

ForgePilot keeps evidence discipline.


---

# FP-MCP-147 Amendment — MCP Tool Approval Is Human Approval

Amendment Status

This amendment supersedes the earlier typed-canonical-approval flow in this packet.

The human must not be required to type a long canonical approval sentence.

For terminal command execution, the ChatGPT/MCP tool approval popup itself is the approval surface.

Revised Approval Model

The terminal execution flow must be:

GPT requests a terminal command tool call.
The ChatGPT/MCP UI displays the exact tool call to the human.
The human clicks Approve or Deny.
If approved, the MCP bridge executes the exact approved command.
The MCP bridge records the approved tool call as human approval evidence.

Human approval is represented by the explicit approval of the MCP tool invocation, not by a typed phrase.

Revised Required MCP Tool

Tool name:

forgepilot_execute_terminal_command

Purpose:

Execute one human-approved terminal command.

The MCP tool invocation itself is the approval request.

Input shape:

{
  "packetId": "optional string",
  "targetWorkspaceId": "string",
  "workingDirectory": "optional string",
  "command": "string",
  "rationale": "string",
  "timeoutSeconds": "optional number",
  "approval": "EXECUTE_TERMINAL_COMMAND"
}

Required UI / Tool Call Visibility

The tool call must expose enough information for the human to approve or deny safely:

- target workspace id
- resolved working directory
- exact command
- rationale
- timeout
- risk classification, if available before execution

Execution Rules

- The command must execute only after the MCP tool call is explicitly approved by the human.
- The exact command visible in the tool call is the command that must execute.
- The command must not be rewritten after approval.
- The command must execute only inside allowlisted workspaces.
- Unknown workspaces must fail closed.
- The command must have a timeout.
- The command must capture stdout, stderr, exit code, signal, timeout state, and duration.
- The command must record pre/post git status when possible.
- The command must record durable evidence artifacts.
- Hard-blocked commands must be refused even if the tool call was approved.
- Secret paths must remain blocked.

Evidence Requirements

The result artifact must record:

{
  "approvalSource": "CHATGPT_MCP_TOOL_APPROVAL",
  "approvedToolName": "forgepilot_execute_terminal_command",
  "packetId": "string or null",
  "targetWorkspaceId": "string",
  "workspacePath": "string",
  "workingDirectory": "string",
  "command": "string",
  "commandSha256": "string",
  "rationale": "string",
  "riskLevel": "string",
  "timeoutSeconds": "number",
  "startedAt": "string",
  "completedAt": "string",
  "exitCode": "number or null",
  "signal": "string or null",
  "timedOut": "boolean",
  "durationMs": "number",
  "stdoutPath": "optional string",
  "stderrPath": "optional string",
  "stdoutSha256": "optional string",
  "stderrSha256": "optional string",
  "preGitStatusShort": "string or null",
  "postGitStatusShort": "string or null",
  "reasons": ["string"]
}

Evidence Path

The evidence must be written under:

runs/<packetId-or-OPERATOR>/terminal-commands/

Revised Non-Goal

Do not require the human to type exact canonical approval text for terminal command execution.

The canonical evidence should be generated by the MCP bridge from the approved tool call.

Revised Acceptance Criteria

In addition to the original safety requirements, the implementation is acceptable only if:

1. MCP exposes forgepilot_execute_terminal_command.
2. The user is not required to type a canonical approval sentence.
3. Approval source is recorded as CHATGPT_MCP_TOOL_APPROVAL.
4. The exact approved tool call fields are recorded.
5. The executed command matches the approved command exactly.
6. The tool blocks hard-blocked commands even after UI approval.
7. The tool captures stdout, stderr, exit code, timeout state, duration, and evidence paths.
8. The tool works for simple read-only commands such as git status --short.
9. The tool works for bounded verification commands such as pnpm build.
10. The tool fails closed for unknown workspaces and blocked paths.

