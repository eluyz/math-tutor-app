import type { Locale } from "./types";
import type { StatisticsTrack, StatisticsTopic } from "../statistics/curriculum";

const pl = {
  title: "ST-101 — Średnia arytmetyczna", medianTitle: "ST-102 — Mediana", varianceTitle: "ST-103 — Wariancja populacyjna",
  trackLabel: "Ścieżka nauki", topicLabel: "Temat",
  trackLabels: { fundamentals: "Podstawy statystyki", university: "Statystyka na studia" } satisfies Record<StatisticsTrack,string>,
  topicLabels: {
    "data-tables":"Dane i tabele", mean:"Średnia arytmetyczna", median:"Mediana", mode:"Dominanta",
    dispersion:"Miary rozproszenia", charts:"Wykresy i interpretacja", descriptive:"Statystyka opisowa",
    combinatorics:"Kombinatoryka", probability:"Rachunek prawdopodobieństwa", conditional:"Prawdopodobieństwo warunkowe",
    "random-variables":"Zmienne losowe", distributions:"Rozkłady prawdopodobieństwa", estimation:"Estymacja i przedziały ufności",
    "hypothesis-tests":"Testy hipotez", correlation:"Korelacja",
  } satisfies Record<StatisticsTopic,string>,
  levelsUnavailable: "Zaawansowany i Ekspert są jeszcze niedostępne. Wybierz jeden z trzech dostępnych poziomów lekcji.",
  topicsUnavailable: "Pozostałe planowane zagadnienia są jeszcze niedostępne, m.in. rozstęp, odchylenie standardowe i wzór Bayesa. W kategorii Miary rozproszenia można ćwiczyć wyłącznie wariancję populacyjną.",
  plannedTitle: "Planowane zagadnienia na studia",
  plannedGuidance: "Wybierz Podstawy statystyki, aby ćwiczyć średnią, medianę lub wariancję populacyjną.",
  universityPlan: "Zagadnienia na studia są planowane; w tej ścieżce nie ma jeszcze dostępnych zadań.",
  difficulty: "Poziom trudności", answer: "Twoja odpowiedź", check: "Sprawdź",
  next: "Następne zadanie", hint1: "Pokaż podpowiedź", hint2: "Pokaż drugą podpowiedź",
  hintsDone: "Obie podpowiedzi pokazane", show: "Pokaż rozwiązanie", hide: "Ukryj rozwiązanie",
  solution: "Rozwiązanie krok po kroku",
  format: "Podaj dokładny wynik: liczbę całkowitą, skończony zapis dziesiętny lub ułamek. Nie zaokrąglaj. Limit: 100 znaków.",
  discard: "Zmiana lekcji, ścieżki, poziomu lub zadania usunie bieżącą odpowiedź, podpowiedzi i rozwiązanie. Kontynuować?",
  memory: "Te ćwiczenia nie zapisują postępów i nie zmieniają wyników Matematyki. Podczas przełączania działów zachowujemy bieżące zadanie i odpowiedź. Odświeżenie lub zamknięcie strony je usuwa.",
};
export const statisticsPracticeCopy: Record<Locale, typeof pl> = {
  pl,
  en: {
    title: "ST-101 — Arithmetic mean", medianTitle: "ST-102 — Median", varianceTitle: "ST-103 — Population variance",
    trackLabel: "Learning track", topicLabel: "Topic",
    trackLabels: { fundamentals:"Statistics fundamentals", university:"University statistics" },
    topicLabels: {
      "data-tables":"Data & tables", mean:"Arithmetic mean", median:"Median", mode:"Mode",
      dispersion:"Measures of dispersion", charts:"Charts & interpretation", descriptive:"Descriptive statistics",
      combinatorics:"Combinatorics", probability:"Probability", conditional:"Conditional probability & Bayes",
      "random-variables":"Random variables", distributions:"Distributions", estimation:"Estimation & confidence intervals",
      "hypothesis-tests":"Hypothesis testing", correlation:"Correlation",
    },
    levelsUnavailable: "Advanced and Expert are not available yet. Choose one of the lesson's three available levels.",
    topicsUnavailable: "Other planned topics are not available yet, including range, standard deviation and Bayes' theorem. Under Measures of dispersion, only population variance is playable.",
    plannedTitle: "Planned university topics",
    plannedGuidance: "Choose Statistics fundamentals to practise mean, median or population variance.",
    universityPlan: "University topics are planned; no exercises are available in this track yet.",
    difficulty: "Difficulty", answer: "Your answer", check: "Check", next: "Next exercise",
    hint1: "Show hint", hint2: "Show second hint", hintsDone: "Both hints shown",
    show: "Show solution", hide: "Hide solution", solution: "Step-by-step solution",
    format: "Enter an exact result: an integer, a finite decimal or a fraction. Do not round. Limit: 100 characters.",
    discard: "Changing the lesson, track, level or exercise clears the current answer, hints and solution. Continue?",
    memory: "These exercises do not save progress or change Mathematics results. Switching subjects keeps the current task and answer. Refreshing or closing the page clears them.",
  },
};
