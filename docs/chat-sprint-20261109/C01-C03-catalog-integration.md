# C01/C03 bounded synthetic methods — integration PR #266

- Reconciled against main `d0887edeca4e7129a5b87e57e7cd9e5d60d6eeab` (I02 catalog +24 variants and M01 hint fix preserved); earlier base `03745d5e59cb196bc3724564c860695a35ac01b4`. All existing files and user-facing families preserved.
- Prior C01/C03 exact HEAD `d0eb6f8ac5d63d18ca5496b0d3e5951aa58295e7`: unit, build, Playwright, acceptance B–D passed before shared F05/b catalog files changed on main. This candidate HEAD has a new Git tree and MUST receive separate full exact-head CI.
- C01 `sequence-polynomial-source-shapes`: 96 synthetically generated plain polynomial, factored-ratio, sextic-ratio variants. C03 `sequence-conjugate-source-shapes`: 96 radical forms including reverse difference, linear-root pair, positive sum, negative radicand constant with truthful n>=N domain.
- Baseline latest main: **253 families/19,221 instances**, L4 190/L5 173. Proposed: **255 families/19,413 instances**, L4 192/L5 175. New catalog math feedback tests cover 192 variants in PL+EN; eight Playwright acceptance journeys with mobile/desktop, both languages.
- Original private university statements, values, and answer key are NOT published. Synthetic source-form coverage is NOT 1:1 original university SOURCE_PASS.
- Isolated Draft PRs #263 and #264 already independently achieved full exact-head CI PASS. They must not be separately merged if combined integration passes. Current PR #266 requires full CI SUCCESS, mergeability against current main and owner consent (owner agreed to serial integration recommendations).
