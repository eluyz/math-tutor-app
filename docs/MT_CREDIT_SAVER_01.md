# MT-CREDIT-SAVER-01 — AI-credit budgeted Copilot backlog

Related: [MT-DAY-01 #200](https://github.com/eluyz/math-tutor-app/issues/200), [MT-NIGHT-02 #227](https://github.com/eluyz/math-tutor-app/issues/227), [MT-REPAIR-01 #229](https://github.com/eluyz/math-tutor-app/issues/229).

## Why this exists

As of 2026-11-08, the owner's GitHub Copilot Student panel reports **200/200 included AI Credits consumed** for November and **$0 additional budget**; included credits reset on 2026-12-01. The original 21-issue ready queue and 3 concurrent cloud agents are too expensive for that allowance. Agent execution time is **not** an enforceable cap on AI Credits spent.

## New fail-closed baseline (after PR release)

- **1 active Copilot cloud-agent session across dispatch and repairs**, not 3.
- **1 new Issue assignment per tick**; only **one Issue** is on the actual live allowlist in this pilot batch: **[#217](https://github.com/eluyz/math-tutor-app/issues/217)**, a bounded synthetic F05 contract in one documentation file.
- **20 other former queue Issues remain OPEN, unchanged in identity, and explicitly PARKED**. They are not "done"; #201 and #209 are next proposed micro-pilots for a separately owner-approved queue revision, after we measure consumption on #217. Hard-gated #196, #219, #221, #223 remain excluded.
- **One automatic repair attempt per eligible PR**, reduced from two; after a second failed evaluation, BLOCKED and owner review instead of re-running another model session.
- **Manual monthly budget gate:** Actions repository variable `MT_CREDIT_MONTH_OK` must match the current UTC month exactly, for example `2026-12`, and is deliberately **UNSET** by default. Existing `MT_DISPATCH_LIVE=false` and `MT_REPAIR_LIVE=false` remain OFF. The gate automatically expires at each UTC month boundary; do not use a permanent `true`.
- This gate is a **human acknowledgement, NOT an automated read of remaining AI Credits**. It cannot guarantee a dollar/credit cap. The owner must verify credit availability in GitHub Billing → AI usage before authorizing a month, and review actual credit use after each pilot before allowing more issues.
- No automatic merge. CI PASS ≠ mathematical SOURCE_PASS. No production source copying, no adjusting independent oracle to match broken generator.

## Copilot issue cost discipline

The owner-facing Issues #201–#224 have been revised to include a prominent **CREDIT-SAVER V2** override above the original specifications:

- Target **8–15 minutes** with stop-scope around 12 minutes, not 40–59 minutes.
- Read only 1–3 directly relevant source/test files and the exact requested task description. Avoid broad inventory scans, exploratory research and repository-wide context gathering. Keep one output file except where an approved code change requires more.
- Run **one targeted test** if code was changed; do not install Chromium, run broad npm test, all Playwright batches B–G or full builds *inside* the Copilot session. GitHub PR CI owns that evidence.
- QA: **4–6 independent sample tuples**, real negative cases, PL/EN views where applicable, exact tested tuple IDs; sampled QA does not certify all 18k+ variants. Source-sensitive changes still need external private-source verification.
- Syllabus: **2–3 specified competency IDs** in a micro-pass, with missing method vs missing proof distinction; other IDs marked UNCHECKED. Create follow-up Issues rather than granting false full coverage.
- New method contracts: **two targeted synthetic geometries**; complex multi-file production changes remain PARKED and require a reviewed contract and tiny follow-up tasks.
- If the task cannot be completed correctly within scope, stop with BLOCKED / NOT_VERIFIED and leave a reproducible report. Never pad a PR or invent SOURCE_PASS.

## Activation sequence

1. Review CI and security of the MT-CREDIT-SAVER-01 Draft PR and separately **approve exact-head squash merge**. Verify post-merge main CI + Pages success.
2. Keep `MT_DISPATCH_LIVE=false`, `MT_REPAIR_LIVE=false` and `MT_CREDIT_MONTH_OK` unset until new credit allowance is actually available.
3. Confirm the private PAT secret `MT_COPILOT_DISPATCH_PAT` exists; the current DRY_RUN cannot prove PAT read/write permissions. Do not expose the token in chat, Issue or logs.
4. When owner verifies balance, set Actions variable `MT_CREDIT_MONTH_OK=YYYY-MM` for the **current UTC month**, and enable **only `MT_DISPATCH_LIVE=true`** for an exact one-Issue pilot. Current restricted queue dispatches only #217. Run workflow manually once, verify real issue assignment, agent session and PR, and inspect AI Credits afterward.
5. Re-disable `MT_DISPATCH_LIVE=false` while measuring cost and QA results. Enable `MT_REPAIR_LIVE` only in a separately reviewed controlled repair pilot; never blindly enable both at once.
6. Subsequent micro-batches require a reviewed GitHub PR editing the queue allowlist. Maximum **3 Issues per batch**, one agent at a time, and owner monitors the actual AI Credits ledger. Do not auto-rearm based on a stale balance or old "quota exhausted" PR messages.
7. Emergency stop: set both LIVE variables to `false` and unset `MT_CREDIT_MONTH_OK`. This stops *new* assignments (already running sessions may finish).

## Evidence and limitations

- This PR's offline unit tests verify configuration guards and selection, not PAT authorization or the GitHub cloud agent actual response.
- GitHub Actions CI/Pages are separate from Copilot's 200 monthly AI Credits. A user can consume AI Credits even if the Copilot PR changes zero files.
- The dynamic quota flag based on open PR content can be false even with an exhausted account, so **monthly acknowledgement plus tiny finite allowlist are essential**, though neither detects mid-month credit depletion without a manual review.
- PR #199 QA-10 is still a separate independent audit gate. #196 QA-11 is source/schema dependent; do not mark semantic QA complete just because CI or offline tests pass.
