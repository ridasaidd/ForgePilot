# FP-005 Audit Prompt

## Packet
FP-005 — OpenCode Telemetry Ingestion

## Audit Questions

### 1. Telemetry Authority Compliance
- Does the implementation prevent executors from self-reporting authoritative token or cost telemetry?
- Are token and cost values extracted only from OpenCode session artifacts?
- Does the implementation avoid estimating or guessing any missing values?

### 2. Persistence Integrity
- Is `packet_execution_telemetry` a separate table from `packet_executions`?
- Are `trust_tier`, `validation_state`, and `admission_state` independent columns?
- Does `admission_state` remain `PENDING` by default (no automatic admission)?

### 3. Mapping Requirements
- Are `packet_id` and `execution_id` always required for ingestion?
- Is `mapping_confidence` always `EXPLICIT`?
- Does the CLI reject ingestion when `execution_id` does not exist in the database?

### 4. Retroactive Ingestion
- Is retroactive ingestion labeled as `RETROACTIVE_ARTIFACT`?
- Does retroactive ingestion not rewrite historical executor artifacts?

### 5. Scope Boundaries
- No model routing, broker behavior, autonomous execution added?
- No provider API calls or live OpenCode API calls?
- No aggregation, reporting, dashboards, or scoring?

### 6. FP-004 Compatibility
- Do all existing FP-004 tests still pass?
- Do packet intent, lifecycle events, and execution attempts still work?

### 7. Migration Idempotence
- Does `init-db` succeed when run twice?
- Does migration 003 only execute once?

### 8. Test Coverage
- Does the test suite cover successful parsing, missing fields, invalid JSON?
- Does it cover explicit mapping requirement, retroactive labeling, and idempotent migration?
- Does it verify FP-004 behavior preservation?

## Verification Artifacts
- `runs/FP-005/executor-result.md`
- `runs/FP-005/verification.txt`
- `runs/FP-005/metrics.json`
- `migrations/003_fp005_telemetry.sql`
- `src/telemetry/opencode.ts`
- `src/db/telemetry.ts`
- `tests/fixtures/opencode-telemetry-complete.json`
- `tests/fixtures/opencode-telemetry-missing-fields.json`
