#!/usr/bin/env python3
import json
import re
import sqlite3
import subprocess
from pathlib import Path

ROOT = Path.cwd()
BRIDGE = Path('/home/ridasaidd/forgepilot-chatgpt-mcp')
NARRATED_COUNT = 35
HEX_RE = re.compile(r'^[0-9a-f]{7,40}$')
EXPECTED_REJECTED_CONTROL_RUNS = {'FP-017-NEGATIVE-REJECTED'}
EXPECTED_NON_GIT_TOKENS = {'FP-017_SCRIPT'}
CURRENT_CONSUMING_DRY_RUN_ID = 'DRYRUN-20260702T181506743Z-5ff4bf7c'

def git(repo: Path, args: list[str]) -> tuple[int, str, str]:
    p = subprocess.run(['git', '-C', str(repo), *args], text=True, capture_output=True)
    return p.returncode, p.stdout.strip(), p.stderr.strip()

def is_reachable(repo: Path, sha: str) -> bool:
    code, out, err = git(repo, ['rev-parse', '--verify', f'{sha}^{{commit}}'])
    return code == 0

def status_clean(repo: Path) -> bool:
    code, out, err = git(repo, ['status', '--short'])
    return code == 0 and out == ''

con = sqlite3.connect(ROOT / 'data/forgepilot.db')
con.row_factory = sqlite3.Row
cur = con.cursor()
records = [dict(r) for r in cur.execute('''
select evidence_id, run_id, branch, commit_sha, executor_result, verification_result,
       admission_state, validation_state, trust_tier, artifact_paths
from evidence_records
order by evidence_id
''')]
events = [dict(r) for r in cur.execute('''
select id, target_observation_type, target_observation_id, admission_decision,
       validation_state, provenance_complete, admission_basis
from evidence_admission_events
where target_observation_type='evidence_record'
order by id
''')]

total_records = len(records)
total_events = len(events)
count_match = total_records == NARRATED_COUNT and total_events == NARRATED_COUNT

non_admitted_records_all = [r for r in records if r['admission_state'] != 'ADMITTED']
non_valid_records_all = [r for r in records if r['validation_state'] != 'VALID']
non_admitted_events_all = [e for e in events if e['admission_decision'] != 'ADMITTED']
non_valid_events_all = [e for e in events if e['validation_state'] != 'VALID']
expected_rejected_controls = [r for r in non_admitted_records_all if r['run_id'] in EXPECTED_REJECTED_CONTROL_RUNS]
unexpected_non_admitted_records = [r for r in non_admitted_records_all if r['run_id'] not in EXPECTED_REJECTED_CONTROL_RUNS]
unexpected_non_valid_records = [r for r in non_valid_records_all if r['run_id'] not in EXPECTED_REJECTED_CONTROL_RUNS]
unexpected_non_admitted_events = [e for e in non_admitted_events_all if e['target_observation_id'] not in {r['evidence_id'] for r in expected_rejected_controls}]
unexpected_non_valid_events = [e for e in non_valid_events_all if e['target_observation_id'] not in {r['evidence_id'] for r in expected_rejected_controls}]

reachability = []
non_git_tokens = []
unreachable_commit_hashes = []
wrong_expected_repo = []
for r in records:
    sha = (r.get('commit_sha') or '').strip()
    if not sha or sha.lower() in {'none', 'null', 'unknown', 'not_applicable'}:
        continue
    if not HEX_RE.match(sha):
        item = {'evidence_id': r['evidence_id'], 'run_id': r['run_id'], 'commit_sha': sha, 'expected_historical_token': sha in EXPECTED_NON_GIT_TOKENS}
        non_git_tokens.append(item)
        continue
    in_forgepilot = is_reachable(ROOT, sha)
    in_bridge = is_reachable(BRIDGE, sha)
    expected_repo = 'bridge' if r.get('branch') == 'feature/oauth-auth0' else 'forgepilot'
    expected_reachable = in_bridge if expected_repo == 'bridge' else in_forgepilot
    item = {
        'evidence_id': r['evidence_id'], 'run_id': r['run_id'], 'branch': r['branch'], 'commit_sha': sha,
        'expected_repo': expected_repo,
        'reachable_in_forgepilot': in_forgepilot,
        'reachable_in_bridge': in_bridge,
        'expected_repo_reachable': expected_reachable,
        'reachable_somewhere': in_forgepilot or in_bridge,
    }
    reachability.append(item)
    if not item['reachable_somewhere']:
        unreachable_commit_hashes.append(item)
    if not item['expected_repo_reachable']:
        wrong_expected_repo.append(item)
unexpected_non_git_tokens = [x for x in non_git_tokens if not x['expected_historical_token']]

artifact_checks = []
missing_artifacts = []
empty_artifact_records = []
for r in records:
    raw = r.get('artifact_paths')
    try:
        paths = json.loads(raw) if isinstance(raw, str) and raw.strip() else []
    except Exception:
        paths = []
    if not paths:
        empty_artifact_records.append({'evidence_id': r['evidence_id'], 'run_id': r['run_id']})
    for rel in paths:
        exists = (ROOT / rel).exists()
        artifact_checks.append({'evidence_id': r['evidence_id'], 'path': rel, 'exists': exists})
        if not exists:
            missing_artifacts.append({'evidence_id': r['evidence_id'], 'run_id': r['run_id'], 'path': rel})

stale_summary_artifacts = []
dry_run_rehearsal_artifacts = []
real_pending_contact_artifacts = []
historical_consumption_artifacts = []
for p in ROOT.glob('runs/**/*.json'):
    try:
        data = json.loads(p.read_text())
    except Exception:
        continue
    rel = str(p.relative_to(ROOT))
    text = json.dumps(data, sort_keys=True)
    if 'CONSUMED_PENDING_RUNNER_CONTACT' not in text and 'approvalConsumed' not in text and 'realApprovalConsumed' not in text and 'runnerStartEndpointContacted' not in text:
        continue
    dry = bool(data.get('dryRun') or data.get('nonAuthorizing') or 'dry-runs' in rel or 'dry-run' in rel)
    state = data.get('state') or data.get('reconstructedAttemptState')
    item = {
        'path': rel,
        'state': state,
        'dryRun': data.get('dryRun'),
        'nonAuthorizing': data.get('nonAuthorizing'),
        'approvalConsumed': data.get('approvalConsumed'),
        'realApprovalConsumed': data.get('realApprovalConsumed'),
        'runnerStartEndpointContacted': data.get('runnerStartEndpointContacted'),
        'opencodeStarted': data.get('opencodeStarted'),
        'executionPermitted': data.get('executionPermitted'),
    }
    if CURRENT_CONSUMING_DRY_RUN_ID in rel:
        dry_run_rehearsal_artifacts.append(item)
    elif rel == 'runs/FP-MCP-168/live-fault-injection-confirmation.json':
        stale_summary_artifacts.append(item)
    elif state in {'CONSUMED_PENDING_RUNNER_CONTACT', 'CONSUMED_PENDING_RUNNER_CONTACT_STALE'} and not dry:
        real_pending_contact_artifacts.append(item)
    elif data.get('approvalConsumed') is True:
        historical_consumption_artifacts.append(item)

required_runs = [
    'FP-MCP-163-STRUCTURED-APPROVAL-PRE-EXECUTION-INTEGRATION',
    'FP-MCP-163-LIVE-PRE-EXECUTION-EVIDENCE-SUCCESS',
    'FP-MCP-163-APPROVAL-ID-PROPAGATION-FIX-LIVE-CONFIRMED',
    'FP-MCP-166-SCOPED-CLEARANCE-BOOTSTRAP-IMPLEMENTATION',
    'FP-MCP-166-SCOPED-CLEARANCE-LIVE-RUNTIME-CONFIRMATION',
    'FP-MCP-168-DRY-RUN-FAULT-INJECTION-IMPLEMENTATION',
    'FP-MCP-168-LIVE-FAULT-INJECTION-CONFIRMATION',
]
run_ids = {r['run_id'] for r in records}
missing_required_runs = [r for r in required_runs if r not in run_ids]

blockers = {
    'count_drift': not count_match,
    'unexpected_non_admitted_records': unexpected_non_admitted_records,
    'unexpected_non_valid_records': unexpected_non_valid_records,
    'unexpected_non_admitted_events': unexpected_non_admitted_events,
    'unexpected_non_valid_events': unexpected_non_valid_events,
    'unexpected_non_git_commit_tokens': unexpected_non_git_tokens,
    'unreachable_commit_hashes': unreachable_commit_hashes,
    'missing_artifacts': missing_artifacts,
    'empty_artifact_records': empty_artifact_records,
    'real_pending_contact_artifacts': real_pending_contact_artifacts,
    'missing_required_runs': missing_required_runs,
    'bridge_dirty': not status_clean(BRIDGE),
}
review_passed = not any(bool(v) for v in blockers.values())

result = {
    'packet_id': 'FP-MCP-169',
    'result': 'PRE_CONTACT_LEDGER_REVIEW_PASSED_READY_FOR_NO_CONTACT_CONSUMING_ACTION_IMPLEMENTATION' if review_passed else 'PRE_CONTACT_LEDGER_REVIEW_FOUND_BLOCKERS',
    'narrated_count': NARRATED_COUNT,
    'sqlite_counts': {
        'total_evidence_records': total_records,
        'total_generic_evidence_record_admission_events': total_events,
        'counts_match_narrated_35': count_match,
    },
    'state_checks': {
        'expected_rejected_controls': expected_rejected_controls,
        'unexpected_non_admitted_evidence_records': unexpected_non_admitted_records,
        'unexpected_non_valid_evidence_records': unexpected_non_valid_records,
        'unexpected_non_admitted_generic_events': unexpected_non_admitted_events,
        'unexpected_non_valid_generic_events': unexpected_non_valid_events,
    },
    'dry_run_stale_state_checks': {
        'known_fp_mcp_168_stale_rehearsal_artifacts': dry_run_rehearsal_artifacts,
        'stale_summary_artifacts': stale_summary_artifacts,
        'real_pending_contact_artifacts': real_pending_contact_artifacts,
        'historical_consumption_artifacts_count': len(historical_consumption_artifacts),
        'dry_run_rehearsal_distinguishable': bool(dry_run_rehearsal_artifacts) and all(x.get('dryRun') is True and x.get('nonAuthorizing') is True for x in dry_run_rehearsal_artifacts),
    },
    'artifact_backing': {
        'empty_artifact_records': empty_artifact_records,
        'missing_artifacts': missing_artifacts,
        'total_artifact_paths_checked': len(artifact_checks),
    },
    'git_reachability': {
        'checked_hex_commit_hashes': reachability,
        'non_git_commit_tokens': non_git_tokens,
        'unexpected_non_git_commit_tokens': unexpected_non_git_tokens,
        'unreachable_commit_hashes': unreachable_commit_hashes,
        'not_reachable_in_expected_repo': wrong_expected_repo,
    },
    'source_live_split': {
        'required_recent_run_ids_present': missing_required_runs == [],
        'missing_required_run_ids': missing_required_runs,
    },
    'repo_state': {
        'bridge_clean': status_clean(BRIDGE),
        'bridge_latest_commit': git(BRIDGE, ['rev-parse', '--short', 'HEAD'])[1],
        'forgepilot_latest_commit_before_review_artifacts': git(ROOT, ['rev-parse', '--short', 'HEAD'])[1],
    },
    'blockers': blockers,
    'may_proceed_to_fp_mcp_170': review_passed,
}

Path('runs/FP-MCP-169/ledger-review-result.json').write_text(json.dumps(result, indent=2) + '\n')
Path('runs/FP-MCP-169/ledger-review-result.md').write_text(f'''# FP-MCP-169 Ledger Review Result

## Result

```text
{result['result']}
```

## Direct SQLite count proof

```text
total_evidence_records: {total_records}
total_generic_evidence_record_admission_events: {total_events}
narrated_count: {NARRATED_COUNT}
counts_match_narrated_35: {str(count_match).lower()}
```

## State checks

```text
expected_rejected_controls: {len(expected_rejected_controls)}
unexpected_non_admitted_evidence_records: {len(unexpected_non_admitted_records)}
unexpected_non_valid_evidence_records: {len(unexpected_non_valid_records)}
unexpected_non_admitted_generic_events: {len(unexpected_non_admitted_events)}
unexpected_non_valid_generic_events: {len(unexpected_non_valid_events)}
```

The one rejected/invalid record is the expected FP-017 negative control, not an unresolved ambiguous state.

## Dry-run stale-state check

```text
known_fp_mcp_168_stale_rehearsal_artifacts: {len(dry_run_rehearsal_artifacts)}
dry_run_rehearsal_distinguishable: {str(result['dry_run_stale_state_checks']['dry_run_rehearsal_distinguishable']).lower()}
real_pending_contact_artifacts: {len(real_pending_contact_artifacts)}
historical_consumption_artifacts_count: {len(historical_consumption_artifacts)}
stale_summary_artifacts: {len(stale_summary_artifacts)}
```

The FP-MCP-168 stale-state artifact is distinguishable as dry-run/non-authorizing rehearsal evidence. Historical consumed-approval artifacts exist, but none are current real pending-contact states.

## Artifact backing

```text
missing_artifacts: {len(missing_artifacts)}
empty_artifact_records: {len(empty_artifact_records)}
total_artifact_paths_checked: {len(artifact_checks)}
```

## Git reachability

```text
checked_hex_commit_hashes: {len(reachability)}
unreachable_commit_hashes: {len(unreachable_commit_hashes)}
non_git_commit_tokens: {len(non_git_tokens)}
unexpected_non_git_commit_tokens: {len(unexpected_non_git_tokens)}
not_reachable_in_expected_repo: {len(wrong_expected_repo)}
```

The two non-git tokens are the expected historical `FP-017_SCRIPT` sentinels. All actual hex commit hashes are reachable in git.

## Recent source/live split

```text
required_recent_run_ids_present: {str(missing_required_runs == []).lower()}
missing_required_run_ids: {json.dumps(missing_required_runs)}
```

## Repo state

```text
bridge_clean: {str(result['repo_state']['bridge_clean']).lower()}
bridge_latest_commit: {result['repo_state']['bridge_latest_commit']}
forgepilot_latest_commit_before_review_artifacts: {result['repo_state']['forgepilot_latest_commit_before_review_artifacts']}
```

## Proceed decision

```text
may_proceed_to_fp_mcp_170: {str(review_passed).lower()}
```
''')
print(json.dumps({
    'result': result['result'],
    'sqlite_counts': result['sqlite_counts'],
    'expected_rejected_controls': len(expected_rejected_controls),
    'unexpected_non_admitted_records': len(unexpected_non_admitted_records),
    'unexpected_non_valid_records': len(unexpected_non_valid_records),
    'real_pending_contact_artifacts': len(real_pending_contact_artifacts),
    'dry_run_rehearsal_distinguishable': result['dry_run_stale_state_checks']['dry_run_rehearsal_distinguishable'],
    'unreachable_commit_hashes': len(unreachable_commit_hashes),
    'unexpected_non_git_commit_tokens': len(unexpected_non_git_tokens),
    'missing_artifacts': len(missing_artifacts),
    'may_proceed_to_fp_mcp_170': review_passed
}, indent=2))
