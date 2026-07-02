# FP-018 Regeneration Summary

Result: `V1_REPORT_MECHANICALLY_REGENERATED_CURRENT_STATE`

Static comparison: `STATIC_REPORT_NOT_REPRODUCED_CURRENT_SOURCE_STATE_DIFFERS`

The generator parsed `42` current checklist rows and produced counts `{'COMPLETE': 38, 'DEFERRED': 4}`.

The old FP-META-025 static report recorded counts `{'COMPLETE': 27, 'DEFERRED': 4}` across `31` capability rows.

Therefore FP-018 mechanically regenerates the current project report, but it does not reproduce the old static 27/4 report from the current mutated checklist source.

SQLite evidence records are included in the generated report through readonly query data.
