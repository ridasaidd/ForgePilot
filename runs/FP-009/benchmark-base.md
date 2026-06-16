# FP-009 Benchmark Base

Packet: packets/FP-009.md
Base commit: 5d03816
Purpose: Establish benchmark base for FP-009 evidence admission persistence implementation.

Required verification before executor runs:
- pnpm typecheck
- pnpm test
- pnpm fp -- init-db
- pnpm fp -- init-db again to verify idempotence

Executor branches should start from this benchmark base.
