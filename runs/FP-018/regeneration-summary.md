# FP-018 Regeneration Summary

Result: `V1_REPORT_MECHANICALLY_REGENERATED_CURRENT_STATE`

Static comparison: `STATIC_REPORT_NOT_REPRODUCED_CURRENT_SOURCE_STATE_DIFFERS`

The generator parsed `43` current checklist rows and produced counts `{'COMPLETE': 39, 'DEFERRED': 4}`. Capability counts are checklist-sourced (`CHECKLIST_SOURCED_TIER_1_INDEX`), while admission distribution is SQLite-sourced (`SQLITE_READONLY_QUERY_TIER_2_MECHANICAL_QUERY`).

The old FP-META-025 static report recorded counts `{'COMPLETE': 27, 'DEFERRED': 4}` across `31` capability rows.

Therefore FP-018 mechanically regenerates the current project report, but it does not reproduce the old static 27/4 report from the current mutated checklist source. The delta is recorded in `checklist_delta_from_static_report`.

SQLite evidence records are included in the generated report through readonly query data.
