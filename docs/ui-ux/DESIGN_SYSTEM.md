# MT-UI-001 — design system

[Zobacz dwie koncepcje wizualne](screenshots/concepts.png) · [wersja HTML](CONCEPTS.html).

## Dwie koncepcje

| Kierunek | Charakter | Zalety | Koszt / kompromis |
| --- | --- | --- | --- |
| Focus Studio (rekomendowany) | Białe powierzchnie, chłodne szarości, szmaragd, systemowy sans-serif | Szybkie skanowanie katalogu, spokojna praca z zadaniami, dobra gęstość | Mniej redakcyjnego charakteru |
| Editorial Academy | Papierowe tło, atrament i terakota, szeryfowe nagłówki | Ciepły, książkowy charakter | Szeryfowe nazwy w gęstym katalogu skanuje się wolniej |

Wybór projektanta: Focus Studio. Użytkownik upoważnił do wyboru rekomendacji i implementacji ograniczonego prototypu. Akceptacja dotyczyć będzie prototypu przed rozszerzeniem na pozostałe ekrany.

## Tokeny i reguły

- Tło #f5f7f8, powierzchnia #ffffff, tekst #172b35, tekst pomocniczy #52636d.
- Akcent #17634b, stan wybrany #e8f3ed, obramowanie kontrolek #7d8d96.
- Focus #245ec7, obrys 3 px z odsunięciem 3 px; nie zasłania go przyklejony nagłówek.
- Systemowy sans-serif bez pobierania fontów. Treść 16 px / 1.6; nagłówki 24–44 px; wzory Georgia/Cambria Math z zachowaniem istniejącego renderowania.
- Siatka odstępów 4/8/12/16/24/32/48 px. Kontener maks. 1280 px; boczne marginesy 16 px mobile, 32 px desktop.
- Promienie 8 px kontrolki, 16 px główne karty; pojedynczy subtelny cień. Bez gradientów.
- Przyciski min. 44 px, odstępy 8 px; na mobile równe kolumny z zawijaniem tekstu. Wybór wskazany także wagą tekstu i obramowaniem, semantycznie aria-pressed/current.
- Symbole matematyczne i strzałki pozostają proste i dekoracyjne; bez nowej biblioteki ikon.
- Katalog i ekran ćwiczenia: jedna kolumna na telefonie, dwie od 900 px. Długie wzory/tabele mogą przewijać się we własnych regionach, nigdy cały dokument.
- Redesign ograniczony do nagłówka, nawigacji i workspace nauki. Wspólny renderer ćwiczeń otrzymuje styl, więc obejmuje także inne rodziny bez zmian ich treści i logiki. Statystyka, roadmapy, postępy, egzamin, scratchpad i rozwiązania zachowują swoje komponenty i style szczegółowe. Wspólna czcionka bazowa, tło oraz szerokość/marginesy shell wpływają również na ich otoczenie. Wspólna nawigacja obejmuje wszystkie cztery przedmioty, bez zmiany statusów.

## Dostępność

Cel WCAG 2.2 AA w zakresie zmienianego interfejsu: kontrast tekstu min. 4.5:1, kontrolek 3:1, widoczny focus, etykiety, klawiatura, skip link, reflow i obsługa ograniczenia ruchu. Nie jest to deklaracja certyfikacji całej aplikacji. Natywne przyciski i istniejące komunikaty statusu pozostają podstawą interakcji.

## Źródła i sposób wykorzystania

Nie znaleziono lokalnych skilli UI UX Pro Max / Impeccable / Vercel. Niczego nie instalowano i nie uruchamiano obcych skryptów.

- [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/blob/main/.claude/skills/ui-ux-pro-max/SKILL.md): priorytet dostępności, dotyku, responsywności i semantycznych tokenów; wykorzystano publiczną dokumentację, bez generatora.
- [Impeccable](https://github.com/pbakaus/impeccable): ograniczony zakres, krytyka hierarchii, typografia, odporność na długie treści; bez instalatora i hooków.
- [Vercel Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines/blob/main/command.md): skip link, focus, reduced motion, etykiety, reflow.
- [Mobbin](https://mobbin.com): publiczna strona prezentuje wzorce ekranów i całych przepływów; odniesienie do konsekwentnej hierarchii i nawigacji. Nie korzystano z płatnej biblioteki ani nie kopiowano ekranów.
- Khan Academy / Brilliant: ogólna inspiracja koncentracją na nauce; bez kopiowania identyfikacji.

## Kontrola kontrastu tokenów

Obliczenie luminancji względnej sRGB: tekst na bieli 14,65:1; tekst pomocniczy na tle aplikacji 5,81:1; akcent na bieli 7,18:1; akcent na tle wybranego stanu 6,32:1; focus na bieli 6,00:1; obrys kontrolki na bieli 3,43:1. To kontrola wskazanych par tokenów, nie automatyczny audyt wszystkich stanów całej aplikacji.


## MT-UI-003 — dopracowanie Focus Studio

Aktywne zadanie poprzedza konfigurację w DOM i w układzie mobilnym. Szybki start
przy tytule kieruje focus do treści zadania, bez natychmiastowego otwierania
klawiatury. Natywny panel wyboru tematu/poziomu jest zwijany, domyślnie otwarty
ze względu na odkrywalność. Pozostała lista rodzin jest drugorzędna względem zadania.

Wspólne klasy nauki i tokeny obejmują teraz także pilotaż Statystyki; szczegółowe
style postępów i egzaminu zostały dopasowane bez zmiany ich modeli. Liczniki i
stany egzaminu odróżniają wpisaną odpowiedź od pustej, nigdy poprawność przed oddaniem.
Formularze są powiązane z trwałym regionem feedback; błędy nie polegają tylko na kolorze.

Logo i zmiana widoku zachowują pracę w pamięci. Zmiana zadania ostrzega, gdy
zastępuje niewysłaną odpowiedź lub notatki objęte auto-clear. Odświeżenie nadal
usuwa pracę po świadomej zgodzie na natywny komunikat przeglądarki. Bez nowego magazynu danych.

Stopka: muted na tle daje obliczeniowo 5,81:1. Długie wzory mają lokalny scroll;
nowe screenshoty i faktyczne zachowanie 320–1440/PL–EN wymagają weryfikacji w
przeglądarce z działającym sandboxem. Nie uznajemy starszych zrzutów za dowód
obecnego wyglądu. Szczegółowe wyniki: MT_UI_003_NIGHT_LOG.md.
