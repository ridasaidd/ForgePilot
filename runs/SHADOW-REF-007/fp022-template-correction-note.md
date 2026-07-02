# SHADOW-REF-007 FP-022 Template Correction Note

SHADOW-REF-007 requires future extraction packets to preserve the tool contract against the SHADOW-REF-006 baseline.

FP-022 refines the tool-contract baseline requirement:

```text
Use expanded registered-tool parsing across src/server.ts and src/tool-registrations/recent-tools.ts.
```

Do not rely on the SHADOW-REF-006 29-tool server-only count for future acceptance.

Future extraction packets should compare against:

```text
expanded registered tool count: 38
expanded registered tool artifact: runs/FP-022/registered-tool-surface-expanded.json
```
