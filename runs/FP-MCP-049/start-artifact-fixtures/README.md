# FP-MCP-049 Start Request Invalid Artifact Fixtures

These fixtures record non-executing start-request probes for FP-MCP-049.

They prove:

- valid request artifacts remain valid input but are blocked by the disable switch
- missing request artifacts are rejected observably
- malformed request IDs are rejected observably
- runner start endpoint contact remains false in every case
- executionStarted remains false in every case

These are observation artifacts only. They are not runnable approvals and do not enable execution.
