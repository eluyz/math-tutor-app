import type { Locale } from "./locales/types";

export type SubjectId = "mathematics" | "statistics" | "econometrics" | "financial-mathematics";
export type PlannedSubjectId = Exclude<SubjectId, "mathematics">;
export type SubjectStatus = "available" | "in-progress" | "planned";

export const subjectOrder: readonly SubjectId[] = [
  "mathematics", "statistics", "econometrics", "financial-mathematics",
];

export const subjectStatus: Record<SubjectId, SubjectStatus> = {
  mathematics: "available",
  statistics: "in-progress",
  econometrics: "planned",
  "financial-mathematics": "planned",
};

type SubjectDetails = {
  label: string;
  title: string;
  description: string;
  topics: readonly string[];
  nextStep: string;
};

type RoadmapCopy = {
  navigation: string;
  eyebrow: string;
  status: Record<SubjectStatus, string>;
  topicsHeading: string;
  nextHeading: string;
  disclaimer: string;
  roadmapLink: string;
  subjects: Record<SubjectId, SubjectDetails>;
};

export const subjectCopy: Record<Locale, RoadmapCopy> = {
  pl: {
    navigation: "Działy Math Tutor",
    eyebrow: "OTWARTA MAPA ROZWOJU",
    status: { available: "Dostępne", "in-progress": "W rozwoju", planned: "Planowane" },
    topicsHeading: "Planowane zagadnienia",
    nextHeading: "Najbliższy krok",
    disclaimer: "Ten dział nie ma jeszcze opublikowanych zadań. Status oznacza etap planowania i rozwoju, a nie gotowy kurs. Matematyka pozostaje dostępna.",
    roadmapLink: "Zobacz plan rozwoju na GitHubie",
    subjects: {
      mathematics: { label: "Matematyka", title: "Matematyka", description: "Dostępne ćwiczenia.", topics: [], nextStep: "" },
      statistics: {
        label: "Statystyka i prawdopodobieństwo",
        title: "Statystyka i prawdopodobieństwo",
        description: "Pilotaż obejmuje wyłącznie średnią arytmetyczną z dokładnym sprawdzaniem odpowiedzi. Pozostałe lekcje nie są jeszcze udostępnione; to nie jest pełny kurs statystyki.",
        topics: ["Statystyka opisowa: średnia, mediana, wariancja", "Podstawy prawdopodobieństwa i kombinatoryka", "Rozkłady losowe i estymacja", "Przedziały ufności i testy hipotez"],
        nextStep: "Zweryfikować pilotaż średniej arytmetycznej przed osobną decyzją o kolejnych lekcjach.",
      },
      econometrics: {
        label: "Ekonometria",
        title: "Ekonometria",
        description: "Planowany moduł do nauki interpretacji modeli i obliczeń ekonometrycznych. Zostanie rozwinięty po wdrożeniu podstaw statystyki.",
        topics: ["Regresja liniowa i metoda najmniejszych kwadratów (OLS)", "Interpretacja parametrów i jakość dopasowania", "Podstawowa diagnostyka modeli", "Wprowadzenie do szeregów czasowych i prognozowania"],
        nextStep: "Ustalić zakres pierwszego modułu OLS po zatwierdzeniu fundamentów statystyki.",
      },
      "financial-mathematics": {
        label: "Matematyka finansowa",
        title: "Matematyka finansowa",
        description: "Planowany dział pokazujący zastosowania matematyki w finansach. Nie udostępniamy jeszcze ćwiczeń ani kalkulatorów.",
        topics: ["Procent prosty i składany", "Wartość pieniądza w czasie i dyskontowanie", "Renty i raty", "NPV i IRR — podstawy oceny projektów"],
        nextStep: "Przygotować specyfikację rodzin zadań i kryteria niezależnej weryfikacji obliczeń.",
      },
    },
  },
  en: {
    navigation: "Math Tutor subjects",
    eyebrow: "OPEN DEVELOPMENT ROADMAP",
    status: { available: "Available", "in-progress": "Work in progress", planned: "Planned" },
    topicsHeading: "Planned topics",
    nextHeading: "Next milestone",
    disclaimer: "No exercises have been released in this subject yet. The status describes planning and development, not an available course. Mathematics remains available.",
    roadmapLink: "View the public roadmap on GitHub",
    subjects: {
      mathematics: { label: "Mathematics", title: "Mathematics", description: "Practice exercises available now.", topics: [], nextStep: "" },
      statistics: {
        label: "Statistics & Probability",
        title: "Statistics & Probability",
        description: "This pilot covers arithmetic mean only, with exact answer checking. Other lessons are not available yet; this is not a complete statistics course.",
        topics: ["Descriptive statistics: mean, median and variance", "Probability basics and combinatorics", "Random variables, distributions and estimation", "Confidence intervals and hypothesis testing"],
        nextStep: "Review the arithmetic-mean pilot before separately approving further lessons.",
      },
      econometrics: {
        label: "Econometrics",
        title: "Econometrics",
        description: "A future module for learning model interpretation and econometric calculations, after the statistics foundations are available.",
        topics: ["Linear regression and ordinary least squares (OLS)", "Coefficient interpretation and model fit", "Basic model diagnostics", "Introduction to time series and forecasting"],
        nextStep: "Define the scope for a first OLS module after the statistics foundations pass review.",
      },
      "financial-mathematics": {
        label: "Financial Mathematics",
        title: "Financial Mathematics",
        description: "A planned subject for applied finance mathematics. No exercises or calculators are available in this section yet.",
        topics: ["Simple and compound interest", "Time value of money and discounting", "Annuities and loan payments", "NPV and IRR fundamentals"],
        nextStep: "Specify exercise families and independent numerical verification criteria.",
      },
    },
  },
};
