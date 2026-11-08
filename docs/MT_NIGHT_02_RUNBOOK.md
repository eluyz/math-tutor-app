# MT-NIGHT-02 — safe Copilot dispatcher

Owner plan: Issue #227; source backlog: Issue #200.

## Runtime and limits

- Cron: minutes 7,22,37,52 UTC (GitHub may delay scheduled jobs); manual workflow_dispatch also works.
- DRY_RUN by default: no write calls, no assignments, no merge, no branch-rule changes.
- LIVE requires repository Actions variable MT_DISPATCH_LIVE=true, a dedicated user PAT secret MT_COPILOT_DISPATCH_PAT, protected main, and same-SHA CI plus Pages PASS on main.
- Fixed queue in docs/MT_NIGHT_02_QUEUE.json: 21 eligible Issues in 3 disjoint lanes, up to 3 active sessions, at most one newly assigned issue per lane per run. Current tasks previously assigned to Copilot are skipped (no duplicate assignment).
- The official GitHub agent tasks REST API supplies queued / in_progress / idle / waiting_for_user state. Invalid schema, missing link to active PR, unrecognized task state or API permission issue => BLOCKED, no guesses.
- Copilot quota signals on any open PR => BLOCKED, no automatic resubmission. Empty PRs #225/#226 explicitly report exhausted quota at the preparation checkpoint. Resolve their status and check GitHub Copilot quota before enabling LIVE.
- Excluded hard dependencies: QA-11 #196, F05 browser #219, W02 generator #221 and #223. They are NOT auto-assigned. They require accepted releases/private-source gates and a separately reviewed queue update.
- The queue is finite and the dispatcher never reassigns already-assigned Issues. It does not bypass quota, restart failed sessions, approve CI or merge PRs.
- Every Copilot Issue should target 25–40 minutes and emit a Draft PR. Full CI/Playwright runs in GitHub separately.

## One-time owner setup AFTER PR merge, same-SHA main CI and Pages PASS

1. Protect main: GitHub repo > Settings > Branches > Add branch protection rule. Require pull requests, required existing CI check verify, block force pushes/deletions and bypasses (including admins). Consider requiring up-to-date branch checks; test whether usual manually approved release process remains functional. LIVE refuses to run unless GitHub main branch reports protected=true.
2. Review the already-open quota-exhausted PRs #225 and #226 and the account's available Copilot credits. Do not mark them finished.
3. Create GitHub fine-grained personal access token on the owner's account. Restrict resource owner to eluyz and repository to math-tutor-app only, short expiry. GitHub Copilot issue-assignment API requires metadata:read plus Actions/Contents/Issues/Pull requests read/write. Official agent-tasks list additionally requires Agent tasks:read; verify availability for this account. Never paste a token into chat, issues, commits or workflow logs.
4. Repository > Settings > Secrets and variables > Actions > Secrets: create MT_COPILOT_DISPATCH_PAT and paste the PAT only there.
5. First merge the infrastructure PR and run the GitHub workflow once in dry run: Actions > MT-NIGHT-02 — safe Copilot queue dispatcher > Run workflow. Review its report and alerts.
6. Only after validating credentials and safe permissions: Repository > Settings > Secrets and variables > Actions > Variables, add MT_DISPATCH_LIVE=true. This is the deliberate switch to LIVE. Setting it false or removing it stops further assignments.
7. Check the next workflow run and Copilot issue assignments. A dry-run PASS never proves LIVE auth, quotas or agent-task API. Require a verified first live assignment before declaring end-to-end PASS.

## Security and independent QA

PR-triggered offline-preflight has no PAT or token in environment and only contents:read. Production dispatch runs on trusted main, checkout credentials are never persisted, and GITHUB_TOKEN is read-only. The PAT is used only for the documented agent-task list and issue assignment call.

Main is presently unprotected and repo allow_auto_merge=false. The dispatcher contains NO automatic merge logic. User asks whether test-green PRs could auto-merge: yes, GitHub supports per-PR auto-merge after branch protections and required reviews/checks, but green CI alone cannot establish mathematical and pedagogical correctness. Keep production generator, grading, hints, solutions and syllabus source acceptance under independent owner review. A later separate policy could allow narrow docs-only PRs to auto-merge after stronger gates and explicit owner approval. Never enable global unconditional merge.

Commands:
- node --check .github/scripts/mt-night-dispatch.mjs
- node --test .github/scripts/mt-night-dispatch.check.mjs
- node .github/scripts/mt-night-dispatch.mjs --check

A clean offline unit test verifies scheduling logic, not actual GitHub API permissions, actual task creation or budget. For status, independently verify linked PR, exact HEAD, full CI, Pages, math/source evidence and actual changed files.
