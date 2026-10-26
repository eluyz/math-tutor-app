# MT-EDU-025 P2G-A — W01

Baza: main b113d789fd42921656cdee8f53c52d17bd4acbab, 186 rodzin / 15 285 wariantów, CI i Pages PASS.

## Rodziny
- multivar-cubic-partial: f=ax³+bx²y+cxy²+dy³+exy+gx+hy; dokładne f_x, f_y, f_xx, f_xy, f_yy w punkcie. Wymagane a,d≠0, f_xy=f_yx.
- multivar-chain-gradient: f=k(ax+by+c)³+dxy, ∇f=(3ka(ax+by+c)²+dy,3kb(ax+by+c)²+dx); a,b,k≠0, bez zgadywania znaków.
- Każda rodzina: hard/advanced/expert × 24 warianty = 72; razem +144.
- Autorskie rozwiązania krokowe PL/EN, dokładne ułamki, bez specyficznych trybów uczelni.

## Bramka jakości
- [ ] Niezależna kontrola algebraiczna i numeryczna wszystkich 144 wariantów, pochodnych I/II i gradientów.
- [ ] Wszystkie testy Vitest PASS i TypeScript/build PASS na HEAD.
- [ ] Pełny Playwright Chromium PASS na 375/1280px, PL/EN.
- [ ] Recenzja matematyczna i techniczna PASS, brak nierozwiązanych uwag.
- [ ] Osobna zgoda właściciela na Squash and merge. Bez autoscalania.

Docelowo po merge: 188 rodzin i 15 429 wariantów. W01 nadal częściowe.
