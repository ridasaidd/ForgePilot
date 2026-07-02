# FP-018 Generated V1 Project Report

## Result

```text
V1_REPORT_MECHANICALLY_REGENERATED_CURRENT_STATE
```

## Evidence tier legend

```json
{
  "capability_counts": "CHECKLIST_SOURCED_TIER_1_INDEX",
  "sqlite_admission_distribution": "SQLITE_READONLY_QUERY_TIER_2_MECHANICAL_QUERY",
  "static_report_comparison": "DERIVED_COMPARISON_TIER_1_OVER_COMMITTED_ARTIFACTS"
}
```

## Checklist counts from current source

```json
{
  "COMPLETE": 39,
  "DEFERRED": 4
}
```

Capability rows parsed: `43`

## SQLite admission distribution

```json
{
  "database_path": "data/forgepilot.db",
  "database_exists": true,
  "query_status": "OK",
  "tables": {
    "evidence_records": "PRESENT",
    "evidence_admission_events": "PRESENT",
    "admission_invalidation_events": "PRESENT"
  },
  "evidence_records_total": 2,
  "evidence_records_by_admission_state": [
    {
      "state": "ADMITTED",
      "count": 1
    },
    {
      "state": "REJECTED",
      "count": 1
    }
  ]
}
```

## Checklist delta from static FP-META-025 report

```json
{
  "old_capability_count": 31,
  "current_capability_count": 43,
  "new_capability_rows": [
    {
      "capability": "V1 release and observation plan",
      "status": "COMPLETE",
      "evidence_packets": "`FP-OPS-005`",
      "evidence_notes": "V1 release record and observation protocol are documented in `docs/releases/forgepilot-v1.md` and `docs/v1-observation-plan.md`.",
      "boundary": "V2 must be evidence-triggered, not ambition-triggered."
    },
    {
      "capability": "Core/instrument/observed project boundary",
      "status": "COMPLETE",
      "evidence_packets": "`FP-META-026`",
      "evidence_notes": "Boundaries and workspace layout are defined in `docs/core-instrument-observed-project-boundaries.md`; MCP bridge classified as an instrument project.",
      "boundary": "Historical `FP-MCP-*` packets remain bootstrap evidence and are not moved."
    },
    {
      "capability": "Shadow refactor rules",
      "status": "COMPLETE",
      "evidence_packets": "`FP-META-027`",
      "evidence_notes": "General shadow-refactor safety rules are documented in `docs/shadow-refactor-rules.md`.",
      "boundary": "Concrete MCP bridge refactor work belongs in the instrument-project workspace."
    },
    {
      "capability": "Shadow refactor rules",
      "status": "COMPLETE",
      "evidence_packets": "`FP-META-027`",
      "evidence_notes": "Project-agnostic shadow refactor rules are documented in `docs/shadow-refactor-rules.md`.",
      "boundary": "Rules do not start the MCP bridge refactor or authorize model execution."
    },
    {
      "capability": "Project checklist rules",
      "status": "COMPLETE",
      "evidence_packets": "`FP-META-028`",
      "evidence_notes": "Project checklist semantics are documented in `docs/project-checklist-rules.md`; MCP bridge shadow-refactor checklist initialized.",
      "boundary": "Checklist is an evidence index, not evidence by itself."
    },
    {
      "capability": "Model roster and profiling rules",
      "status": "COMPLETE",
      "evidence_packets": "`FP-META-029`",
      "evidence_notes": "Model roles, task classes, trust states, promotion/demotion criteria, and initial OpenCode Go roster are documented in `docs/model-roster-and-profiling-rules.md`.",
      "boundary": "Availability is not trust; no model execution authorized."
    },
    {
      "capability": "Evidence root and workspace boundary",
      "status": "COMPLETE",
      "evidence_packets": "`FP-META-030`",
      "evidence_notes": "Boundary rules are documented in `docs/evidence-root-and-workspace-boundary.md`; grep/source-excerpt path check recorded in `runs/FP-META-030/`.",
      "boundary": "Current code appears conformant, but runtime path tracing is not yet implemented."
    },
    {
      "capability": "Invalidation propagation rules",
      "status": "COMPLETE",
      "evidence_packets": "`FP-META-031`",
      "evidence_notes": "Downstream invalidation semantics are documented in `docs/invalidation-propagation-rules.md`; current implementation status is `PROPAGATION_RULE_DEFINED_IMPLEMENTATION_NOT_PRESENT`.",
      "boundary": "Governance only; no propagation implementation yet."
    },
    {
      "capability": "Task-class-scoped model trust",
      "status": "COMPLETE",
      "evidence_packets": "`FP-META-032`",
      "evidence_notes": "Model trust scoping, provenance, provider-version/date-range caveats, and append-only promotion/demotion rules are documented in `docs/task-class-scoped-model-trust.md`.",
      "boundary": "Governance only; no model execution or trust database implementation."
    },
    {
      "capability": "V1 admission distribution report",
      "status": "COMPLETE",
      "evidence_packets": "`FP-META-034`",
      "evidence_notes": "Current SQLite admission distribution is recorded in `runs/FP-META-034/admission-distribution-report.md`; queried admission/evidence tables are present but contain zero rows.",
      "boundary": "V1 completion is not the same as admitted evidence; no model-trust labels counted."
    },
    {
      "capability": "First admitted evidence record end-to-end",
      "status": "COMPLETE",
      "evidence_packets": "`FP-017`",
      "evidence_notes": "One boring admitted evidence record and one rejected control record were created in SQLite and mechanically reported in `runs/FP-017/admission-distribution-report.md`.",
      "boundary": "Proves `evidence_records` admission-state plumbing; event linkage remains separate."
    },
    {
      "capability": "V1 report mechanical regeneration",
      "status": "COMPLETE",
      "evidence_packets": "`FP-018`",
      "evidence_notes": "Current project report is mechanically regenerated by `runs/FP-018/generate-v1-report.py`; generated counts are COMPLETE 39, DEFERRED 4 across 43 rows.",
      "boundary": "Does not reproduce old static FP-META-025 27/4 report because current checklist source changed."
    }
  ],
  "removed_capability_rows": [],
  "duplicate_current_capabilities": [
    "Shadow refactor rules"
  ]
}
```

## Static FP-META-025 comparison

```text
STATIC_REPORT_NOT_REPRODUCED_CURRENT_SOURCE_STATE_DIFFERS
```

Old static counts: `{'COMPLETE': 27, 'DEFERRED': 4}`

Current generated counts: `{'COMPLETE': 39, 'DEFERRED': 4}`

Old static capability count: `31`

Current generated capability count: `43`

## Boundary

Generated output is authoritative for FP-018 interpretation. The old static report is preserved as historical evidence and is not rewritten.
