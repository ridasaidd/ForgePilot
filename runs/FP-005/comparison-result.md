# FP-005 Comparison Result

Packet: FP-005 — OpenCode Telemetry Ingestion

Benchmark base branch: fp-005-benchmark-base  
Benchmark base commit: 75f4b08

## Executor Results

### DeepSeek-V4-Pro-High

Branch: eval/fp-005/deepseek-v4-pro-high  
Execution commit: a375cd3  
Audit commit: 3c41c52  
Audit status: ACCEPTED

Summary:

DeepSeek implemented OpenCode telemetry ingestion using a separate telemetry parser module and a separate SQLite telemetry persistence layer.

Key properties:

- Added `packet_execution_telemetry` table.
- Ingests telemetry only from local JSON artifacts.
- Does not call live OpenCode APIs or provider APIs.
- Preserves missing values as `null`.
- Does not estimate token or cost values.
- Requires explicit packet/execution mapping.
- Verifies that `execution_id` belongs to the supplied `packet_id`.
- Supports direct and retroactive ingestion modes.
- Uses `source = OPENCODE_TELEMETRY`.
- Uses `mapping_confidence = EXPLICIT`.
- Uses `trust_tier = TIER_2_VERIFIED_ARTIFACT`.
- Keeps `admission_state = PENDING`.
- Preserves FP-004 persistence behavior.
- Passes typecheck, tests, and repeated init-db verification.

### Qwen-3.7-Max

Branch: eval/fp-005/qwen-3.7-max  
Execution commit: c05bf6e  
Audit commit: 6866b2a  
Audit status: ACCEPTED

Summary:

Qwen also implemented OpenCode telemetry ingestion successfully after follow-up fixes.

Key properties:

- Added `packet_execution_telemetry` table.
- Added dedicated telemetry tests.
- Supports packet-path based `--packet-id` resolution.
- Supports `--packet-db-id` fallback.
- Supports messages-based usage aggregation.
- Preserves explicit zero telemetry values.
- Rejects cross-packet execution mappings.
- Passes typecheck, tests, and repeated init-db verification.

## Decision

Winner: DeepSeek-V4-Pro-High

## Rationale

Both implementations were audited and accepted.

DeepSeek is selected because it has the cleaner persistence boundary and lower implementation risk:

1. Parsing is separated into `src/telemetry/opencode.ts`, while persistence remains in `src/db/telemetry.ts`.
2. The parser uses explicit safe conversion helpers for strings, integers, floats, and timestamps.
3. The schema is narrower and limited to required FP-005 telemetry fields.
4. The implementation extends the existing persistence test suite and directly preserves FP-004 behavior.
5. The overall blast radius is smaller.

Qwen’s implementation is valid, but it couples artifact parsing into the DB telemetry module and adds extra schema fields beyond the required telemetry record. Its final version is acceptable, but DeepSeek is more conservative and better aligned with ForgePilot’s evidence-first persistence style.

## Outcome

DeepSeek-V4-Pro-High is selected for merge into FP-005 benchmark base.
