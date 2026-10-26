# MT-EDU-024 P2F-B — nowe przypadki I03/I04

Baza: \`main\` commit \`0c462bcfa95c3b317478716d09a50cd6e8e44f52\`, 184 rodziny / 15 141 wariantów, CI/Pages SUCCESS.

## P2F-B1: integral-log-substitution
- Całka ∫ k·2a(ax+b)/((ax+b)²+c) dx z a,k≠0, c>0; u=(ax+b)²+c.
- Przez podstawienie u′dx=du uzyskujemy k·ln(u)+C. Mianownik dodatni na R; nie wprowadzamy niejawnego ograniczenia dziedziny.
- Warianty uwzględniają ujemne a,k, dokładne wymierne parametry, 24 warianty na hard/advanced/expert.

## P2F-B2: integral-parts-trig-linear
- ∫kx sin(ax+b) dx = −(k/a)x cos(ax+b)+(k/a²)sin(ax+b)+C.
- ∫kx cos(ax+b) dx = (k/a)x sin(ax+b)+(k/a²)cos(ax+b)+C.
- Oba rodzaje, a,k≠0, u=x i dv jako funkcja trygonometryczna; 24 warianty na hard/advanced/expert.

## Bramki
- [ ] Niezależna weryfikacja dokładnych współczynników, pochodnych i dziedziny dla 144 wariantów.
- [ ] Vitest i TypeScript/build SUCCESS na aktualnym HEAD.
- [ ] Pełny Playwright Chromium SUCCESS na aktualnym HEAD: PL/EN i 375/1280 px.
- [ ] Niezależna recenzja matematyczna i techniczna oraz brak nierozwiązanych uwag.
- [ ] Osobna wyraźna zgoda właściciela na Squash and merge. BEZ AUTOSCALANIA.

Docelowo po zatwierdzonym merge: 186 rodzin / 15 285 wariantów. Nadal tylko częściowe pokrycie I03/I04. Bez trybu sprawdzianów i bez uczelnianej specyfiki w UI.
