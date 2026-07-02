# FP-019 verification summary

## Implementation
- `evidence_record` added as valid `evidence_admission_events.target_observation_type` API target.
- Target validation checks `evidence_records.evidence_id`.
- Forward migration `010_fp019_evidence_record_admission_target.sql` rebuilds `evidence_admission_events` CHECK constraint to include `evidence_record`.

## Focused test result
- `pnpm exec tsx --test tests/fp009.test.ts`: PASS, 57/57 tests.
- FP-019 evidence-record admission linkage tests: PASS, 5/5 tests.

## Full verification result
- `pnpm typecheck`: PASS.
- `pnpm test`: PASS.

## Result
```text
EVENT_LINKAGE_IMPLEMENTED_FOR_EVIDENCE_RECORDS
```

## Boundary
- No historical evidence backfill was performed.
- FP-017 records were not rewritten.
- Reports may now use event-sourced admission for evidence records when an event exists.
- `evidence_records.admission_state` remains distinguishable from event-sourced admission events.

## Current database migration check
- `pnpm fp -- init-db`: PASS.
- `runs/FP-019/current-db-migration-check.json` confirms current `data/forgepilot.db` now allows `evidence_record` in `evidence_admission_events`.
- Existing `evidence_records_total`: 2.
- Existing generic `evidence_admission_events_total`: 0.
- No historical backfill was performed.

## Legacy parallel surface
- `evidence_record_admission_events` still exists from earlier FP-011 validation/admission work.
- FP-019 does not delete or replace that table.
- FP-019 resolves the FP-017 structural fork by enabling the generic `evidence_admission_events` path to target `evidence_record`.
- A future cleanup packet may decide whether `evidence_record_admission_events` remains useful, becomes legacy, or should be bridged.
