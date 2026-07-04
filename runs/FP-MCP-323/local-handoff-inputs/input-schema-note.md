# FP-MCP-323 Input Schema Note

This file is a non-runnable schema note.

The eventual local input file should contain two top-level fields:

- `tool`: the single allowed MCP tool name selected by the local client.
- `arguments`: the fresh operator-reviewed argument object for the current run.

The argument object must be filled only after fresh local preparation is complete.

Required freshness fields:

- fresh approval packet id
- fresh approval id
- fresh clearance id
- fresh scoped enablement id
- fresh capability observation timestamp
- fresh current repository commit

Do not copy expired values from previous packets.
Do not infer success from missing errors.
Record the returned result exactly.
