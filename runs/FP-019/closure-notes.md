# FP-019 Closure Notes

## Linkage implemented, not populated

FP-019 implemented and tested event-sourced admission linkage for evidence records.

Result:

```text
EVENT_LINKAGE_IMPLEMENTED_FOR_EVIDENCE_RECORDS
```

However, the current real database check records:

```text
generic_admission_events_total: 0
```

Therefore the correct interpretation is:

```text
The linkage is implemented and tested.
The existing FP-017 records have not been backfilled into generic evidence_admission_events.
No real evidence_record admission event exists yet in the current store.
```

The FP-017 records remain real evidence_records with field-level admission states:

```text
ADMITTED: 1
REJECTED: 1
```

But they are not yet canonically event-sourced admission records.

## Two admission-event tables remain a live ambiguity

Two tables currently exist that can plausibly be interpreted as evidence-record admission event surfaces:

```text
evidence_admission_events
```

and:

```text
evidence_record_admission_events
```

FP-019 extended the generic table so it can target:

```text
target_observation_type = evidence_record
```

FP-019 did not remove, bridge, or deprecate the older dedicated table.

Current disposition:

```text
LIVE_CANONICALIZATION_AMBIGUITY_REQUIRES_FOLLOW_UP_PACKET
```

Named follow-up:

```text
FP-020 — Canonical Evidence Record Admission Event Surface
```

FP-020 must resolve which table is canonical for evidence-record admission events before FP-017 records or future evidence records are treated as canonically event-sourced.

## Required FP-020 scope

FP-020 should decide whether:

1. `evidence_admission_events` is canonical for all admission events, including evidence records;
2. `evidence_record_admission_events` remains canonical for evidence records;
3. both tables remain but one becomes an explicit derived/legacy/compatibility surface;
4. a bridging/query rule is required when both tables contain entries for the same evidence record.

FP-020 should include at least one conflict test:

```text
same evidence_record has entries in both admission-event tables with conflicting states
```

and must prove the query layer chooses, rejects, or marks ambiguity explicitly instead of silently selecting one table.

## V1-O state after FP-019

Current honest state:

```text
The plumbing works and is tested.
The data running through it is still nearly nonexistent.
```

Volume:

```text
evidence_records_total: 2
generic_admission_events_total: 0
```

Strength:

```text
V1-O foundation is load-bearing but sparse.
```
