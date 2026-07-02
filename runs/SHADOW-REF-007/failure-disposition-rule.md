# SHADOW-REF-007 Failure Disposition Rule

## Rule

Future code-moving extraction packets must not improvise failure handling.

If executor implementation starts and verification fails, ForgePilot must preserve the attempt as evidence with one of these outcomes:

```text
REJECTED_EXTRACTION_ATTEMPT
QUARANTINED_EXTRACTION_ATTEMPT
DEFERRED_INFRASTRUCTURE_FAILURE
```

## Disposition mapping

```text
build/test failure -> REJECTED_EXTRACTION_ATTEMPT
undeclared tool-contract drift -> REJECTED_EXTRACTION_ATTEMPT
source diff outside declared scope -> REJECTED_EXTRACTION_ATTEMPT
ambiguous or conflicting verification evidence -> QUARANTINED_EXTRACTION_ATTEMPT
executor infrastructure failure before implementation starts -> DEFERRED_INFRASTRUCTURE_FAILURE
executor cannot be started due policy/gating -> DEFERRED_INFRASTRUCTURE_FAILURE
```

## Evidence rule

A failed extraction attempt may be admitted only as evidence of the failed or blocked attempt.

It must not be admitted as evidence of behavior-preserving extraction.

## Retry rule

Retries must either:

```text
occur inside the same packet before final admission, with all failed intermediate attempts preserved
```

or:

```text
be moved to a new packet with a new executor instruction artifact
```
