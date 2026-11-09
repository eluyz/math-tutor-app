# G06 — integracja do katalogu po I04, W02 i M06

2026-11-09. Izolowany PR #235 (24 warianty) został scalony do main pod SHA `982960b5fe256564c05a741942c0335a91401d9c` i ma **full main CI + Pages PASS**. Po scaleniu I04 #239, W02 #248 oraz M06 #251 bieżąca baza wynosi `main@7f2cd91ec916ac595ca86d05d22aa66eeb60a2d4`. PR #244 jest nadal osobnym kandydatem integracji.

## Funkcje

- `analysis-euler-function-infinity` = +1 rodzina / +24 warianty tylko hard, granice Eulera przy x→+∞, dwie formy podstawy, e oraz π, szczegółowy dowód z logarytmem, autorskie zadania PL/EN i wielokrotny wybór dokładnej postaci.
- `EulerInfinityProblem` w unii `UniversityProblem`, wyszukiwanie kompetencji G06 nadal `partial`, priorytet prezentera przed ogólnym `isElementaryAnalysis`.
- 24/24 niezależnych porównań matematycznych, 24×2 testów logicznych oceniania, browser PL/EN × 375/1280 px: wyszukanie, odpowiedź pusta/błędna/poprawna, rozwiązanie.
- Wcześniejsze 96 historycznych przypadków x→0 pozostają bez zmian; I04, W02 i M06 oraz ich testy/inventory zachowane.

## Liczniki

| Miara | Main przed G06 | G06 candidate |
| --- | ---: | ---: |
| Rodziny | 242 | 243 |
| Rodziny poza całkami | 220 | 221 |
| Warianty | 18 501 | 18 525 |
| Warianty poza całkami | 16 917 | 16 941 |

## Warunki końcowe

1. Po kolejnym scaleniu integracji do main zawsze odbudować konfliktujące liczniki, wykonać świeży CI na nowym SHA i upewnić się, że żadne z poprzednich ćwiczeń nie zostało nadpisane.
2. Scalić PR #244 jedynie przy pełnym PASS unit, build, Playwright i Batch B–G na aktualnym SHA i po weryfikacji zgodności bazy main.
3. Po scałeniu osobno potwierdzić CI i Pages na identycznym SHA.
4. Prywatne cztery oryginalne zadania P26/3a–d: `SOURCE_FORM_MATCH 4/4` metodą logarytmiczną. To nie jest formalny `SOURCE_PASS` ani dosłowna transkrypcja. Nie publikować treści prywatnych zadań ani ich kluczy.
