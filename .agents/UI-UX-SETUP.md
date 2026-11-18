# MT-UI-SETUP-003 — projektowe narzędzia UI/UX

Konfiguracja do przyszłych zadań, bez uruchamiania redesignu. Skille są zapisane
w Git w `.agents/skills/`. Po pobraniu gałęzi uruchom nową sesję Codex w katalogu
repozytorium. Nie trzeba ponawiać instalatorów. Draft PR nie udostępnia skilli
na `main` do czasu osobnej decyzji o scaleniu.

## Stan instalacji

| Narzędzie | Instalacja i lokalizacja | Weryfikacja |
| --- | --- | --- |
| UI UX Pro Max | CLI 2.15.0, `.agents/skills/ui-ux-pro-max/` oraz sześć skilli towarzyszących | niezmienione pliki z #338; walidacja 12 domen/22 stosów, wyszukiwanie UX/React i rekomendacje |
| Impeccable | skill 4.9.2, `.agents/skills/impeccable/`, oficjalna kopia Codex bez hooków | niezmieniony pakiet; silnik 0.1.25, `engine-probe` i lokalny `detect` |
| Vercel Web Design Guidelines | `.agents/skills/web-design-guidelines/`, CLI `skills@1.9.0` | niezmieniony pakiet, pobranie aktualnych wytycznych |
| Taste Skill | opcjonalny, usunięty w MT-UI-SETUP-003 | nie jest wykrywany; ponowna instalacja wymaga osobnego zadania |
| Superpowers | dostępny w hoście rozmowy, brak lokalnego pluginu CLI | instrukcja instalacji przez Codex Plugins poniżej |

Środowisko instalacji: Codex CLI 0.159.2, Node.js 24.19.0, npm 11.9.0,
Python 3.12.14. Python 3 z biblioteką standardową wystarcza do UI UX Pro Max.
Silnik Impeccable jest samodzielnym plikiem wykonywalnym, bez zależności npm/pip.

## Optymalizacja i kompletność

Taste stanowił 1631 plików i 36 599 882 bajty, w tym lokalne zdjęcia, ikony,
referencje i narzędzia. Żaden z zachowanych skilli nie wymaga jego plików.
W UI UX Pro Max pozostał komentarz o inspiracji Taste; nie jest importem ani
zależnością uruchomieniową. Usunięto cały opcjonalny skill, jego licencję i wpis
manifestu. Taste już wcześniej nie należał do `skills-lock.json`.

| Pomiar | Przed (04fb91f) | Po optymalizacji |
| --- | ---: | ---: |
| Pliki w różnicy PR względem bazy main | 1881 | 249 |
| Dodane / usunięte linie w różnicy PR | +239808 / −0 | +110689 / −0 |
| Pliki w `.agents/skills/` | 1873 | 242 |
| Zasoby skilli — suma rozmiarów plików Git | 43 189 462 B | 6 589 580 B |

Oszczędność zasobów skilli: 84,7%. To rozmiary logiczne plików, nie rozmiar
skompresowanych obiektów `.git`. Usunięcie w nowym commicie zmniejsza bieżący
snapshot i różnicę PR; duże zasoby pozostają w poprzednim commicie gałęzi.
Nie przepisywano historii. Jeśli celem jest również niedodawanie tych zasobów
do historii `main`, przy późniejszym, ręcznym scalaniu wybierz squash merge.

Zachowano bajt w bajt wszystkie pliki pozostałych skilli, w tym dane CSV/JSON,
metadane licencji, skrypty, testy, fixtures, referencje i szablony. Dane są
używane przez wyszukiwarkę/rekomendacje UI UX Pro Max; Impeccable korzysta z
referencji, metadanych poleceń, indeksu fontów, VERSION i manifestu checksum.
Nie przycinano plików na podstawie samego rozszerzenia czy nazwy. Pakiet
Vercel zawiera jeden `SKILL.md` i pobiera reguły audytu z sieci.

PR #339 w pełni zawiera instalację z PR #338: wszystkie 174 pliki tego PR
zachowano bez zmian. Rekomendacja: zamknąć #338 jako zastąpiony przez #339,
gdy właściciel potwierdzi tę konsolidację. Nie zamykano ani nie zmieniano #338.

## Źródła, aktualizacje i trwałość

Rewizje źródeł i hashe: `ui-ux-sources.json`. `skills-lock.json` przypina Vercel.
Nie aktualizuj ani nie nadpisuj istniejących skilli bez przeglądu źródeł.

- [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill):
  zachowana instalacja CLI 2.15.0; polecenie i ograniczenia w `README.md`.
- [Impeccable](https://github.com/pbakaus/impeccable/blob/d41d9860b0094dcb68030657da63461212835aaa/README.md):
  oficjalna metoda „Manual copy, no Node required”, kopia `.agents/skills/impeccable`.
  Nie kopiowano `.codex/hooks.json` ani konfiguracji pluginu. Launcher sprawdza
  SHA-256 pobranego silnika względem dołączonego manifestu.
- [Vercel Agent Skills](https://github.com/vercel-labs/agent-skills/blob/1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62/README.md):
  `npx --yes skills@1.9.0 add vercel-labs/agent-skills --skill web-design-guidelines --agent codex --copy --yes`.

Przed instalacją CLI sprawdzono źródło `vercel-labs/skills`, zależności
`tar`, `yaml`, `nostics` i uprawnienia. Użyto `npm_config_ignore_scripts=true`,
`DISABLE_TELEMETRY=1` i cache `/tmp/math-tutor-npm`. Nie instalowano globalnie.
Kopie w repozytorium nie zależą od symlinków do `/tmp`.

Licencja Impeccable jest w `licenses/impeccable.LICENSE`; licencje UI UX Pro Max
zachowano w pierwotnych lokalizacjach. Sprawdzona rewizja Vercel nie dostarcza
pliku LICENSE — nie dopisano własnej licencji.

## Weryfikacja MT-UI-SETUP-003

- Uruchomiono nowy proces Codex app-server, `thread/start` z `ephemeral: true`,
  trybem read-only i katalogiem projektu, następnie `skills/list` z
  `forceReload: true`. Wykryto 9 projektowych skilli, bez błędów, bez Taste.
  Dodatkowo nowy `codex debug prompt-input` potwierdza katalog skilli w kontekście.
  Nie wykonywano tury modelu, zmian UI ani hooków. Test używa tymczasowego
  `CODEX_HOME`, ponieważ domyślny katalog konfiguracji jest tylko do odczytu.
- Hashe wszystkich 9 zachowanych skilli zgadzają się z manifestem sprzed
  optymalizacji. Skrypty użytkowe UI UX Pro Max i Impeccable działają.
- Bieżący wynik CI sprawdzaj na konkretnym head PR #339 w zakładce Checks;
  opis PR podaje sprawdzony SHA i link. Status wcześniejszego commitu nie
  stanowi wyniku dla nowego head. Oczekującego CI nie traktuj jako zaliczonego.
- W MT-UI-SETUP-002 zaliczono 2603 testy, build i 6 kontrolnych E2E przy
  375/768/1280 px w PL/EN. Optymalizacja nie zmienia aplikacji ani tych testów;
  pełny zestaw wymagany przed merge wykonuje workflow CI.
- Nowa dokumentacja przechodzi diff whitespace check. Nie formatowano
  zachowanych plików upstream; ich istniejące białe znaki pozostają bez zmian.

Impeccable ma trwały launcher, lecz cache silnika w `/tmp` jest nietrwały.
Nowe środowisko może wymagać pobrania silnika do zapisywalnego `IMPECCABLE_HOME`
w ramach normalnych zgód. Vercel przy każdym audycie potrzebuje sieci do
https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md.
Impeccable Live/Apply wymaga trybu `IMPECCABLE_LIVE_COPY_AGENT=off` lub `chat`
zgodnie z `AGENTS.md`; nie uruchamiano trybu omijającego zatwierdzenia ani hooków.

## Superpowers przez Codex Plugins

[Oficjalna instrukcja](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/README.md#codex-app):
w aplikacji Codex otwórz **Plugins**, znajdź **Superpowers** w **Coding**, kliknij
**+** i rozpocznij nową sesję. W CLI: `/plugins` → `superpowers` → **Install Plugin**.
Nie zastępuj pluginu skryptem/bootstrapem ani ręczną konfiguracją hooków.
Dostępność w hoście rozmowy nie dowodzi lokalnej instalacji na komputerze
użytkownika. W tym kontenerze CLI nie może odpytać zdalnego katalogu pluginów.

Nie zmieniono aplikacji, bibliotek React, generatorów ani testów matematycznych.
PR #337 pozostaje poza zakresem: bez edycji, zamykania i merge.
