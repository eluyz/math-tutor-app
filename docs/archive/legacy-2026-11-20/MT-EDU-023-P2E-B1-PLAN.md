# MT-EDU-023 P2E-B1 — dokładne pole dwóch parabol

Baza: PR #80 scalony i opublikowany, main 27afa8238e96655b4994075036ec959d8f5cb09b; 180 rodzin i 14 853 warianty.

- Jedna nowa rodzina: `integral-area-parabolas`, hard/advanced/expert, po 24 warianty (razem +72).
- Krzywe to dwie prawdziwe parabole o różnych, niezerowych współczynnikach kwadratowych, z różnymi osiami. Po odjęciu f-g=delta[(x-center)^2-radius^2].
- Odpowiedź to `∫|f−g|dx` po **wyłącznie wewnętrznych** przecięciach. Przypadki 0/1/2 przecięcia na przedziale, włącznie z dodatnią/ujemną deltą.
- Wyniki to dokładne ułamki; objaśnienia PL/EN; test niezależny przez próbkowanie numeryczne, bez zmian trybu sprawdzianów.
- Po ewentualnym merge: 181 rodzin, 14 925 wariantów; I07 nadal częściowo.

## Bramka
- [ ] Vitest + TypeScript/build + Playwright PASS
- [ ] Recenzja matematyczna i techniczna bieżącego HEAD
- [ ] Osobna wyraźna zgoda właściciela na Squash and merge (bez auto-merge)
