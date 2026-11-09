# Combined C02/C05 synthetic sequence methods — candidate PR #259

- Parent `88cc6e653ec03af460d7c3496aa168e3ff2a086b` includes G07 integration #258, U06/U08 #252, and earlier C02 #242. Later unrelated commits #260 W and #233 U may be present on main; do not overwrite them.
- Old exact HEAD `477e2730e783ccabdbd7e4006f23cdee96c132c2` passed FULL CI https://github.com/eluyz/math-tutor-app/actions/runs/42622066014, but G07 #258 introduced shared-catalog conflicts. This branch must pass its own new exact-HEAD CI before approval.
- Adds one C02 negative quadratic root / linear method (96 synthetic variants), one C05 quadratic-scale Euler method (96 variants). Exact rational / symbolic results and bilingual teaching; eight PL/EN mobile/desktop E2E tests and 192-case catalog integration regression.
- Before proposed additions catalog had 247 families and 18,789 variants (L4 185 L5 168); candidate has 249 families / 18,981 variants (L4 187 L5 170).
- No private original university tasks or keys are copied. Full C02/C05 SOURCE_PASS not claimed. No merge without exact-HEAD CI SUCCESS, current main compatibility and separate owner approval. Both source method Draft PRs #253 and #256 remain unmerged.
