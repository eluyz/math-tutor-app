> [!IMPORTANT]
> **2026-11-08 CREDIT-SAVER OVERRIDE (pending separate PR release):** the older **two automatic repairs** and **three active agents** below are historical. See [MT-CREDIT-SAVER-01](./MT_CREDIT_SAVER_01.md): **one shared active agent slot**, **one automatic repair per PR**, and manual month-scoped Actions variable `MT_CREDIT_MONTH_OK=YYYY-MM`. Keep `MT_REPAIR_LIVE=false` until controlled live pilot and confirmed AI-credit allowance; the dispatcher/repair scripts cannot read actual AI Credits automatically.

# MT-REPAIR-01 — bounded autonomous QA repair loop

Parent [Issue #229](https://github.com/eluyz/math-tutor-app/issues/229). Follows [MT-NIGHT-02 PR #228](https://github.com/eluyz/math-tutor-app/pull/228). **DRY_RUN by default. No autonomous merging.**

## What it does

When enabled, a trusted GitHub Actions workflow runs every 15 minutes. It looks for a Copilot-authored, explicitly allowlisted PR whose **exact current HEAD SHA** has either (a) a real completed CI `failure`, or (b) an independent, documented owner `NEEDS_FIXES` review. It posts at most **one** new `@copilot` repair instruction on the same PR. Copilot can work on that PR branch. A new commit invalidates the old CI and QA verdict; the workflow waits for fresh checks on the **new SHA** before considering another attempt.

Two repair attempts maximum **per PR**. The retry log is recorded in immutable GitHub comment history with PR, SHA, attempt number and trigger. A repeated call on the same SHA is never posted. At two failed repairs, the state is `BLOCKED` and needs manual attention. The repair workflow shares the concurrency lock with MT-NIGHT-02, checking the global three-agent budget before posting.

This workflow alone is **not** the full independent maths QA. Phase 1 can autonomously react to actual CI failures. A semantic or pedagogical `NEEDS_FIXES` must be based on a separately conducted independent QA review, currently represented by an exact-SHA owner-authored comment. An independent machine-verified QA gate (future #196 integration) can replace the owner comment only after separate technical/security approval.

## Reviewer QA protocol

An authenticated owner GitHub PR comment (not from Copilot) must include the exact marker, current commit SHA and **specific reproducible findings**:

```md
<!-- MT-QA:v1 pr=250 sha=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa verdict=NEEDS_FIXES -->
Findings:
- Family/difficulty/variant, observed wrong result, independently calculated correct result, explanation and reproducible test.
```

Other supported verdicts are `PASS` and `BLOCKED`. Missing details, stale SHA, non-owner authors and inconsistent comments cannot trigger a semantic repair. A `PASS` after complete CI is only `PASS_CANDIDATE_NO_MERGE`; it does not authorize a merge or certify whole syllabus/source coverage.

## Stop conditions and protections

- Only Copilot-created open PRs linked to **exactly one** allowlisted issue; maximum 12 changed files.
- No infrastructure/package changes within a candidate repair PR. Repair commits changing `src/qa/`, `e2e/`, `*.test.*`, `*.spec.*`, `docs/QA_*`, `docs/qa*` are blocked, not interpreted as success. Repair prompts explicitly forbid weakening tests and validators.
- `CI action_required`, missing CI, skipped/cancelled runs and unknown GitHub API states are **not** fixable CI failures. They block. Existing Copilot PRs #199/#225/#226 have required manual workflow approval; #225/#226 additionally report quota exhaustion.
- Any open quota-exhausted PR stops further automatic repairs. Never retry on low balance in a loop.
- No default Actions-token writes. A dedicated owner PAT is used solely for obtaining agent task state and publishing the repair comment. Never use `pull_request_target`, never inject PAT into PR jobs, never store token in source or chat.
- Main must report **protected=true**, and both same-SHA `main` CI and Pages must PASS. MT-NIGHT-02 must already be deployed. All checks fail closed if missing.
- No automatic squash, merge button, code review bypass, AI model API, privileged branch edit or release decision. Scope of task-specific QA remains bounded; SOURCE_PASS needs its own private-source review.

## Owner activation, only after approved and released PRs

1. Complete independent review, full CI, and separate owner-approved merge of MT-NIGHT-02 (#228) and this infrastructure PR, with main CI and Pages success on the exact post-merge SHA. Protect `main` in GitHub repository **Settings → Branches / Rulesets** with required pull-request/checks, no force push, no admin bypass.
2. Inspect Copilot quota and handle already-open PRs #225 and #226 that report exhausted quota. Do not close unfinished tasks as successfully delivered. Do not bypass GitHub Actions `action_required`.
3. Create/validate a **fine-grained user PAT** restricted to `eluyz/math-tutor-app` with GitHub's required rights for agent-task read and PR comments. Put it **only** in Repository **Settings → Secrets and variables → Actions → Secrets** as `MT_COPILOT_DISPATCH_PAT`. Never send the secret in chat, issue or PR.
4. Run the workflow once in **DRY_RUN** using **Actions → MT-REPAIR-01 — bounded Copilot repair loop → Run workflow**. Verify JSON report and all blockers; this makes **zero writes**.
5. Only after a security-reviewed manual pilot, set Actions repository **Variable** `MT_REPAIR_LIVE=true`. The queue switch `MT_DISPATCH_LIVE` remains separate; use it only when the MT-NIGHT-02 dispatcher has passed its own live pilot.
6. Pilot on one disposable PR with intentionally failing CI, verify exactly **one** owner-authored `@copilot` comment, Copilot session running, new commit, and fresh CI. If owner-authored PAT comments do not trigger Copilot as expected, disable LIVE; this integration is not proven by offline tests.
7. Emergency stop: remove or set `MT_REPAIR_LIVE=false` and `MT_DISPATCH_LIVE=false`, or disable the corresponding Actions workflows. No background agent in ChatGPT is involved.

## Test and audit commands

```sh
node --check .github/scripts/mt-repair.mjs
node --test .github/scripts/mt-repair.check.mjs
node .github/scripts/mt-repair.mjs --check
```

The `pull_request` safety preflight runs only local tests with no credentials; the scheduled/manual job operates on trusted `main`, using read-only `GITHUB_TOKEN` to inspect CI, PR files and comments. Its reports are stored as seven-day artifacts. A failing check does not grant authority to rewrite tests. The branch protection and token UI configuration cannot be completed from the connected GitHub tools and require direct owner action.

## Status meanings

- `DRY_RUN`: code deployed but no actual Copilot repair triggered.
- `NEEDS_FIXES`: trusted new-head review or actual failed current-head CI, eligible for bounded repair.
- `WAITING_NEW_SHA`: repair request already posted for the current HEAD; never duplicate.
- `WAITING_CI`: no complete exact-head CI; wait.
- `AWAITING_INDEPENDENT_QA`: CI success alone is not maths PASS.
- `PASS_CANDIDATE_NO_MERGE`: trusted current-head QA PASS plus CI success; still requires separately authorized release.
- `BLOCKED`: quota, unapproved CI, source access, two attempts, changed QA tests, wrong permissions, invalid evidence or safety violation.
