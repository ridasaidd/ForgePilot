FP-META-004 — Execution Prompt Generator

Task

Create a generator that produces a standardized execution prompt for a ForgePilot packet.

The purpose of this packet is to eliminate manual construction of executor prompts and ensure all executions begin from a consistent prompt structure.

Goal

Generate:

runs/<PACKET_ID>/execution-prompt.md

using:

prompts/executor-baseline-v1.md

and packet metadata.

This packet does not invoke models, perform execution, perform auditing, or automate workflow orchestration.

Requirements

Create a command:

pnpm fp -- build-execution-prompt <PACKET_ID>

The command must generate:

runs/<PACKET_ID>/execution-prompt.md

The generated prompt must contain:

1. Reference to the target packet.
2. Execution instructions.
3. Artifact requirements.
4. FP-003 handoff requirements.
5. Stop-after-completion instructions.

The generated prompt must be fully populated and contain no unresolved placeholders.

Generated Prompt Requirements

The generated prompt must instruct the executor to:

* Read the packet.
* Follow the packet exactly.
* Avoid scope expansion.
* Verify all acceptance criteria.
* Generate required run artifacts.
* Use the FP-003 handoff workflow.
* Stop after completion.

The generated prompt must instruct the executor not to:

* Perform audits.
* Create additional packets.
* Modify unrelated files.
* Expand scope.

Implementation Constraints

* Preserve existing behavior.
* Do not modify runtime workflow behavior.
* Do not add model provider logic.
* Do not add routing logic.
* Do not add broker integration.
* Do not add autonomous execution.
* Do not add workflow orchestration.

Verification Requirements

Run and record:

pnpm typecheck
pnpm test

Verify:

pnpm fp -- build-execution-prompt FP-META-004
test -f runs/FP-META-004/execution-prompt.md
grep -q "{{" runs/FP-META-004/execution-prompt.md && echo FAIL || echo PASS

Acceptance Criteria

* Command exists.
* execution-prompt.md is generated.
* Generated prompt contains packet reference.
* Generated prompt contains artifact requirements.
* Generated prompt contains stop instructions.
* Generated prompt contains no unresolved placeholders.
* Existing tests pass.
* No routing logic.
* No broker integration.
* No model integrations.

Executor Final Instructions

After implementation and verification, output only:

STATUS: SUCCESS | FAILED

FILES_CHANGED:

* file

VERIFICATION_COMMANDS_RUN:

* command => result

VERIFICATION_RESULTS:

* item => PASS | FAIL

RESULT:
Short summary.

NOTES:
Short notes only if needed.

Then generate:

runs/FP-META-004/executor-result.md
runs/FP-META-004/verification.txt
runs/FP-META-004/audit-prompt.md

using the existing FP-003 handoff workflow.
