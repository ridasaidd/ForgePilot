# FP-MCP-208 DeepSeek/OpenCode Change Inspection Tool Prompt

You are implementing FP-MCP-208 in the MCP bridge repository.

## Workspace

```text
/home/ridasaidd/forgepilot-chatgpt-mcp
```

## Starting point

Start from bridge branch:

```text
feature/oauth-auth0
```

Expected latest bridge commit:

```text
f45054e Add runtime diagnostics and gate orientation tools
```

Before editing, verify:

```sh
git status --short
git log --oneline -5
pnpm build
```

If the working tree is dirty before you start, stop and report it.

## Context

ForgePilot is currently using DeepSeek/OpenCode manually for MCP bridge edits. Each implementation produces workspace changes that GPT/operator must inspect before accepting and committing.

Today that inspection is done with terminal scaffolding:

```text
git status --short
git diff --stat
git diff -- <file>
grep/sed/wc for targeted checks
```

Terminal remains valid for debugging and recovery, but repeated model-output inspection is a stable operational pattern. It should become a typed read-only MCP tool.

## Task

Implement one new read-only MCP tool:

```text
forgepilot_get_workspace_change_inspection
```

Classification:

```text
READ_ONLY_MODEL_CHANGE_INSPECTION
```

Purpose:

Inspect model-made workspace changes before GPT/operator acceptance and commit. This is more than raw `git diff`; it should return structured ForgePilot observations about what changed, where risk might be, and what should be reviewed.

## Inputs

Suggested input schema:

```ts
{
  targetWorkspaceId: "forgepilot" | "forgepilot-chatgpt-mcp",
  includePatchExcerpts?: boolean,
  maxPatchCharsPerFile?: number,
  maxFiles?: number,
  includeUntrackedExcerpts?: boolean
}
```

Defaults:

```text
includePatchExcerpts: true
maxPatchCharsPerFile: 4000
maxFiles: 50
includeUntrackedExcerpts: false
```

Hard caps:

```text
maxPatchCharsPerFile <= 12000
maxFiles <= 100
```

## Output

Return structured fields like:

```ts
{
  checkedAt: string,
  targetWorkspaceId: string,
  workspacePath: string,
  git: {
    isRepo: boolean,
    branch: string | null,
    headCommit: string | null,
    statusShort: string,
    clean: boolean
  },
  summary: {
    changedFileCount: number,
    stagedFileCount: number,
    unstagedFileCount: number,
    untrackedFileCount: number,
    totalAdditions: number | null,
    totalDeletions: number | null,
    hasStagedChanges: boolean,
    hasUnstagedChanges: boolean,
    hasUntrackedFiles: boolean
  },
  files: ChangeInspectionFile[],
  riskHints: string[],
  recommendedReviewFocus: string[],
  truncated: boolean,
  boundary: {
    readOnly: true,
    filesWritten: false,
    filesStaged: false,
    filesCommitted: false,
    executionAuthorized: false,
    approvalConsumed: false,
    disableSwitchCleared: false,
    runnerStartEndpointContacted: false,
    opencodeStarted: false,
    fp027CanaryRun: false
  },
  reasons: string[]
}
```

File entry shape:

```ts
{
  path: string,
  status: string,
  staged: boolean,
  unstaged: boolean,
  untracked: boolean,
  additions: number | null,
  deletions: number | null,
  fileClassifications: string[],
  riskHints: string[],
  patchExcerpt?: string,
  patchExcerptTruncated?: boolean
}
```

## File classifications

Classify files using path/name heuristics:

```text
SOURCE_CODE
TEST
DOCS
PACKET
EVIDENCE_ARTIFACT
CONFIG
SERVICE_DEFINITION
LOCKFILE
PACKAGE_MANIFEST
GENERATED_ARTIFACT
SECRET_LIKE_OR_ENV
SCRIPT_OR_EXECUTABLE
MIGRATION
DATABASE_ARTIFACT
UNKNOWN
```

## Risk hints

Add risk hints based on paths and patch text, for example:

```text
TOUCHES_EXECUTION_PATH
TOUCHES_APPROVAL_PATH
TOUCHES_DISABLE_SWITCH_PATH
TOUCHES_RUNNER_START_PATH
TOUCHES_TERMINAL_AUTHORITY
TOUCHES_SERVICE_ENVIRONMENT
TOUCHES_PACKAGE_OR_DEPENDENCY
TOUCHES_LOCKFILE
TOUCHES_DATABASE_OR_MIGRATION
ADDS_UNTRACKED_FILE
ADDS_SCRIPT_OR_EXECUTABLE
SECRET_LIKE_PATTERN_DETECTED
LARGE_DIFF
GENERATED_FILE_LIKE_CHANGE
BINARY_OR_UNREADABLE_FILE
PATCH_EXCERPT_TRUNCATED
```

Important: risk hints are inspection signals, not judgments. Do not say accepted/rejected.

## Patch excerpts

When `includePatchExcerpts` is true:

- Include bounded per-file patch excerpts for tracked changes.
- For untracked files, do not include full content by default.
- If `includeUntrackedExcerpts` is true, include only bounded text excerpts for files that look like text and are not secret-like/env-like/binary-like.
- Never include full large files.
- Never include `.env` contents or secret-like files.
- Redact obvious secret-looking values in excerpts if encountered.

## Secret-safety requirements

Do not read or dump known secret files, including:

```text
.env
.env.*
*.pem
*.key
id_rsa
id_ed25519
```

If such files are changed, report path/classification/risk only, no content excerpt.

Detect secret-like strings in patch excerpts and redact values conservatively. Examples:

```text
API_KEY=...
TOKEN=...
SECRET=...
Authorization: Bearer ...
sk-...
```

Return `SECRET_LIKE_PATTERN_DETECTED` when appropriate.

## Implementation guidance

Use safe git commands through bounded child processes, for example:

```text
git rev-parse --is-inside-work-tree
git branch --show-current
git rev-parse --short HEAD
git status --short
git diff --numstat
git diff --stat
git diff -- <file>
git diff --cached --numstat
git diff --cached -- <file>
```

Keep timeouts. Treat failures as structured observations when possible.

Do not run build/tests from this tool.
Do not stage or commit.
Do not write files.
Do not modify git state.
Do not contact remote network.

## Boundary

This tool must never:

```text
write files
stage files
commit files
create request artifacts
create approval artifacts
authorize execution
consume approval
clear disable switch
contact runner start endpoint
start OpenCode
run FP-027 or any canary
broaden terminal-command authority
```

## Registration

Register the tool in `src/server.ts` with a concise description emphasizing read-only inspection.

Prefer implementation in a dedicated module:

```text
src/workspace-change-inspection.ts
```

## Validation requirements

Run:

```sh
pnpm build
```

If easy, perform local read-only validation against the current clean bridge workspace and report the output summary. Do not create artificial changes unless you can do so without leaving the tree dirty and without broad scope.

## Expected changed files

Likely:

```text
src/workspace-change-inspection.ts
src/server.ts
```

## Expected output report

When complete, report:

```text
changed files
bridge commit
build command and result
new tool added
main output fields implemented
file classifications implemented
risk hints implemented
secret-safety behavior implemented
explicit read-only/non-execution boundary confirmation
caveats
```

## Success result string

```text
FP_MCP_208_WORKSPACE_CHANGE_INSPECTION_TOOL_IMPLEMENTED
```

## Stop conditions

Stop and report without further modification if:

```text
working tree is dirty before start
implementation requires write-path behavior
implementation requires changing execution/approval/disable/start semantics
implementation requires broad unrelated refactor
build fails and fix is not clearly within scope
```
