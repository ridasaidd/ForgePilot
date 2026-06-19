# FP-MCP-028 — Request Artifact Commit Lifecycle Fix

## Task

Fix request artifact validation lifecycle semantics so committed request artifacts can pass validation without requiring the request creation commit to equal the current repository `HEAD`.

## Goal

Separate request artifact creation provenance from request artifact admission provenance.

FP-MCP-028 answers one question:

**Can ForgePilot validate a committed request artifact without collapsing creation commit and artifact admission commit into the same field?**

---

## Background

FP-MCP-027 exposed a lifecycle contradiction.

A request artifact can be created at a clean commit, but committing that artifact necessarily advances `HEAD`.

The current validator requires:

```text
workingTreeClean: true
baseCommitMatches: true
```

For a newly committed request artifact, these requirements cannot both be satisfied if `baseCommit` means the commit at which the request was created.

Observed FP-MCP-027 result:

```text
requestBaseCommit: 10b92ae
currentCommit: 2ae7666
reasons:
- BASE_COMMIT_MISMATCH
```

The request was valid, the working tree was clean, and the artifact path was safe.

Validation failed because the lifecycle model collapsed two different commits into one concept.

---

## Scope Boundary

FP-MCP-028 may:

* update request artifact lifecycle validation semantics
* introduce explicit creation/admission commit terminology
* update validation result field names if needed
* update MCP bridge validation logic
* update tests
* update documentation
* preserve compatibility with existing request artifacts where possible
* record verification artifacts

FP-MCP-028 must not:

* start OpenCode
* enable runner execution
* expose the runner publicly
* add new public runner endpoints
* call model providers
* execute shell commands through the runner
* mutate existing request artifacts in place
* commit tokens or secrets
* weaken execution boundaries
* treat runner reachability as execution authority

---

## Governing Principles

This packet is constrained by:

* P01 — ForgePilot records observations, not narratives.
* P02 — Trust cannot be retroactively created.
* P03 — ForgePilot does not optimize for favorable outcomes.
* P04 — Only admitted evidence may influence observatory outputs.
* P05 — Do not build infrastructure for evidence that does not yet exist.
* P06 — Classification follows observation.

---

## Required Lifecycle Model

Request artifact validation must distinguish:

```text
creationCommit
artifactCommit
```

### creationCommit

The repository commit at which the request artifact was created.

This records the source state the request was based on.

### artifactCommit

The repository commit at which the request artifact became admitted into repository history.

This records the state where the artifact itself became evidence.

---

## Validation Semantics

A committed request artifact should be valid when:

```text
creationCommit exists in repository history
artifactCommit exists in repository history
creationCommit is an ancestor of artifactCommit
artifactCommit is current HEAD or reachable from current HEAD
workingTreeClean is true
requestArtifactValid is true
modelAllowed is true
runModeAllowed is true
safeArtifactDir is true
executionEnabled is false
executionStarted is false
```

Validation must not require:

```text
creationCommit == current HEAD
```

For committed request artifacts, that equality is usually false by design.

---

## Compatibility Requirement

Existing request artifacts with only:

```text
baseCommit
```

may be interpreted as:

```text
creationCommit = baseCommit
```

The validator may derive `artifactCommit` from repository history if the artifact is committed.

If artifact admission cannot be determined safely, validation must fail closed.

---

## Required Result Fields

Validation should expose enough detail to avoid ambiguity.

Recommended fields:

```text
creationCommit
artifactCommit
currentCommit
creationCommitExists
artifactCommitExists
creationCommitAncestorOfArtifactCommit
artifactCommitReachableFromHead
workingTreeClean
requestArtifactValid
modelAllowed
runModeAllowed
safeArtifactDir
executionEnabled
executionStarted
eligible
reasons
```

Legacy fields may remain if needed, but must not obscure lifecycle meaning.

---

## Remote Runner Pre-Validation

Remote runner endpoint validation must use the corrected local pre-validation semantics.

The runner should only be contacted after lifecycle validation passes locally.

If local validation fails, the runner must not be contacted.

---

## Acceptance Criteria

* FP-MCP-028 packet is committed.
* Validation no longer requires request creation commit to equal current HEAD.
* Validation distinguishes creation commit and artifact admission commit.
* Existing FP-MCP-027 request artifact can be evaluated under corrected lifecycle semantics.
* A newly created and committed request artifact can pass local validation.
* Remote runner endpoint validation can contact the runner after corrected pre-validation passes.
* Execution remains disabled.
* OpenCode is not started.
* OpenCode CLI is not invoked.
* OpenCode API is not invoked.
* Shell execution through runner is not used.
* No secrets are committed.
* Repository remains clean after verification commit.

---

## Verification Requirements

Verification must record:

* packet commit
* implementation commit
* request artifact id used for validation
* creation commit
* artifact commit
* current commit
* local validation result
* remote runner validation result
* runner contacted status
* executionEnabled status
* executionStarted status
* confirmation that OpenCode was not started
* confirmation that runner execution remains disabled
* clean tree confirmation

Record artifacts under:

```text
runs/FP-MCP-028/
```

Recommended artifacts:

* `runs/FP-MCP-028/executor-result.md`
* `runs/FP-MCP-028/verification.txt`

---

## Expected Follow-Up

After this packet is committed, implementation should update the MCP bridge validation logic so request artifact creation provenance and request artifact admission provenance are evaluated as separate lifecycle facts.

The implementation should not create execution authority.

The implementation should not start OpenCode.

The implementation should only unblock safe validation of committed request artifacts.

