# MT-EDU-022 P2D-B — wykresy SVG podczas pełnego badania funkcji

## Stan bazowy
- Zatwierdzony Squash and merge PR #78, commit `main` `95b7f3a54584f047aec2cff694747d5a0cf0c5f1`; 178 rodzin / 14 709 wariantów.
- Kontrola pełnego CI na main po #78 i publikacji Pages jest osobnym zadaniem po scaIeniu; nie wyciągać wniosków o sukcesie przed zakończeniem run.
- Wprowadzamy wykresy do *istniejących* generatorów `analysis-study-quartic` i `analysis-study-rational-shift`, bez duplikatów i nowych wariantów.

## Problem użytkownika / decyzje
- Dotychczas ćwiczenia tylko opisywały kształt krzywej i znaki pochodnej. Wykres wspiera wzrokową kontrolę wyprowadzenia, ale pokazanie go **przed odpowiedzią** ułatwiłoby mechaniczne odczytanie części rozwiązań. Dlatego SVG jest widoczny **dopiero po kliknięciu „Pokaż rozwiązanie / Show solution”**, obok krokowego dowodu.
- Realne wykresy funkcji obliczane deterministycznie ze współczynników zadania, nie z gotowego obrazka ani generowanej ilustracji.
- Używamy lokalnych znormalizowanych współrzędnych `u=(x-a)/q`, `z=(f(x)-k)/scale` dla czytelności wielu wariantów. Linia `x=a` oraz `y=k` jest **linią odniesienia, niekoniecznie osią OX/OY**. Znaczniki x i współrzędne punktów stacjonarnych są podpisane prawdziwymi, dokładnymi wartościami.
- Dla kwartycznej trzy wyróżnione punkty i krzywa typu W/M z dwoma przegięciami. Dla wymiernej dwie odrębne gałęzie, asymptota pionowa x=a, przerywana ukośna y=m(x-a)+k oraz dwa stacjonarne punkty — nie łączymy gałęzi przez biegun.
- Tekstowy odpowiednik, tytuł i opis SVG oraz rozwijana lista punktów w obu językach, responsywność telefonu i desktopu, zero dodatkowych bibliotek.

## Kontrole
- [ ] Matematyczna weryfikacja wszystkich 144 geometrii na podstawie niezależnych wzorów, punktów i liczbowej dokładności.
- [ ] Pełne Vitest PASS.
- [ ] TypeScript + produkcyjny build PASS.
- [ ] Playwright PASS, PL/EN, mobile/desktop, ukrywanie przed ujawnieniem, poprawna liczba krzywych/punktów/asymptot.
- [ ] Końcowa recenzja kodu i dostępności, bez błędów.
- [ ] **Osobna nowa zgoda użytkownika na Squash and merge P2D-B**.

## Ograniczenia
- Nie ma ręcznego rysowania krzywej przez użytkownika ani automatycznej oceny takiego szkicu. Status D09 pozostaje **częściowo**, podobnie D05/D07/D08/D10. Brak zmian w `AnswerSpec` i historii postępów.
