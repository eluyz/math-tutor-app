# MT-NIGHT-01 — overnight Copilot / QA operation

**Phase 1: REPORT_ONLY. No unattended writes or merges.** Parent: #197. Dependencies: #192, #194, QA-10 #195, QA-11 #196. A green CI alone does not certify mathematical quality.

## Scope of this PR

- Declarative queue: `docs/MT_NIGHT_QUEUE.json`; at most three active Copilot work units, non-overlapping scopes and explicit dependencies.
- Read-only Node 24 audit in `.github/scripts/mt-night-audit.mjs` with offline negative tests.
- Manual `workflow_dispatch` and an automated morning report scheduled at **06:15 UTC** (07:15 Warsaw in winter, 08:15 in summer). Scheduling becomes active **only after an explicitly owner-approved merge**.
- Input: exact SHA of `main`, GitHub Issues, linked open PRs, Copilot assignees, exact-head PR CI, dependency releases (main CI plus Pages).
- Output: GitHub Actions Step Summary, report JSON and Markdown retained as an artifact for seven days.
- Credentials: the built-in `GITHUB_TOKEN` restricted to `contents/issues/pull-requests/actions: read`. No PAT, secrets, database, paid API, extra GitHub write permissions, background ChatGPT execution or automated delegation.

Offline commands (do not require tokens):

    node --check .github/scripts/mt-night-audit.mjs
    node --test .github/scripts/mt-night-audit.check.mjs
    node .github/scripts/mt-night-audit.mjs --check

## Dependency and concurrency gates

| Work | Start condition | State in Phase 1 |
| --- | --- | --- |
| QA-10 #195 | #194 and #192 must be merged, with main CI and Pages PASS on each merge SHA | NOT_STARTED / blocked until evidence |
| QA-11 #196 | QA-10 closed and a linked completion PR explicitly recorded as `completed_by_pr`, with same-SHA main CI and Pages PASS | BLOCKED_BY_QA10 |

For the second row, closing an issue alone does not release it. A later reviewed update to the queue manifest must record the completion PR.

The validator fails on duplicate task IDs, unknown mode, invalid dependencies, cycles, overlapping declared scopes and `max_active > 3`. The live report counts open Copilot PRs and assigned tasks, including untracked PRs. **The read-only guard can report an over-limit situation but cannot stop an already launched agent.** Scopes describe intended ownership; they are not a sandbox.

Missing API information, an unverified SHA, absent CI or missing Pages is never PASS. PR CI success and production Pages success are different evidence classes. QA-003 counters, browser scenarios, math answers and syllabus SOURCE_PASS must never be added together.

## Recommended operating procedure

1. PM checks the current `main`, PRs and dependencies. Existing merges always require explicit owner approval for an exact HEAD SHA.
2. When independent tasks have no conflicting branches and are under the three-unit cap, PM can assign them to Copilot through an **authenticated user session**. This report workflow does not assign anyone.
3. Each job produces its own branch and Draft PR. Copilot may run internal tests, but its PR's GitHub Actions workflow might require a human `Approve and run workflows` before starting.
4. The morning workflow reports PRs, SHAs, CI, unresolved approvals, dependency gaps and sensitive file changes. The user can ask ChatGPT for a separate **independent mathematical and code review**; GitHub Actions cannot itself wake this chat up.
5. For a content change, the reviewer checks independent mathematical oracles, correct/wrong/empty grading, PL/EN explanations and browser evidence, not only green CI.
6. After separate exact-SHA approval: squash merge, full main CI, same-SHA Pages, then process the next dependency. **No auto-merge.**

## Stage 2 proposal — NOT activated

- **Simplest:** assign up to three independent issues before going offline (no extra credentials), then review Draft PRs in the morning.
- **Optional sequential dispatch:** investigate GitHub Copilot user-authenticated assignment and least-privilege controls in a separate security-reviewed pilot. Never assume a generic workflow `GITHUB_TOKEN` can start Copilot Student sessions.
- Before workflow-auto-approval or unattended write APIs: protect `main`, inspect all privileged workflows, isolate secrets and set budget, concurrency/timeout and manual kill-switch rules. The public repository currently lacks `main` branch protection, and Copilot PR workflows require explicit approval by default.
- Absolutely no `pull_request_target` running untrusted code, no privileged checkout of PR HEAD on `workflow_run`, no automatic merge and no unreviewed PAT or token with write scopes.

## Limitations

The report is **metadata only**; it does not prove correctness of maths, teaching steps, or grading. Scheduled Actions can be delayed; cron uses fixed UTC. PR body/issue content is untrusted and must never be executed. Link matching based on closing references (for example `Fixes #195`) can miss manually linked PRs, which is reported as NOT_VERIFIED rather than inventing readiness.
