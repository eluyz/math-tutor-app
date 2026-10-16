import type {
  CategoryId,
  ErrorRule,
  Exercise,
  FeedbackCopy,
} from "../exercises";
import { rational as r } from "../rational";

export const categories: { id: CategoryId; label: string }[] = [
  { id: "order", label: "Kolejność działań" },
  { id: "signed", label: "Liczby dodatnie i ujemne" },
  { id: "fractions", label: "Ułamki" },
  { id: "algebra", label: "Podstawy algebry" },
  { id: "equations", label: "Równania liniowe" },
];

export const studyCategories: { id: CategoryId; label: string }[] = [
  { id: "quadratics", label: "Wzory i równania kwadratowe" },
  { id: "matrices", label: "Macierze" },
  { id: "determinants", label: "Wyznaczniki" },
];

export const answerHints = {
  scalar: "Możesz wpisać liczbę, ułamek a/b lub równoważną wartość dziesiętną.",
  list: "Uzupełnij każde opisane pole. Możesz użyć liczb całkowitych lub dokładnych ułamków a/b.",
  matrix: "Wpisz wszystkie elementy macierzy, wiersz po wierszu. Dopuszczalne są liczby całkowite i dokładne ułamki a/b.",
  choice: "Wybierz jedną z podanych odpowiedzi.",
  roots: "Wybierz liczbę pierwiastków. Jeśli istnieją, wpisz dokładne wartości (także ułamki a/b), bez zaokrąglania.",
} as const;

export const ui = {
  start: "Rozpocznij ćwiczenia",
  answer: "Twoja odpowiedź",
  answerPlaceholder: "Wpisz liczbę lub ułamek",
  check: "Sprawdź",
  correct: "Brawo!",
  incorrect: "Spróbuj jeszcze raz",
  invalid: "Sprawdź odpowiedź",
  completed: "Ukończone",
  open: "Otwórz",
  next: "Następne zadanie",
  newExample: "Nowy przykład",
  nextExample: "Następny przykład",
  moreHint: "Pokaż kolejną podpowiedź",
  step: "Sprawdź pierwszy krok",
} as const;

export const difficultyLabels = {
  easy: "Łatwy", medium: "Średni", hard: "Trudny",
} as const;

export const sessionCopy = {
  complete: "Sesja zakończona!",
  shown: "Pokazane zadania",
  correct: "Poprawne za pierwszą ważną próbą",
  incorrect: "Wymagały poprawy po pierwszej ważnej próbie",
  skipped: "Pominięte bez ważnej oceny",
  counting: "Liczymy tylko pierwszą ważną ocenę każdego zadania. Puste i nieprawidłowe zapisy nie są ważną próbą. Późniejsze poprawki i podpowiedzi nie zmieniają pierwszej oceny.",
  caveat: "To prosty wskaźnik z jednej sesji, nie diagnoza umiejętności. Ty decydujesz o poziomie kolejnej sesji.",
  insufficient: "Za mało danych do sugestii poziomu",
  minimum: "Sugestia wymaga ważnej oceny co najmniej 7 z 10 zadań. Możesz powtórzyć sesję na obecnym poziomie lub wybrać poziom ręcznie.",
  suggested: "Sugerowany poziom",
  accept: "Rozpocznij kolejną sesję na sugerowanym poziomie",
  repeat: "Rozpocznij sesję na obecnym poziomie",
  practice: "Ćwicz dalej",
} as const;

export const feedback: FeedbackCopy = {
  empty: "Wpisz odpowiedź przed sprawdzeniem.",
  invalidNumber: "Wpisz jedną liczbę lub ułamek w formacie a/b.",
  divisionByZero: "Mianownik nie może być zerem.",
  tooLong: "Odpowiedź jest zbyt długa. Wpisz krótszą liczbę lub ułamek.",
  invalidStructure: "Uzupełnij wszystkie pola odpowiedzi w podanym układzie.",
  invalidChoice: "Wybierz jedną z podanych odpowiedzi.",
  correctPrefix: "Dobrze!",
  incorrectPrefix:
    "Ta odpowiedź jest matematycznie niepoprawna. Spróbuj ponownie.",
  stepCorrectPrefix:
    "Ten krok jest poprawny. Nie ustala to przyczyny wcześniejszej odpowiedzi.",
  stepIncorrectPrefix:
    "Ten krok wymaga poprawy. Nie ustala to przyczyny wcześniejszej odpowiedzi.",
  undeterminedExplanation:
    "Nieustalona przyczyna. Na podstawie tego wyniku nie potrafimy wskazać konkretnej pomyłki.",
  undeterminedHint:
    "Wróć do pierwszego działania i sprawdź obliczenia po kolei.",
};

function rule(
  errorCode: string,
  category: CategoryId,
  wrongAnswer: ReturnType<typeof r>,
  explanation: string,
  hint: string,
): ErrorRule {
  return {
    errorCode,
    category,
    confidence: "low",
    wrongAnswer,
    explanation,
    hint,
  };
}

export const exercises: Exercise[] = [
  {
    id: "order",
    category: "order",
    title: "Najpierw mnożenie",
    question: "3 + 4 × 2 = ?",
    answer: r(11),
    explanation: "Najpierw 4 × 2 = 8. Następnie 3 + 8 = 11.",
    hint: "Sprawdź, które działanie ma pierwszeństwo.",
    nextHint: "Oblicz osobno 4 × 2, a potem dodaj 3.",
    errorRules: [
      rule(
        "ORDER_LEFT_TO_RIGHT",
        "order",
        r(14),
        "Możliwe, że obliczono od lewej do prawej: (3 + 4) × 2.",
        "Mnożenie ma pierwszeństwo przed dodawaniem.",
      ),
    ],
    step: {
      question: "Ile wynosi 4 × 2?",
      answer: r(8),
      correctHint: "Teraz dodaj 3 do wyniku mnożenia.",
      incorrectHint: "Zapisz 4 × 2 jako 4 + 4 i policz jeszcze raz.",
    },
  },
  {
    id: "order-parentheses",
    category: "order",
    title: "Nawias ma pierwszeństwo",
    question: "(6 + 2) × 3 = ?",
    answer: r(24),
    explanation: "Najpierw 6 + 2 = 8, następnie 8 × 3 = 24.",
    hint: "Zacznij od działania w nawiasie.",
    nextHint: "Po obliczeniu nawiasu pomnóż jego wynik przez 3.",
    errorRules: [
      rule(
        "ORDER_IGNORED_PARENTHESES",
        "order",
        r(12),
        "Możliwe, że pominięto nawias i obliczono 6 + 2 × 3.",
        "Nawias zmienia kolejność działań: wykonaj go jako pierwszy.",
      ),
    ],
  },
  {
    id: "order-subtraction",
    category: "order",
    title: "Mnożenie przed odejmowaniem",
    question: "18 − 2 × 5 = ?",
    answer: r(8),
    explanation: "Najpierw 2 × 5 = 10, potem 18 − 10 = 8.",
    hint: "Najpierw znajdź iloczyn.",
    nextHint: "Odejmij wynik 2 × 5 od 18.",
    errorRules: [
      rule(
        "ORDER_SUBTRACTION_FIRST",
        "order",
        r(80),
        "Możliwe, że najpierw obliczono 18 − 2, a wynik pomnożono przez 5.",
        "Mnożenie wykonaj przed odejmowaniem.",
      ),
    ],
  },
  {
    id: "negative",
    category: "signed",
    title: "Przejście przez zero",
    question: "−7 + 12 = ?",
    answer: r(5),
    explanation:
      "Od −7 do zera jest 7 kroków. Z pozostałych 5 kroków otrzymujemy wynik 5.",
    hint: "Od −7 przesuń się o 12 miejsc w prawo na osi liczbowej.",
    nextHint: "Najpierw policz, ile kroków potrzeba, aby dojść do zera.",
    errorRules: [
      rule(
        "SIGNED_WRONG_DIRECTION",
        "signed",
        r(-19),
        "Możliwe, że dodanie dodatniej liczby przesunęło wynik w lewo zamiast w prawo.",
        "Dodawanie 12 zwiększa wartość liczby.",
      ),
      rule(
        "SIGNED_ADDED_MAGNITUDES",
        "signed",
        r(19),
        "Możliwe, że dodano wartości bezwzględne 7 i 12.",
        "Przy różnych znakach odejmij mniejszą wartość bezwzględną od większej.",
      ),
    ],
    step: {
      question: "Ile kroków dzieli −7 od zera?",
      answer: r(7),
      correctHint: "Z 12 kroków część prowadzi do zera; policz, ile pozostaje.",
      incorrectHint: "Na osi liczbowej policz po kolei: −6, −5, aż do zera.",
    },
  },
  {
    id: "signed-subtract",
    category: "signed",
    title: "Odejmowanie liczby ujemnej",
    question: "6 − (−4) = ?",
    answer: r(10),
    explanation:
      "Odejmowanie −4 jest dodawaniem 4, więc 6 − (−4) = 6 + 4 = 10.",
    hint: "Zastanów się, co oznacza odjąć liczbę ujemną.",
    nextHint: "Zapisz 6 − (−4) jako dodawanie liczby dodatniej.",
    errorRules: [
      rule(
        "SIGNED_DOUBLE_MINUS",
        "signed",
        r(2),
        "Możliwe, że potraktowano −(−4) tak samo jak −4.",
        "Dwa minusy w tym zapisie zmieniają się w plus.",
      ),
    ],
  },
  {
    id: "signed-product",
    category: "signed",
    title: "Iloczyn dwóch liczb ujemnych",
    question: "(−3) × (−5) = ?",
    answer: r(15),
    explanation: "Iloczyn dwóch liczb ujemnych jest dodatni, a 3 × 5 = 15.",
    hint: "Najpierw ustal znak iloczynu.",
    nextHint: "Dwa czynniki ujemne dają wynik dodatni; oblicz 3 × 5.",
    errorRules: [
      rule(
        "SIGNED_PRODUCT_SIGN",
        "signed",
        r(-15),
        "Możliwe, że wynikowi nadano znak ujemny mimo dwóch ujemnych czynników.",
        "Iloczyn dwóch liczb ujemnych jest dodatni.",
      ),
    ],
  },
  {
    id: "fraction-add",
    category: "fractions",
    title: "Dodawanie ułamków",
    question: "1/2 + 1/4 = ?",
    answer: r(3, 4),
    explanation: "1/2 to 2/4. Zatem 2/4 + 1/4 = 3/4.",
    hint: "Sprowadź ułamki do wspólnego mianownika.",
    nextHint: "Zamień 1/2 na ćwiartki, a potem dodaj liczniki.",
    errorRules: [
      rule(
        "FRACTION_ADD_DENOMINATORS",
        "fractions",
        r(1, 3),
        "Możliwe, że dodano osobno liczniki i mianowniki: 2/6.",
        "Przy dodawaniu ułamków mianownik musi być wspólny.",
      ),
    ],
    step: {
      question: "Ile ćwiartek mieści się w 1/2?",
      answer: r(2),
      correctHint: "Teraz dodaj jeszcze jedną ćwiartkę.",
      incorrectHint:
        "Podziel całość na cztery równe części i policz, ile z nich stanowi połowę.",
    },
  },
  {
    id: "fraction-subtract",
    category: "fractions",
    title: "Odejmowanie ułamków",
    question: "5/6 − 1/3 = ?",
    answer: r(1, 2),
    explanation: "1/3 to 2/6, więc 5/6 − 2/6 = 3/6 = 1/2.",
    hint: "Zamień 1/3 na szóstki.",
    nextHint: "Odejmij liczniki przy mianowniku 6, a wynik skróć.",
    errorRules: [
      rule(
        "FRACTION_SUBTRACT_DENOMINATORS",
        "fractions",
        r(4, 3),
        "Możliwe, że odjęto osobno liczniki i mianowniki: (5 − 1)/(6 − 3).",
        "Przed odejmowaniem sprowadź ułamki do wspólnego mianownika.",
      ),
    ],
  },
  {
    id: "fraction-multiply",
    category: "fractions",
    title: "Mnożenie ułamków",
    question: "2/3 × 3/4 = ?",
    answer: r(1, 2),
    explanation: "Pomnóż liczniki i mianowniki: (2 × 3)/(3 × 4) = 6/12 = 1/2.",
    hint: "Pomnóż licznik przez licznik i mianownik przez mianownik.",
    nextHint: "Po pomnożeniu skróć otrzymany ułamek.",
    errorRules: [
      rule(
        "FRACTION_ADDED_INSTEAD",
        "fractions",
        r(5, 7),
        "Możliwe, że dodano liczniki i mianowniki zamiast je pomnożyć.",
        "W tym zadaniu wykonujesz mnożenie, nie dodawanie.",
      ),
    ],
  },
  {
    id: "algebra-distribute",
    category: "algebra",
    title: "Nawias w wyrażeniu",
    question: "Oblicz 3(x + 2) dla x = 4.",
    answer: r(18),
    explanation: "Po podstawieniu x = 4 mamy 3(4 + 2) = 3 × 6 = 18.",
    hint: "Podstaw wartość x, a potem oblicz nawias.",
    nextHint: "Cały nawias pomnóż przez 3.",
    errorRules: [
      rule(
        "ALGEBRA_PARTIAL_DISTRIBUTION",
        "algebra",
        r(14),
        "Możliwe, że pomnożono przez 3 tylko x, otrzymując 3x + 2.",
        "Mnożnik przed nawiasem dotyczy całej jego zawartości.",
      ),
    ],
  },
  {
    id: "algebra-like-terms",
    category: "algebra",
    title: "Jednomiany podobne",
    question: "Oblicz 2x + 3x dla x = 2.",
    answer: r(10),
    explanation: "2x + 3x = 5x. Po podstawieniu x = 2 otrzymujemy 5 × 2 = 10.",
    hint: "Najpierw połącz jednomiany podobne.",
    nextHint: "Po dodaniu współczynników podstaw x = 2.",
    errorRules: [
      rule(
        "ALGEBRA_FORGOT_SUBSTITUTION",
        "algebra",
        r(5),
        "Możliwe, że dodano współczynniki 2 + 3, lecz nie podstawiono x = 2.",
        "Po uproszczeniu wyrażenia trzeba jeszcze obliczyć jego wartość.",
      ),
    ],
  },
  {
    id: "algebra-substitute",
    category: "algebra",
    title: "Podstawianie do wyrażenia",
    question: "Oblicz x² + 2x dla x = 3.",
    answer: r(15),
    explanation: "x² = 3 × 3 = 9, a 2x = 2 × 3 = 6. Suma 9 + 6 = 15.",
    hint: "Oblicz osobno x² oraz 2x.",
    nextHint:
      "x² oznacza x pomnożone przez x, a 2x oznacza 2 pomnożone przez x.",
    errorRules: [
      rule(
        "ALGEBRA_SQUARE_AS_DOUBLE",
        "algebra",
        r(12),
        "Możliwe, że x² policzono jako 2x, dając 6 + 6.",
        "Kwadrat liczby 3 to 3 × 3.",
      ),
      rule(
        "ALGEBRA_COEFFICIENT_IGNORED",
        "algebra",
        r(12),
        "Możliwe, że w składniku 2x pominięto współczynnik 2, dając 9 + 3.",
        "W 2x pomnóż 2 przez wartość x.",
      ),
      rule(
        "ALGEBRA_MISSING_X",
        "algebra",
        r(11),
        "Możliwe, że 2x odczytano jako samo 2.",
        "Podstaw x = 3 w obu składnikach.",
      ),
    ],
    step: {
      question: "Ile wynosi x² dla x = 3?",
      answer: r(9),
      correctHint: "Teraz policz osobno 2x dla x = 3.",
      incorrectHint: "x² to 3 × 3; nie należy mylić go z 2 × 3.",
    },
  },
  {
    id: "algebra",
    category: "equations",
    title: "Znajdź niewiadomą",
    question: "2x + 3 = 11. Ile wynosi x?",
    answer: r(4),
    explanation:
      "2x + 3 = 11, więc 2x = 8. Po podzieleniu obu stron przez 2 otrzymujemy x = 4.",
    hint: "Odejmij 3 od obu stron równania.",
    nextHint: "Gdy zostanie 2x, podziel obie strony przez 2.",
    errorRules: [
      rule(
        "EQUATION_STOPPED_AT_2X",
        "equations",
        r(8),
        "Możliwe, że zakończono na wartości 2x zamiast obliczyć x.",
        "Po odjęciu 3 podziel obie strony równania przez 2.",
      ),
    ],
    step: {
      question: "Ile wynosi 11 − 3?",
      answer: r(8),
      correctHint: "To wartość 2x. Zastanów się, ile wynosi jedno x.",
      incorrectHint:
        "Odejmij 3 od 11, zachowując tę samą operację po obu stronach równania.",
    },
  },
  {
    id: "equation-minus",
    category: "equations",
    title: "Równanie z odejmowaniem",
    question: "3x − 5 = 10. Ile wynosi x?",
    answer: r(5),
    explanation: "Dodaj 5 do obu stron: 3x = 15. Podziel przez 3: x = 5.",
    hint: "Dodaj 5 do obu stron równania.",
    nextHint: "Po wyznaczeniu 3x podziel obie strony przez 3.",
    errorRules: [
      rule(
        "EQUATION_STOPPED_AT_3X",
        "equations",
        r(15),
        "Możliwe, że zatrzymano się na 3x = 15.",
        "Aby znaleźć x, podziel jeszcze przez 3.",
      ),
      rule(
        "EQUATION_WRONG_INVERSE",
        "equations",
        r(5, 3),
        "Możliwe, że odjęto 5 zamiast je dodać przed podzieleniem przez 3.",
        "Operacją odwrotną do odjęcia 5 jest dodanie 5.",
      ),
    ],
  },
  {
    id: "equation-half",
    category: "equations",
    title: "Równanie z połową x",
    question: "x/2 + 4 = 7. Ile wynosi x?",
    answer: r(6),
    explanation: "Odejmij 4 od obu stron: x/2 = 3. Pomnóż przez 2: x = 6.",
    hint: "Najpierw odejmij 4 od obu stron.",
    nextHint: "Gdy zostanie x/2, pomnóż obie strony przez 2.",
    errorRules: [
      rule(
        "EQUATION_STOPPED_AT_HALF_X",
        "equations",
        r(3),
        "Możliwe, że zatrzymano się na x/2 = 3.",
        "Aby znaleźć x, pomnóż przez 2.",
      ),
      rule(
        "EQUATION_DIVIDED_AGAIN",
        "equations",
        r(3, 2),
        "Możliwe, że po uzyskaniu x/2 = 3 ponownie podzielono przez 2.",
        "Operacją odwrotną do dzielenia przez 2 jest mnożenie przez 2.",
      ),
    ],
  },
];
