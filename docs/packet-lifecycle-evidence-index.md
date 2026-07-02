# Packet Lifecycle Evidence Index

## Purpose

This index defines packet lifecycle states that ForgePilot may safely report from committed artifacts.

It prevents the main lifecycle error:

```text
Packet existence is not execution evidence.
```

A packet lifecycle claim must identify its supporting artifact, report, or committed evidence.

## Lifecycle State Vocabulary

| State | Meaning | Minimum evidence |
|---|---|---|
| `INTENT_RECORDED` | Packet intent exists. | `packets/<packet>.md` exists. |
| `IMPLEMENTED` | Scoped code/docs/artifacts were changed. | implementation commit or executor-result artifact. |
| `VERIFIED` | Defined verification checks passed or were recorded. | `runs/<packet>/verification*`, typecheck/test/smoke artifact, or report output. |
| `OPERATIONALLY_PROVEN` | A live operational path was directly exercised. | direct smoke/query artifact, for example direct MCP proof. |
| `RECONSTRUCTED` | Packet state can be reconstructed by a supported read-only report. | `packet-report`, `project-report`, or `reconstruction-report` output. |
| `REPORTED` | Packet appears in a supported report surface. | `runs/<packet>` report evidence or project report output. |
| `COMPLETE` | Scoped acceptance criteria are satisfied by committed evidence. | packet + implementation/docs + verification/evidence + clean state. |
| `PARTIAL` | Some evidence exists, but required lifecycle evidence is incomplete. | checklist/report entry explaining missing part. |
| `DEFERRED` | Work intentionally postponed. | checklist/report entry marking deferred. |
| `UNKNOWN` | State has not been reviewed or cannot be determined. | absence of sufficient evidence. |

## Lifecycle Boundary Rules

1. Packet existence supports only `INTENT_RECORDED`.
2. Code or doc changes support only `IMPLEMENTED` unless verification evidence exists.
3. Verification evidence supports `VERIFIED`, not `ADMITTED`.
4. Direct MCP/tool proof supports `OPERATIONALLY_PROVEN`, not admission or routing.
5. Report output supports `RECONSTRUCTED` / `REPORTED`, but is not evidence by itself.
6. `COMPLETE` requires the packet's own scoped acceptance criteria and evidence.
7. Historical packets retain their IDs and lifecycle history.
8. Missing evidence must be reported as `UNKNOWN`, `PARTIAL`, or `NO_*_RECORDED`, not failure by default.

## Current Lifecycle Surfaces

| Surface | Packet(s) | Lifecycle state supported | Notes |
|---|---|---|---|
| Packet files | all `packets/*.md` | `INTENT_RECORDED` | Packet existence alone does not prove execution. |
| Run artifacts | `runs/<packet>/` | varies | Verification/audit/comparison/executor artifacts support specific states only. |
| Packet report | `FP-013` | `RECONSTRUCTED`, `REPORTED` | Single-packet report indexes packet/run artifacts. |
| Project report | `FP-014`, `FP-016` | `RECONSTRUCTED`, `REPORTED` | Project report summarizes checklist state and incomplete capabilities. |
| Reconstruction report | `FP-015` | `RECONSTRUCTED` | Reconstructs verification/audit/comparison/admission artifact presence. |
| Packet status index | `FP-OPS-004` | operator navigation | Does not replace packet evidence. |
| Safety boundary index | `FP-META-023` | boundary mapping | Confirms packet lifecycle boundaries. |

## Current V1 Lifecycle Mapping

| Lifecycle concern | Current support | Status |
|---|---|---|
| Packet intent is recorded | packet files and namespace taxonomy | `SUPPORTED` |
| Implementation evidence can be recorded | implementation commits and executor-result artifacts | `SUPPORTED` |
| Verification evidence can be recorded | verification artifacts and test/typecheck outputs | `SUPPORTED` |
| Operational proof can be recorded | direct MCP proof artifacts, smoke outputs | `SUPPORTED` |
| Packet state can be reported | `packet-report` from `FP-013` | `SUPPORTED` |
| Project state can be reported | `project-report` from `FP-014` and `FP-016` | `SUPPORTED` |
| Admission/comparison state can be reconstructed | `reconstruction-report` from `FP-015` | `SUPPORTED` |
| Historical packet navigation exists | `docs/packet-status-index.md` | `SUPPORTED` |
| Lifecycle boundaries are indexed | this document and `docs/safety-boundary-evidence-index.md` | `SUPPORTED` |

## Completion Rule for V1 Packet Lifecycle

The V1 packet lifecycle capability is complete when ForgePilot has:

1. committed packets as intent records,
2. committed run artifacts as evidence records,
3. report surfaces that can inspect packet/project/reconstruction state,
4. lifecycle boundary rules preventing overclaims,
5. checklist/project report visibility for incomplete lifecycle states.

Those conditions are satisfied by:

- `FP-013` packet report,
- `FP-014` project report,
- `FP-015` reconstruction report,
- `FP-016` capability detail integration,
- `FP-OPS-004` packet status index,
- `FP-META-023` safety boundary evidence index,
- this `FP-META-024` lifecycle evidence index.

## Boundary

This index does not create execution evidence, admission, comparison authority, routing authority, or model-quality claims.

It only defines which lifecycle claims may be made from which committed artifacts.
