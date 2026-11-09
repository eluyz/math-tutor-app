# C02 catalog integration — owner-approved, exact-CI gated

- Method PR #236 squash-merged as `137ad44156a383d6368d60baa1b97398197d7c91`.
- Current #242 parent `3a96dd5d32cc0293ab9952e228501a80fab5bfab` incorporates concurrent #244 G06 (Euler infinity), #250 U06/U08 and earlier M06 #251, W02 #248, I04 #239. All preserved.
- Adds only `sequence-root-quartic`, 96 tasks across four levels (medium/hard/advanced/expert), PL/EN. Bounded rational limit `A/d`, 96-variant independent integration Vitest and 4 PL/EN 375/1280px E2E checks.
- New *proposed* inventory: 244 families / 18,621 variants, advanced 183/expert 166, based on current 243/18,525.
- Prior exact HEAD `44a73cef0cc063807fe38a798a9241d360c3067c` CI PASSED https://github.com/eluyz/math-tutor-app/actions/runs/42590157660 . Concurrent #244 main modified shared catalog, resulting in conflict; fixed in this candidate tree.
- DO NOT claim current CI PASS until full fresh exact-HEAD GitHub Actions finishes. User has explicitly authorized squash merge of #242 once full CI PASS and main compatibility verified; do not auto-merge.
- After merge, verify main push CI and Pages for exact merged SHA. Private worksheet/key not committed. Source-wide C02 SOURCE_PASS still not claimed; P15/1h has separate unmerged PR #253.
- Refs #108, #236, #242, #253.
