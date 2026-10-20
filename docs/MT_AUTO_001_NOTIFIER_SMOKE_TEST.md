# MT-AUTO-001 — temporary CI notifier smoke test

This file exists solely to exercise the GitHub Actions `pull_request` CI and the
new `workflow_run: completed` notification on the repository default branch.

Expected checks:
- The PR CI completes for this exact branch commit.
- The `PR Review CI Completion` workflow posts exactly one
  `math-tutor-ci-gate:v1` comment with the PR number, HEAD SHA,
  run ID and the observed CI attempt result.
- The comment says `CURRENT_CI: NOT_VERIFIED`,
  `CODE_REVIEW: NOT_ASSESSED_BY_THIS_WORKFLOW` and
  `CURRENT_READINESS: NOT_ASSESSED`.
- Neither the bot nor an assistant merges this PR or deploys its change.

**This is a temporary verification PR, not a product or mathematics change.**
Do not merge it. Close it after inspecting the notification.
