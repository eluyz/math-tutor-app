const pl = {
  title: "Moje postępy",
  learn: "Ćwiczenia",
  navigation: "Nawigacja aplikacji",
  back: "Wróć do nauki",
  privacy:
    "Dane są tylko na tym urządzeniu i w tej przeglądarce. Nie synchronizują się z innymi urządzeniami. Wyczyszczenie danych Safari lub innej przeglądarki może je usunąć. Nie możemy ich wtedy odzyskać.",
  temporary:
    "Zapisujemy tylko ukończone sesje. Aktywne zadanie, niedokończona sesja, odpowiedzi, brudnopis i język nie są zapisywane po odświeżeniu.",
  retention: (n: number) =>
    `Historia obejmuje maksymalnie ${n} ostatnich sesji; starsze są automatycznie usuwane.`,
  sessions: "Ukończone sesje",
  correct: "Samodzielne pierwsze poprawne odpowiedzi",
  incorrect: "Samodzielne pierwsze błędne odpowiedzi",
  viewed: "Rozwiązanie obejrzane przed oceną",
  skipped: "Pominięte bez ważnej oceny",
  shown: "Pokazane zadania",
  assessed: "Samodzielnie ocenione zadania",
  accuracy: "Poprawne spośród samodzielnie ocenionych",
  noAssessments: "Brak samodzielnych ocen — brak mianownika",
  insufficient: "Za mało danych: mniej niż 7 samodzielnie ocenionych zadań.",
  counting:
    "Liczy się pierwsza ważna ocena. Podgląd przed oceną nie jest samodzielną odpowiedzią, a pominięcie nie jest błędem. Późniejsze poprawki nie zmieniają wyniku. To historia ćwiczeń, nie ocena poziomu wiedzy.",
  filters: "Filtry historii",
  category: "Kategoria historii",
  difficulty: "Poziom historii",
  period: "Okres historii",
  allCategories: "Wszystkie kategorie",
  allLevels: "Wszystkie poziomy",
  allTime: "Cała historia",
  last30: "Ostatnie 30 dni",
  totals: "Podsumowanie wybranego zakresu",
  breakdown: "Według kategorii i poziomu",
  recent: "Ostatnie sesje",
  recentCount: (n: number, total: number) =>
    `Pokazano ${n} z ${total} sesji w wybranym zakresie.`,
  more: "Pokaż kolejne sesje",
  empty:
    "Nie ma jeszcze ukończonych sesji. Rozpocznij sesję 10 zadań, aby zapisać pierwszy wynik.",
  noMatches: "Brak sesji pasujących do filtrów.",
  export: "Eksportuj historię (.json)",
  exportHelp:
    "Eksport zawiera całą dostępną historię, niezależnie od filtrów. Import nie jest dostępny w tej wersji.",
  exportFailed:
    "Nie udało się przygotować eksportu. Historia nie została zmieniona.",
  delete: "Usuń historię",
  confirmTitle: "Usunąć całą historię?",
  confirmText:
    "Ta operacja usuwa zapisane sesje z tej przeglądarki oraz bieżącą historię w pamięci. Nie można jej cofnąć. Aktywne zadanie i brudnopis pozostaną. Możesz najpierw zapisać eksport JSON.",
  confirmDelete: "Tak, usuń historię",
  cancel: "Anuluj",
  deleted: "Historia została usunięta.",
  issues: {
    unavailable:
      "Nie można zapisać postępów w tej przeglądarce. Nauka działa dalej, a nowe wyniki pozostają w pamięci do odświeżenia. Możesz je wyeksportować do JSON. Sprawdź ustawienia prywatności lub wolne miejsce.",
    invalid:
      "Zapisana historia jest uszkodzona lub niezgodna ze schematem. Nie nadpisujemy jej. Nowe wyniki pozostają tylko w pamięci. Możesz je wyeksportować lub świadomie usunąć historię, aby zacząć od nowa.",
    unsupported:
      "Zapisana historia ma nieobsługiwaną wersję. Nie nadpisujemy jej. Nowe wyniki pozostają tylko w pamięci. Możesz je wyeksportować lub świadomie usunąć historię.",
    "delete-failed":
      "Nie udało się usunąć historii z przeglądarki. Dane nie zostały oznaczone jako usunięte. Sprawdź ustawienia przeglądarki i spróbuj ponownie.",
  },
};
const en: typeof pl = {
  title: "My progress",
  learn: "Exercises",
  navigation: "Application navigation",
  back: "Return to learning",
  privacy:
    "Data stays only on this device and in this browser. It does not sync with other devices. Clearing Safari or other browser data may remove it. We cannot recover it afterwards.",
  temporary:
    "Only completed sessions are saved. Your active exercise, unfinished session, answers, scratchpad and language are not kept after refreshing.",
  retention: (n) =>
    `History keeps at most ${n} recent sessions; older sessions are removed automatically.`,
  sessions: "Completed sessions",
  correct: "Independent first correct answers",
  incorrect: "Independent first incorrect answers",
  viewed: "Solution viewed before assessment",
  skipped: "Skipped without a valid assessment",
  shown: "Exercises shown",
  assessed: "Independently assessed exercises",
  accuracy: "Correct among independently assessed exercises",
  noAssessments: "No independent assessments — no denominator",
  insufficient:
    "Not enough data: fewer than 7 independently assessed exercises.",
  counting:
    "Only the first valid assessment counts. Viewing before assessment is not an independent answer, and skipping is not a mistake. Later corrections do not change the result. This is practice history, not a rating of knowledge.",
  filters: "History filters",
  category: "History category",
  difficulty: "History difficulty",
  period: "History period",
  allCategories: "All categories",
  allLevels: "All levels",
  allTime: "All history",
  last30: "Last 30 days",
  totals: "Summary of selected history",
  breakdown: "By category and difficulty",
  recent: "Recent sessions",
  recentCount: (n, total) =>
    `Showing ${n} of ${total} sessions in the selected history.`,
  more: "Show more sessions",
  empty:
    "No completed sessions yet. Start a session of 10 exercises to save your first result.",
  noMatches: "No sessions match these filters.",
  export: "Export history (.json)",
  exportHelp:
    "The export contains all available history, regardless of filters. Import is not available in this version.",
  exportFailed: "Could not prepare the export. History has not been changed.",
  delete: "Delete history",
  confirmTitle: "Delete all history?",
  confirmText:
    "This removes saved sessions from this browser and current history from memory. It cannot be undone. Your active exercise and scratchpad will remain. You can save a JSON export first.",
  confirmDelete: "Yes, delete history",
  cancel: "Cancel",
  deleted: "History has been deleted.",
  issues: {
    unavailable:
      "Progress cannot be saved in this browser. Learning still works, and new results stay in memory until you refresh. You can export them to JSON. Check privacy settings or available storage space.",
    invalid:
      "Saved history is damaged or does not match the schema. We will not overwrite it. New results stay only in memory. You can export them or deliberately delete history to start again.",
    unsupported:
      "Saved history has an unsupported version. We will not overwrite it. New results stay only in memory. You can export them or deliberately delete history.",
    "delete-failed":
      "History could not be removed from browser storage. Data has not been marked as deleted. Check browser settings and try again.",
  },
};
export const progressCopy = { pl, en };
