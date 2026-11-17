# UI UX Pro Max w Codex

Instalacja projektowa: `.agents/skills/ui-ux-pro-max/SKILL.md`.
Codex wykrywa skille z `.agents/skills/` przy rozpoczęciu sesji w repozytorium.
Po pobraniu tej gałęzi uruchom nową sesję Codex; skill można wskazać jawnie
jako `$ui-ux-pro-max` przy zadaniu dotyczącym UI/UX.

## Źródło i instalacja

- Repozytorium: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
- Sprawdzona instrukcja: [README](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/blob/e59ff376a41f7ca47b7541ad5c116495cbade3ee/README.md#installation).
- Zainstalowany pakiet npm: `ui-ux-pro-max-cli@2.15.0`.
- Wykonano w katalogu głównym projektu:

  ```bash
  npm_config_cache=/tmp/math-tutor-npm npx --yes ui-ux-pro-max-cli init --ai codex
  ```

Wersję można odtworzyć poleceniem:

```bash
npx --yes ui-ux-pro-max-cli@2.15.0 init --ai codex
```

Instalator tej wersji domyślnie dostarcza również sześć skilli towarzyszących:
`banner-design`, `brand`, `design`, `design-system`, `slides`, `ui-styling`.
Zachowano pliki wygenerowane przez instalator. Licencja głównego projektu
znajduje się w `LICENSE.ui-ux-pro-max`; zachowano też licencję dołączoną do
`ui-styling`.

## Wymagania

- Do uruchomienia instalatora: Node.js z npm/npx. Pakiet nie deklaruje własnego
  `engines`; sprawdzono Node.js 24.19.0 i npm 11.9.0.
- Do wyszukiwania UI UX Pro Max: Python 3, tylko biblioteka standardowa.
  Sprawdzono Python 3.12.14. Wyszukiwanie działa lokalnie, bez instalacji pip.
- Instalacja jest zapisana w Git i nie wymaga ponownego uruchamiania npx
  w kolejnych sesjach. Narzędzia opcjonalnych skilli towarzyszących mogą mieć
  dodatkowe wymagania opisane w ich plikach; nie instalowano ich zależności.

Nie dodano zależności do `package.json` ani zmian w kodzie aplikacji.
Zalecenia skilli podlegają poleceniom użytkownika i zasadom `AGENTS.md`.

## Sprawdzenie

W katalogu głównym repozytorium:

```bash
PYTHONDONTWRITEBYTECODE=1 python3 .agents/skills/ui-ux-pro-max/scripts/validate_data.py
PYTHONDONTWRITEBYTECODE=1 python3 .agents/skills/ui-ux-pro-max/scripts/search.py "education accessibility" --domain ux --json
PYTHONDONTWRITEBYTECODE=1 python3 .agents/skills/ui-ux-pro-max/scripts/search.py "forms accessibility" --stack react --json
PYTHONDONTWRITEBYTECODE=1 python3 .agents/skills/ui-ux-pro-max/scripts/search.py "education learning" --design-system -p "Math Tutor"
```

Walidacja danych oraz oba wyszukiwania i generowanie rekomendacji przeszły.
Ostatnie polecenie wypisuje rekomendację; bez `--persist` nie zapisuje projektu
systemu wizualnego ani nie modyfikuje aplikacji.

W Codex CLI 0.159.2 polecenie `codex debug prompt-input` potwierdziło obecność
wszystkich siedmiu skilli w katalogu dostępnym dla modelu, w tym nazwy
`ui-ux-pro-max` oraz odwołania do jego `SKILL.md`. W środowisku chmurowym
użyto tymczasowego `CODEX_HOME` poza repozytorium, ponieważ domyślny katalog
konfiguracji jest tylko do odczytu. Bieżąca sesja nie przeładowuje automatycznie
swojej początkowej listy skilli; do korzystania z instalacji rozpocznij nową.

## Ograniczenia pakietu upstream

- Część instrukcji skilli towarzyszących nadal odwołuje się do `.claude/skills/`
  lub `~/.claude/skills/` i do dodatkowych skilli, np. `ai-artist`,
  `ai-multimodal`, `chrome-devtools`, których instalator nie dostarcza.
  Przed korzystaniem z takich poleceń trzeba dostosować ścieżki do tej
  instalacji i sprawdzić dostępność wymaganych narzędzi. Główny skill
  `ui-ux-pro-max` ma poprawne ścieżki `.agents/skills/`.
- Dodatkowo uruchomiono `python3 -m unittest discover -s
  .agents/skills/ui-ux-pro-max/scripts/tests -p 'test_*.py'` z
  `PYTHONDONTWRITEBYTECODE=1`: 130 testów przeszło, a dwa moduły nie zostały
  zaimportowane (`test_catalog_refresh`, `test_relevance_evaluator`).
  Wymagają skryptów utrzymaniowych repozytorium autora:
  `scripts/refresh-google-fonts.py`, `scripts/refresh-icon-catalog.py`
  i `scripts/evaluate-relevance.py`, których pakiet instalacyjny nie zawiera.
  Pełny zestaw testów upstream wymaga jego checkoutu; nie jest to wymaganie
  uruchomienia wyszukiwarki. Zachowano oryginalne pliki pakietu.
