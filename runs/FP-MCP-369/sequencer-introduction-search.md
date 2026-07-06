# Sequencer Introduction Search

## packets/FP-MCP-308.md
- L1: # FP-MCP-308 — Gate Sequencer Implementation
- L11: Implemented src/guarded-canary-gate-sequencer.ts and registered forgepilot_get_guarded_canary_next_gate in src/server.ts. The tool inspects current state and returns nextRequiredGate, nextToolName, nextToolArguments, fol

## packets/FP-MCP-310.md
- L11: FP-MCP-310 approval APPROVAL-20260704T160142146Z-6a78dc28 was recorded for FP-MCP-295 request REQ-20260704T142232816Z-a82a42b6, committed at 46b1e59, and validated usable. After validation, the intended next action was t

## packets/FP-MCP-345.md
- L19: - forgepilot_observe_next_gate

## packets/FP-MCP-347.md
- L11: Record the host-platform block encountered when retrying forgepilot_record_structured_human_approval for FP-MCP-346 scoped to FP-MCP-295, after a successful forgepilot_observe_next_gate live probe and successful FP-MCP-3

## packets/FP-MCP-348.md
- L11: After core and bridge clean-state verification, ChatGPT called forgepilot_observe_next_gate for FP-MCP-295 with approval APPROVAL-20260705T090508444Z-662c8664. The approval artifact was tracked and committed, but the obs

## packets/FP-MCP-349.md
- L11: A fresh structured approval was recorded under FP-MCP-346, committed at 46642ae, and then supplied to forgepilot_observe_next_gate. The observer reported approval valid and advanced nextRequiredGate to PREVIEW_CLEARANCE.

## packets/FP-MCP-361.md
- L68: - forgepilot_get_guarded_canary_next_gate
- L69: - forgepilot_observe_next_gate

## packets/FP-MCP-362.md
- L56: - forgepilot_get_guarded_canary_next_gate
- L57: - forgepilot_observe_next_gate

## packets/FP-MCP-363.md
- L33: - src/guarded-canary-gate-sequencer.ts
- L42: - forgepilot_get_guarded_canary_next_gate
- L43: - forgepilot_observe_next_gate

## packets/FP-MCP-364.md
- L33: - src/guarded-canary-gate-sequencer.ts
- L42: file: src/guarded-canary-gate-sequencer.ts
- L43: function: getGuardedCanaryNextGate

## packets/FP-MCP-364A.md
- L30: correctedPath: getGuardedCanaryNextGate -> clearanceStatus -> observedClearanceId -> enablementStatus

## packets/FP-MCP-365.md
- L9: This packet records the audit result for whether forgepilot_observe_next_gate should be exposed to the ChatGPT-safe MCP surface after the FP-MCP-364 guarded sequencer correction.
- L11: The audit inspected bridge commit 1688722 and found that forgepilot_observe_next_gate is registered and genuinely read-only, but is currently excluded from ChatGPT-safe because its tool contract surface is gated.
- L17: FP-MCP-365 concludes that forgepilot_observe_next_gate is read-only but should not be exposed to ChatGPT-safe as-is because its current output includes follow-on action payloads that can nudge the model toward gated, mut

## packets/FP-MCP-366.md
- L9: Bridge commit 32f49e6 intentionally exposed forgepilot_observe_next_gate to the ChatGPT-safe MCP surface after sanitizing its output.
- L46: name: forgepilot_observe_next_gate
- L79: forgepilot_get_guarded_canary_next_gate: gated

## packets/FP-MCP-366A.md
- L11: Bridge commit 32f49e6 was built and the forgepilot-chatgpt-mcp user service was restarted. The live Actions manifest exposed forgepilot_observe_next_gate as a public ChatGPT-safe tool with the sanitized observer descript
- L40: observerToolName: forgepilot_observe_next_gate

## runs/FP-MCP-308/result-summary.md
- L11: Implemented src/guarded-canary-gate-sequencer.ts and registered forgepilot_get_guarded_canary_next_gate in src/server.ts. The tool inspects current state and returns nextRequiredGate, nextToolName, nextToolArguments, fol

## runs/FP-MCP-308/tool-implementation-result-record.json
- L3: "title": "Gate Sequencer Implementation",
- L6: "summary": "Implemented src/guarded-canary-gate-sequencer.ts and registered forgepilot_get_guarded_canary_next_gate in src/server.ts. The tool inspects current state and returns nextRequiredGate, nextToolName, nextToolAr
- L25: "src/guarded-canary-gate-sequencer.ts",

## runs/FP-MCP-309/sequencer-test-result-record.json
- L29: "nextRecommendedAction": "Refresh actions until forgepilot_get_guarded_canary_next_gate is visible."

## runs/FP-MCP-310/fail-closed-hold-record.json
- L6: "summary": "FP-MCP-310 approval APPROVAL-20260704T160142146Z-6a78dc28 was recorded for FP-MCP-295 request REQ-20260704T142232816Z-a82a42b6, committed at 46b1e59, and validated usable. After validation, the intended next 
- L37: "intendedTool": "forgepilot_get_guarded_canary_next_gate",

## runs/FP-MCP-310/operator-workflow-traces/TRACE-20260704T160244953Z-842f0b92.json
- L10: "intendedToolName": "forgepilot_get_guarded_canary_next_gate",

## runs/FP-MCP-310/result-summary.md
- L11: FP-MCP-310 approval APPROVAL-20260704T160142146Z-6a78dc28 was recorded for FP-MCP-295 request REQ-20260704T142232816Z-a82a42b6, committed at 46b1e59, and validated usable. After validation, the intended next action was t

## runs/FP-MCP-314/handoffs/20260704-new-session-continuation.md
- L21: - FP-MCP-308 added `forgepilot_get_guarded_canary_next_gate` as an advisory sequencer.
- L29: - `forgepilot_get_guarded_canary_next_gate` read-only sequencer

## runs/FP-MCP-316/terminal-commands/TERM-20260704T180357326Z-74ee2b66-request.json
- L7: "command": "sed -n '1,430p' src/guarded-canary-gate-sequencer.ts",

## runs/FP-MCP-316/terminal-commands/TERM-20260704T180357326Z-74ee2b66-result.json
- L8: "command": "sed -n '1,430p' src/guarded-canary-gate-sequencer.ts",

## runs/FP-MCP-316/terminal-commands/TERM-20260704T180406230Z-9725d9fe-request.json
- L7: "command": "grep -n \"function applyGuardedCanaryNextGate\\|export async function applyGuardedCanaryNextGate\\|PREVIEW_CLEARANCE\\|CREATE_ENABLEMENT\\|PREVIEW_ENABLEMENT\" src/guarded-canary-gate-sequencer.ts",

## runs/FP-MCP-316/terminal-commands/TERM-20260704T180406230Z-9725d9fe-result.json
- L8: "command": "grep -n \"function applyGuardedCanaryNextGate\\|export async function applyGuardedCanaryNextGate\\|PREVIEW_CLEARANCE\\|CREATE_ENABLEMENT\\|PREVIEW_ENABLEMENT\" src/guarded-canary-gate-sequencer.ts",

## runs/FP-MCP-316/terminal-commands/TERM-20260704T180410855Z-1c734df2-request.json
- L7: "command": "sed -n '220,380p' src/guarded-canary-gate-sequencer.ts",

## runs/FP-MCP-316/terminal-commands/TERM-20260704T180410855Z-1c734df2-result.json
- L8: "command": "sed -n '220,380p' src/guarded-canary-gate-sequencer.ts",

## runs/FP-MCP-345/implementation-audit.md
- L19: - forgepilot_observe_next_gate

## runs/FP-MCP-346/live-probe-packet-record.json
- L30: "forgepilot_observe_next_gate",

## runs/FP-MCP-347/host-block-observation-record.json
- L6: "summary": "Record the host-platform block encountered when retrying forgepilot_record_structured_human_approval for FP-MCP-346 scoped to FP-MCP-295, after a successful forgepilot_observe_next_gate live probe and success
- L25: "forgepilot_observe_next_gate",

## runs/FP-MCP-347/result-summary.md
- L11: Record the host-platform block encountered when retrying forgepilot_record_structured_human_approval for FP-MCP-346 scoped to FP-MCP-295, after a successful forgepilot_observe_next_gate live probe and successful FP-MCP-3

## runs/FP-MCP-348/capability-split-live-probe-result-record.json
- L6: "summary": "After core and bridge clean-state verification, ChatGPT called forgepilot_observe_next_gate for FP-MCP-295 with approval APPROVAL-20260705T090508444Z-662c8664. The approval artifact was tracked and committed,

## runs/FP-MCP-348/result-summary.md
- L11: After core and bridge clean-state verification, ChatGPT called forgepilot_observe_next_gate for FP-MCP-295 with approval APPROVAL-20260705T090508444Z-662c8664. The approval artifact was tracked and committed, but the obs

## runs/FP-MCP-349/capability-split-live-probe-result-record.json
- L6: "summary": "A fresh structured approval was recorded under FP-MCP-346, committed at 46642ae, and then supplied to forgepilot_observe_next_gate. The observer reported approval valid and advanced nextRequiredGate to PREVIE

## runs/FP-MCP-349/result-summary.md
- L11: A fresh structured approval was recorded under FP-MCP-346, committed at 46642ae, and then supplied to forgepilot_observe_next_gate. The observer reported approval valid and advanced nextRequiredGate to PREVIEW_CLEARANCE.

## runs/FP-MCP-361/inline-registration-extraction.md
- L37: - forgepilot_get_guarded_canary_next_gate
- L38: - forgepilot_observe_next_gate

## runs/FP-MCP-363/diagnostic-report.md
- L19: - src/guarded-canary-gate-sequencer.ts
- L26: 1. Caller invokes forgepilot_observe_next_gate or forgepilot_get_guarded_canary_next_gate without clearanceId.
- L32: 7. getGuardedCanaryNextGate falls through to FRESH_ORIENTATION_BEFORE_START.

## runs/FP-MCP-364/correction-result.md
- L16: - src/guarded-canary-gate-sequencer.ts
- L27: In getGuardedCanaryNextGate, the sequencer now derives observedClearanceId from the validated clearance artifact's id and passes it to enablementStatus through a copied input object.

## runs/FP-MCP-365/safe-surface-eligibility-audit.md
- L5: Audited forgepilot_observe_next_gate for ChatGPT-safe eligibility.
- L16: forgepilot_observe_next_gate is registered and read-only, but not visible in the ChatGPT-safe profile because its contract surface is gated.
- L22: forgepilot_observe_next_gate:

## runs/FP-MCP-366/safe-surface-exposure.md
- L29: - forgepilot_observe_next_gate
- L82: - actual TOOL_CONTRACTS surface for forgepilot_observe_next_gate is chatgpt-safe

## runs/FP-MCP-366A/runtime-validation.md
- L26: The ChatGPT Actions UI listed forgepilot_observe_next_gate with public visibility.
- L56: - forgepilot_observe_next_gate

## runs/FP-MCP-369/ledger-gap-diagnostic.raw.md
- L30: FOUND	FP-MCP-308	# FP-MCP-308 — Gate Sequencer Implementation
- L501: 11:Implemented src/guarded-canary-gate-sequencer.ts and registered forgepilot_get_guarded_canary_next_gate in src/server.ts. The tool inspects current state and returns nextRequiredGate, nextToolName, nextToolArguments, 
- L514: 11:FP-MCP-310 approval APPROVAL-20260704T160142146Z-6a78dc28 was recorded for FP-MCP-295 request REQ-20260704T142232816Z-a82a42b6, committed at 46b1e59, and validated usable. After validation, the intended next action wa

## docs/mcp/guarded-sequencer-refactor-plan.md
- L118: - forgepilot_get_guarded_canary_next_gate
- L119: - forgepilot_observe_next_gate
- L126: - getGuardedCanaryNextGate

