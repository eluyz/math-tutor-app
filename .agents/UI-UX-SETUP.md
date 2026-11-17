# MT-UI-SETUP-002 — narzędzia UI/UX

Konfiguracja do przyszłych zadań, bez uruchamiania redesignu. Wszystkie skille
projektowe są zapisane w Git w `.agents/skills/`. Po pobraniu gałęzi uruchom
nową sesję Codex w katalogu repozytorium; nie trzeba ponawiać instalatorów.
Samo utworzenie Draft PR nie udostępnia ich na `main`.

## Stan instalacji

| Narzędzie | Instalacja i lokalizacja | Weryfikacja |
| --- | --- | --- |
| UI UX Pro Max | CLI 2.15.0, `.agents/skills/ui-ux-pro-max/` i sześć skilli towarzyszących; zachowane z PR #338 bez nadpisywania | Python: walidacja 12 domen/22 stosów; wykrycie przez Codex |
| Impeccable | skill 4.9.2, `.agents/skills/impeccable/`, oficjalna kopia dla Codex bez hooków | silnik 0.1.25: `engine-probe`, `--help`, `detect` na pliku kontrolnym, kod 0 |
| Vercel Web Design Guidelines | `.agents/skills/web-design-guidelines/`, CLI `skills@1.9.0` | wykrycie przez Codex, zgodność z repozytorium, pobranie aktualnych wytycznych |
| Taste Skill | 2.5.1, `.agents/skills/design-taste-frontend/`, CLI `skills@1.9.0`, usunięta deklaracja hooka | wykrycie przez Codex, `copy-lint` OK; `shoot` zablokowany przez sandbox Chromium |
| Superpowers | dostępny jako plugin hosta tej rozmowy; brak lokalnego pluginu w Codex CLI | skille `superpowers:*` w katalogu sesji; lokalne `codex plugin list` nie wykazało pluginów |

Wersje środowiska: Codex CLI 0.159.2, Node.js 24.19.0, npm 11.9.0,
Python 3.12.14, Chromium 154.0.8037.57. `ffmpeg` jest dostępny (opcjonalny dla
Taste). Node spełnia wymagania CLI skills (>=22.20) i Taste (>=22).

## Oficjalne źródła i wykonane kroki

Rewizje źródeł i hashe zainstalowanych plików: `ui-ux-sources.json`.
`skills-lock.json` przypina niezmodyfikowaną instalację Vercel; Taste jest
zarządzany bezpośrednio przez Git ze względu na udokumentowaną zmianę hooka.
Nie uruchamiaj automatycznego `skills update` ani ponownego `skills add` na
istniejących katalogach. Nowe wersje wymagają przeglądu i zachowania zmian lokalnych.

- [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill):
  aktualne npm nadal wskazuje CLI 2.15.0. Zachowano wcześniejszą instalację
  `npx --yes ui-ux-pro-max-cli init --ai codex`; szczegóły w `README.md`.
- [Impeccable](https://github.com/pbakaus/impeccable/blob/d41d9860b0094dcb68030657da63461212835aaa/README.md):
  oficjalna sekcja „Manual copy, no Node required” pozwala skopiować
  `.agents/skills/impeccable` z repozytorium do projektu. Tę metodę zastosowano.
  Nie kopiowano `.codex/hooks.json` ani konfiguracji pluginu. Launcher pobiera
  silnik z oficjalnego GitHub Release i weryfikuje SHA-256 względem dołączonego
  manifestu. Weryfikacja użyła `IMPECCABLE_HOME=/tmp/mt-ui-setup-002/impeccable-cache`.
- [Vercel Agent Skills](https://github.com/vercel-labs/agent-skills/blob/1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62/README.md):
  `npx --yes skills@1.9.0 add vercel-labs/agent-skills --skill web-design-guidelines --agent codex --copy --yes`.
- [Taste Skill](https://github.com/Leonxlnx/taste-skill/blob/f6b76575f949707b4e3c37cd86cb44b0b98643e8/README.md):
  `npx --yes skills@1.9.0 add Leonxlnx/taste-skill --skill design-taste-frontend --agent codex --copy --yes`.
  Po instalacji usunięto wyłącznie pole `hooks` z frontmatter `SKILL.md`.
  Nie kopiowano rejestracji hooków/pluginu z repozytorium źródłowego.
  Ręczne uruchamianie skryptów nadal podlega normalnym zatwierdzeniom.

Przed uruchomieniem CLI sprawdzono repozytorium
[vercel-labs/skills](https://github.com/vercel-labs/skills), metadane npm,
moduły instalatora i zależności (`tar`, `yaml`, `nostics`). Nie wymaga roota.
Użyto `npm_config_cache=/tmp/math-tutor-npm`, `npm_config_ignore_scripts=true`
i `DISABLE_TELEMETRY=1`; nie wykonywano npm lifecycle scripts ani zapytań
telemetrycznych/audytu CLI. Instalacja obejmuje kopie plików, nie symlinki do `/tmp`.

## Superpowers przez Codex Plugins

[Oficjalna instrukcja obra/superpowers](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/README.md#codex-app):

1. W aplikacji Codex otwórz **Plugins** na pasku bocznym.
2. W sekcji **Coding** znajdź **Superpowers** i kliknij **+**.
3. Dokończ instalację i rozpocznij nową sesję.

W Codex CLI: otwórz `/plugins`, wyszukaj `superpowers`, wybierz **Install Plugin**.
Korzystaj z oficjalnego marketplace OpenAI. Nie zastępuj pluginu skryptem,
kopiowaniem bootstrapu ani ręcznym podłączaniem hooków. Nie zatwierdzaj hooków
wykonujących polecenia poza standardowym mechanizmem zgód.

Dostępność skilli Superpowers w tej rozmowie nie potwierdza instalacji na
komputerze użytkownika ani w nowym kontenerze. Lokalny katalog pluginów jest
pusty; zapytanie CLI do zdalnego katalogu pluginów nie działa w tym środowisku.

## Weryfikacja i ograniczenia

- `codex debug prompt-input` z tymczasowym `CODEX_HOME` potwierdza projektowy
  korzeń skilli i wszystkie dziesięć nazw. Domyślny katalog Codex jest tylko
  do odczytu; tymczasowa konfiguracja służy wyłącznie sprawdzeniu wykrywania.
- `npx skills@1.9.0 list --agent codex --json` potwierdza lokalizacje projektowe.
- Vercel wymaga dostępu do sieci przy audycie: pobiera
  https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md
  przed każdym przeglądem. Sprawdzono pobranie (191 wierszy), bez audytu UI aplikacji.
- Impeccable: trwały jest skill i launcher, a silnik w `/tmp` jest cachem
  nietrwałym. Pierwsze użycie w nowym środowisku może wymagać pobrania silnika
  do zapisywalnego `IMPECCABLE_HOME` w ramach normalnych zatwierdzeń.
  Nie uruchamiano `init`, `doctor`, Live ani Apply. Live/Apply domyślnie może
  wywołać agenta z pominięciem zgód; obowiązuje reguła `AGENTS.md` o trybie `off`/`chat`.
- Taste: analiza tekstu na pliku kontrolnym w `/tmp` działa. `shoot` zwrócił
  `Chrome did not start`; bezpośredni test Chromium wykazał niepoprawną
  konfigurację pomocnika SUID sandbox oraz błąd crashpad w kontenerze.
  Nie wyłączano zabezpieczeń i nie zmieniano systemu. Weryfikację zrzutów
  należy powtórzyć na maszynie z poprawnie działającą przeglądarką.
- Licencje Impeccable i Taste znajdują się w `licenses/`; Taste zachowuje
  też dołączone opisy i atrybucje assetów. Repozytorium Vercel w sprawdzonej
  rewizji nie dostarcza pliku LICENSE — nie dopisano własnej licencji.
- Znane ograniczenia UI UX Pro Max (testy utrzymaniowe upstream i ścieżki
  Claude w części skilli towarzyszących) pozostają opisane w `README.md`.
- Kontrola aplikacji: `npm test` — 2603 testy w 202 plikach; `npm run build`
  — OK (ostrzeżenie o rozmiarze chunka); zestaw kontrolny
  `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium npm run test:e2e -- e2e/advanced-calculus.spec.ts`
  — 6/6 przypadków PL/EN przy 375/768/1280 px. Pełnego E2E nie uruchamiano
  w tym zadaniu; pozostaje obowiązkowy przed merge.
- Niezależny przegląd konfiguracji nie znalazł problemów. Nowa dokumentacja
  przechodzi sprawdzenie białych znaków; oryginalne pliki upstream zachowują
  własne formatowanie (pełny `git diff --check` zgłasza ich białe znaki).

Nie zmieniono aplikacji ani bibliotek React, generatorów lub testów matematycznych.
PR #337 pozostaje poza zakresem: bez edycji, zamykania i merge.
