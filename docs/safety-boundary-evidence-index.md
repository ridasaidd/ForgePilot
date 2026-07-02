# Safety Boundary Evidence Index

## Purpose

This index consolidates ForgePilot V1 safety boundaries and maps each boundary to source documents, packets, or evidence artifacts.

It is an index over safety evidence.

It is not a policy engine, admission decision, routing rule, or proof by itself.

## Boundary Status Vocabulary

| Status | Meaning |
|---|---|
| `DOCUMENTED` | Boundary is documented in governing docs or packet evidence. |
| `ENFORCED_BY_GATE` | Boundary is enforced by a tool, schema, validation, test, or explicit gate. |
| `OBSERVED` | Boundary was observed in committed run evidence. |
| `DEFERRED` | Boundary protects a deliberately deferred capability. |
| `INDEXED` | Boundary is now included in this index. |

## Safety Boundaries

| Boundary | Prevents | Governing source | Evidence / gate | V1 status |
|---|---|---|---|---|
| Discussion is not evidence. | Treating chat/design intent as committed evidence. | `docs/evidence-boundary-doctrine.md` | `FP-META-018`, `runs/FP-META-018/verification.txt` | `DOCUMENTED`, `INDEXED` |
| Packet existence is not execution evidence. | Claiming work executed because a packet exists. | `docs/evidence-boundary-doctrine.md`, `docs/project-summary-reporting-rules.md` | `FP-014`, `FP-016` project report caveats and incomplete capability output | `DOCUMENTED`, `OBSERVED`, `INDEXED` |
| Implementation is not evidence by itself. | Claiming correctness from committed code alone. | `docs/evidence-boundary-doctrine.md`, `docs/packet-namespace-definition-of-done.md` | Verification artifacts required per namespace; `runs/FP-013` through `runs/FP-016` | `DOCUMENTED`, `OBSERVED`, `INDEXED` |
| Verification is not admission. | Treating passing tests as admitted evidence. | `docs/evidence-boundary-doctrine.md`, `docs/reporting-evidence-rules.md` | `runs/FP-013/verification.txt`, `runs/FP-014/verification.txt`, `runs/FP-015/verification.txt`, `runs/FP-016/verification.txt` | `DOCUMENTED`, `OBSERVED`, `INDEXED` |
| Observation is not admission. | Treating telemetry/metrics as admitted evidence. | `docs/evidence-boundary-doctrine.md`, `docs/reporting-evidence-rules.md` | `FP-MCP-157` direct query result; `FP-013` worker telemetry smoke preserves `NOT_EVALUATED` | `DOCUMENTED`, `OBSERVED`, `INDEXED` |
| Non-admitted observations are not routing input. | Using telemetry or query results for routing/model preference. | `docs/reporting-evidence-rules.md`, `docs/admission-comparison-reconstruction-rules.md` | Report boundary text: `Observation only. Not admitted evidence. Not routing input.` | `DOCUMENTED`, `OBSERVED`, `INDEXED` |
| Comparison is not global model ranking. | Treating bounded comparisons as universal model scores. | `docs/admission-comparison-reconstruction-rules.md` | `FP-015` reconstruction report caveat; comparison artifacts reported as bounded records | `DOCUMENTED`, `OBSERVED`, `INDEXED` |
| Reporting is an index, not evidence itself. | Treating report output as stronger than source artifacts. | `docs/reporting-evidence-rules.md`, `docs/project-summary-reporting-rules.md` | `FP-013`, `FP-014`, `FP-016` report boundaries | `DOCUMENTED`, `OBSERVED`, `INDEXED` |
| Reconstruction is read-only. | Creating admission/comparison/ranking authority from reconstruction. | `docs/admission-comparison-reconstruction-rules.md` | `FP-015` reconstruction report boundary and smoke evidence | `DOCUMENTED`, `OBSERVED`, `INDEXED` |
| MCP visibility is not admission. | Treating a visible or callable MCP tool as admitted evidence. | `docs/manual-action-ledger.md`, `docs/packet-namespace-definition-of-done.md` | `FP-MCP-157` required manual Actions refresh plus direct proof; admission remains separate | `DOCUMENTED`, `OBSERVED`, `INDEXED` |
| Manual action requires observable proof. | Treating operator action claims as sufficient without proof. | `docs/manual-action-ledger.md` | `FP-MCP-157` direct MCP query result after manual refresh | `DOCUMENTED`, `OBSERVED`, `INDEXED` |
| Historical packets must not be renamed or deleted. | Rewriting packet history after taxonomy changes. | `docs/packet-namespace-taxonomy.md`, `docs/packet-status-index.md` | `FP-OPS-004` packet status index; `FP-MCP-158` namespace drift example preserved | `DOCUMENTED`, `INDEXED` |
| Routing is deferred. | Premature model routing or optimization. | `docs/forgepilot-progress-checklist.md`, `docs/project-summary-reporting-rules.md` | Project report deferred capability output in `FP-016` | `DEFERRED`, `OBSERVED`, `INDEXED` |
| Model scoring/ranking is deferred. | Premature model-quality scoring from incomplete telemetry/comparison evidence. | `docs/forgepilot-progress-checklist.md`, `docs/project-summary-reporting-rules.md` | Project report deferred capability output in `FP-016` | `DEFERRED`, `OBSERVED`, `INDEXED` |

## Enforced / Observed Gates

| Gate / evidence type | Boundary supported | Source |
|---|---|---|
| Namespace definition-of-done standards | Defines minimum evidence burden by packet family. | `docs/packet-namespace-definition-of-done.md` |
| Terminal/MCP command evidence artifacts | Separates command invocation evidence from final admitted evidence. | `runs/*/terminal-commands/` excluded from committed user-facing evidence unless summarized |
| Verification artifacts | Records typecheck/test/smoke evidence without implying admission. | `runs/FP-013` through `runs/FP-016` |
| Direct MCP proof artifacts | Shows operational tool visibility without implying admission/routing. | `runs/FP-MCP-157/direct-mcp-query-result.md` |
| Project report incomplete capability list | Keeps V1 incomplete state visible. | `runs/FP-016/project-report-capability-summary.json` |
| Packet status index | Preserves historical packets without renaming/deleting. | `docs/packet-status-index.md` |

## V1 Safety Boundary Completion Rule

Safety boundary documentation may be considered V1-complete when:

1. recurring safety boundaries are consolidated in this index,
2. each boundary maps to a governing source,
3. available evidence or gates are identified,
4. deferred boundaries are explicitly labeled as deferred,
5. the progress checklist points to this index,
6. no boundary statement is used as evidence by itself.

## Boundary

This index maps safety boundaries to sources and evidence.

It does not create evidence, admission, comparison authority, routing authority, or model-quality claims.
