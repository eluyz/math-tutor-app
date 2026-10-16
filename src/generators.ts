import type { CategoryId, ErrorRule, Exercise, TypedExercise } from "./exercises";
import { educationPool, educationTemplates } from "./education/catalog";
import {
  addRational,
  equalRational,
  multiplyRational,
  rational as r,
  subtractRational,
  type Rational,
} from "./rational";

export type Difficulty = "easy" | "medium" | "hard";
export const difficulties: Difficulty[] = ["easy", "medium", "hard"];
export type Parameters = Readonly<Record<string, number>>;
export type GeneratedExercise = Exercise & {
  templateId: string;
  parameters: Parameters;
  contentKey: string;
  difficulty: Difficulty;
};
export type GeneratedTask = GeneratedExercise | (TypedExercise & Omit<GeneratedExercise, keyof Exercise>);
type Details = Omit<Exercise, "id" | "category" | "title">;
export type Template = {
  id: string;
  category: CategoryId;
  title: string;
  parameterSets: Record<Difficulty, Record<string, readonly number[]>>;
  create: (parameters: Parameters) => Details;
};

const number = (value: number) => String(value).replace("-", "−");
const value = (fraction: Rational) =>
  fraction.denominator === 1n
    ? fraction.numerator.toString().replace("-", "−")
    : `${fraction.numerator.toString().replace("-", "−")}/${fraction.denominator}`;

function possible(
  category: CategoryId,
  errorCode: string,
  wrongAnswer: Rational,
  answer: Rational,
  explanation: string,
  hint: string,
): ErrorRule[] {
  if (equalRational(wrongAnswer, answer)) return [];
  return [{
    errorCode, category, confidence: "low", wrongAnswer,
    explanation: `Możliwe, że ${explanation}`,
    hint,
  }];
}

const sets = (
  easy: Record<string, number[]>,
  medium: Record<string, number[]>,
  hard: Record<string, number[]>,
) => ({ easy, medium, hard });

/** A family owns its ranges, mathematical construction and teaching copy. */
export const templates: Template[] = [
  {
    id: "order-add-product", category: "order", title: "Najpierw mnożenie",
    parameterSets: sets(
      { a: [2, 3, 4], b: [2, 3, 4], c: [2, 3, 4] },
      { a: [5, 7, 9], b: [3, 4, 6], c: [3, 5, 7] },
      { a: [11, 13, 17], b: [4, 7, 9], c: [6, 8, 11] },
    ),
    create: ({ a, b, c }) => {
      const answer = r(a + b * c);
      return {
        question: `${a} + ${b} × ${c} = ?`, answer,
        explanation: `Najpierw ${b} × ${c} = ${b * c}, potem ${a} + ${b * c} = ${a + b * c}.`,
        hint: "Mnożenie ma pierwszeństwo przed dodawaniem.",
        nextHint: `Oblicz osobno ${b} × ${c}, a następnie dodaj ${a}.`,
        errorRules: possible("order", "ORDER_LEFT_TO_RIGHT", r((a + b) * c), answer,
          `obliczono od lewej: (${a} + ${b}) × ${c}.`, "Najpierw wykonaj mnożenie."),
        step: {
          question: `Ile wynosi ${b} × ${c}?`, answer: r(b * c),
          correctHint: `Teraz dodaj ${a} do wyniku mnożenia.`,
          incorrectHint: `Policz ${b} grup po ${c} elementów.`,
        },
      };
    },
  },
  {
    id: "order-subtract-product", category: "order", title: "Mnożenie przed odejmowaniem",
    parameterSets: sets(
      { a: [14, 16, 18], b: [2, 3], c: [2, 3] },
      { a: [25, 28, 31], b: [3, 4], c: [4, 5] },
      { a: [21, 27, 34], b: [5, 6, 7], c: [5, 7] },
    ),
    create: ({ a, b, c }) => {
      const answer = r(a - b * c);
      return {
        question: `${a} − ${b} × ${c} = ?`, answer,
        explanation: `Najpierw ${b} × ${c} = ${b * c}, potem ${a} − ${b * c} = ${number(a - b * c)}.`,
        hint: "Odejmowanie poczeka, aż obliczysz iloczyn.",
        nextHint: `Odejmij wynik ${b} × ${c} od ${a}.`,
        errorRules: possible("order", "ORDER_SUBTRACTION_FIRST", r((a - b) * c), answer,
          `najpierw odjęto ${b} od ${a}, a wynik pomnożono przez ${c}.`,
          "Wykonaj mnożenie przed odejmowaniem."),
      };
    },
  },
  {
    id: "order-parentheses", category: "order", title: "Nawias ma pierwszeństwo",
    parameterSets: sets(
      { a: [3, 4, 5], b: [2, 3], c: [2, 3] },
      { a: [7, 8, 9], b: [3, 4], c: [4, 5] },
      { a: [11, 13, 15], b: [5, 7], c: [6, 8] },
    ),
    create: ({ a, b, c }) => {
      const answer = r((a + b) * c);
      return {
        question: `(${a} + ${b}) × ${c} = ?`, answer,
        explanation: `Najpierw ${a} + ${b} = ${a + b}, potem ${a + b} × ${c} = ${(a + b) * c}.`,
        hint: "Zacznij od działania w nawiasie.",
        nextHint: `Wynik ${a} + ${b} pomnóż przez ${c}.`,
        errorRules: possible("order", "ORDER_IGNORED_PARENTHESES", r(a + b * c), answer,
          "pominięto nawias i pomnożono przed dodaniem.", "Oblicz nawias jako pierwszy."),
      };
    },
  },
  {
    id: "signed-add", category: "signed", title: "Dodawanie różnych znaków",
    parameterSets: sets(
      { a: [2, 3, 4], b: [5, 6, 7] },
      { a: [7, 8, 9], b: [3, 4, 5] },
      { a: [12, 15, 18], b: [7, 9, 11] },
    ),
    create: ({ a, b }) => {
      const answer = r(b - a);
      return {
        question: `−${a} + ${b} = ?`, answer,
        explanation: `Porównaj ${a} i ${b}; ${b} − ${a} = ${number(b - a)}. Znak wyniku odpowiada liczbie o większej wartości bezwzględnej.`,
        hint: "Różne znaki oznaczają odejmowanie wartości bezwzględnych.",
        nextHint: `Oblicz różnicę ${Math.max(a, b)} − ${Math.min(a, b)} i wybierz znak składnika o większej wartości bezwzględnej.`,
        errorRules: [
          ...possible("signed", "SIGNED_ADDED_MAGNITUDES", r(a + b), answer,
            "dodano wartości bezwzględne mimo różnych znaków.", "Odejmij wartości bezwzględne."),
          ...possible("signed", "SIGNED_WRONG_DIRECTION", r(-a - b), answer,
            "dodanie dodatniej liczby przesunęło wynik w lewo.", "Dodawanie liczby dodatniej przesuwa w prawo."),
        ],
        step: {
          question: `Jaka jest różnica wartości bezwzględnych ${a} i ${b}?`,
          answer: r(Math.abs(a - b)),
          correctHint: "Teraz określ znak na podstawie liczby o większej wartości bezwzględnej.",
          incorrectHint: `Odejmij ${Math.min(a, b)} od ${Math.max(a, b)}.`,
        },
      };
    },
  },
  {
    id: "signed-subtract-negative", category: "signed", title: "Odejmowanie liczby ujemnej",
    parameterSets: sets(
      { a: [2, 3, 4], b: [2, 3, 4] },
      { a: [-4, -3, -2], b: [5, 6, 7] },
      { a: [-12, -9, -7], b: [4, 8, 11] },
    ),
    create: ({ a, b }) => {
      const answer = r(a + b);
      return {
        question: `${number(a)} − (−${b}) = ?`, answer,
        explanation: `Odjąć −${b} znaczy dodać ${b}: ${number(a)} + ${b} = ${number(a + b)}.`,
        hint: "Odejmowanie liczby ujemnej zamień na dodawanie.",
        nextHint: `Oblicz ${number(a)} + ${b}.`,
        errorRules: possible("signed", "SIGNED_DOUBLE_MINUS", r(a - b), answer,
          "odjęto dodatnie b zamiast liczby ujemnej.", "Dwa minusy w tym zapisie dają plus."),
      };
    },
  },
  {
    id: "signed-product", category: "signed", title: "Mnożenie liczb ze znakami",
    parameterSets: sets(
      { a: [2, 3, 4], b: [2, 3, 4], c: [1] },
      { a: [4, 5, 6], b: [3, 4, 5], c: [-1] },
      { a: [5, 7, 9], b: [4, 6, 8], c: [-2] },
    ),
    create: ({ a, b, c }) => {
      const answer = r(-a * b * c);
      const question = c === 1 ? `(−${a}) × ${b} = ?` : `(−${a}) × ${b} × (${number(c)}) = ?`;
      return {
        question, answer,
        explanation: c === 1
          ? `Ujemna razy dodatnia jest ujemna: −${a} × ${b} = ${number(-a * b)}.`
          : `Najpierw −${a} × ${b} = ${number(-a * b)}, potem ${number(-a * b)} × (${number(c)}) = ${number(-a * b * c)}.`,
        hint: "Najpierw ustal znak iloczynu.",
        nextHint: c === 1 ? `Pomnóż ${a} przez ${b} i dodaj znak minus.` : `Policz −${a} × ${b}, a potem pomnóż przez ${number(c)}.`,
        errorRules: possible("signed", "SIGNED_PRODUCT_SIGN", r(a * b * c), answer,
          "pomyłkowo odwrócono znak iloczynu.", "Policz liczbę ujemnych czynników."),
      };
    },
  },
  {
    id: "fraction-add", category: "fractions", title: "Dodawanie ułamków",
    parameterSets: sets(
      { p: [1, 2], q: [1, 2], a: [3, 4], b: [3, 4] },
      { p: [1, 2], q: [1, 2], a: [3, 4], b: [6, 8] },
      { p: [2, 3], q: [1, 2], a: [5, 7], b: [4, 6] },
    ),
    create: ({ p, q, a, b }) => {
      const answer = addRational(r(p, a), r(q, b));
      return {
        question: `${p}/${a} + ${q}/${b} = ?`, answer,
        explanation: `Sprowadź do mianownika ${a * b}: ${p}/${a} = ${p * b}/${a * b}, ${q}/${b} = ${q * a}/${a * b}. Suma to ${p * b + q * a}/${a * b} = ${value(answer)}.`,
        hint: "Sprowadź ułamki do wspólnego mianownika.",
        nextHint: `Mianownik ${a * b} jest wspólny dla obu ułamków.`,
        errorRules: possible("fractions", "FRACTION_ADD_DENOMINATORS", r(p + q, a + b), answer,
          "dodano osobno liczniki i mianowniki.", "Przy dodawaniu potrzebny jest wspólny mianownik."),
        step: {
          question: `Jaki licznik ma ${p}/${a} po rozszerzeniu do mianownika ${a * b}?`,
          answer: r(p * b),
          correctHint: `Podobnie przelicz ${q}/${b}, potem dodaj liczniki.`,
          incorrectHint: `Pomnóż licznik ${p} i mianownik ${a} przez ${b}.`,
        },
      };
    },
  },
  {
    id: "fraction-subtract", category: "fractions", title: "Odejmowanie ułamków",
    parameterSets: sets(
      { p: [2, 3], q: [1], a: [3, 4], b: [3, 4] },
      { p: [2, 3], q: [1, 2], a: [4, 5], b: [6, 8] },
      { p: [1, 2], q: [2, 3], a: [5, 7], b: [4, 6] },
    ),
    create: ({ p, q, a, b }) => {
      const answer = subtractRational(r(p, a), r(q, b));
      return {
        question: `${p}/${a} − ${q}/${b} = ?`, answer,
        explanation: `Przy mianowniku ${a * b} odejmij liczniki: ${p * b} − ${q * a} = ${number(p * b - q * a)}. Wynik to ${value(answer)}.`,
        hint: "Sprowadź ułamki do wspólnego mianownika.",
        nextHint: `Użyj mianownika ${a * b}, potem odejmij liczniki.`,
        errorRules: a === b ? [] : possible("fractions", "FRACTION_SUBTRACT_DENOMINATORS", r(p - q, a - b), answer,
          "odjęto osobno liczniki i mianowniki.", "Najpierw ustal wspólny mianownik."),
      };
    },
  },
  {
    id: "fraction-product", category: "fractions", title: "Mnożenie ułamków",
    parameterSets: sets(
      { p: [1, 2], q: [1, 2], a: [3, 4], b: [3, 4] },
      { p: [2, 3], q: [2, 3], a: [4, 5], b: [5, 6] },
      { p: [3, 4], q: [2, 3], a: [5, 7], b: [6, 8] },
    ),
    create: ({ p, q, a, b }) => {
      const answer = multiplyRational(r(p, a), r(q, b));
      return {
        question: `${p}/${a} × ${q}/${b} = ?`, answer,
        explanation: `Pomnóż liczniki i mianowniki: (${p} × ${q})/(${a} × ${b}) = ${p * q}/${a * b} = ${value(answer)}.`,
        hint: "Licznik mnożysz przez licznik, mianownik przez mianownik.",
        nextHint: `Oblicz ${p} × ${q} i ${a} × ${b}, następnie skróć ułamek.`,
        errorRules: possible("fractions", "FRACTION_ADDED_INSTEAD", addRational(r(p, a), r(q, b)), answer,
          "dodano ułamki zamiast je pomnożyć.", "Przy mnożeniu nie potrzebujesz wspólnego mianownika."),
      };
    },
  },
  {
    id: "algebra-substitute", category: "algebra", title: "Podstawianie do wyrażenia",
    parameterSets: sets(
      { x: [2, 3, 4], k: [2, 3] },
      { x: [4, 5, 6], k: [2, 3, 4] },
      { x: [-4, -3, -2], k: [2, 3, 4] },
    ),
    create: ({ x, k }) => {
      const answer = r(x * x + k * x);
      return {
        question: `Oblicz x² + ${k}x dla x = ${number(x)}.`, answer,
        explanation: `x² = (${number(x)}) × (${number(x)}) = ${x * x}; ${k}x = ${k} × (${number(x)}) = ${number(k * x)}. Suma wynosi ${number(x * x + k * x)}.`,
        hint: "Oblicz osobno kwadrat i iloczyn.",
        nextHint: "Kwadrat x oznacza x pomnożone przez x, także dla liczb ujemnych.",
        errorRules: [
          ...possible("algebra", "ALGEBRA_SQUARE_AS_DOUBLE", r(2 * x + k * x), answer,
            "x² zastąpiono 2x.", "Kwadrat to x razy x."),
          ...possible("algebra", "ALGEBRA_COEFFICIENT_IGNORED", r(x * x + x), answer,
            `pominięto współczynnik ${k} przy x.`, "Pomnóż współczynnik przez x."),
        ],
        step: {
          question: `Ile wynosi x² dla x = ${number(x)}?`, answer: r(x * x),
          correctHint: `Teraz policz osobno ${k}x dla x = ${number(x)}.`,
          incorrectHint: `Pomnóż ${number(x)} przez ${number(x)}.`,
        },
      };
    },
  },
  {
    id: "algebra-like-terms", category: "algebra", title: "Jednomiany podobne",
    parameterSets: sets(
      { a: [2, 3, 4], b: [2, 3], x: [2, 3] },
      { a: [5, 6, 7], b: [3, 4], x: [3, 4] },
      { a: [7, 9, 11], b: [4, 6], x: [-3, -2] },
    ),
    create: ({ a, b, x }) => {
      const answer = r((a + b) * x);
      return {
        question: `Oblicz ${a}x + ${b}x dla x = ${number(x)}.`, answer,
        explanation: `${a}x + ${b}x = (${a} + ${b})x = ${a + b}x. Po podstawieniu x = ${number(x)} otrzymasz ${number((a + b) * x)}.`,
        hint: "Połącz składniki z tą samą literą.",
        nextHint: `Dodaj współczynniki ${a} i ${b}, potem pomnóż przez x.`,
        errorRules: possible("algebra", "ALGEBRA_FORGOT_SUBSTITUTION", r(a + b), answer,
          "dodano współczynniki, lecz nie podstawiono x.", "Po uproszczeniu oblicz wartość dla podanego x."),
      };
    },
  },
  {
    id: "algebra-distribute", category: "algebra", title: "Mnożenie przez nawias",
    parameterSets: sets(
      { a: [2, 3, 4], b: [1, 2, 3], x: [2, 3] },
      { a: [3, 4, 5], b: [3, 4], x: [4, 5] },
      { a: [4, 6, 7], b: [3, 5], x: [-3, -2] },
    ),
    create: ({ a, b, x }) => {
      const answer = r(a * (x + b));
      return {
        question: `Oblicz ${a}(x + ${b}) dla x = ${number(x)}.`, answer,
        explanation: `W nawiasie ${number(x)} + ${b} = ${number(x + b)}. Pomnóż przez ${a}: ${a} × (${number(x + b)}) = ${number(a * (x + b))}.`,
        hint: "Zacznij od podstawienia wartości x do nawiasu.",
        nextHint: `Pomnóż wynik nawiasu przez ${a}; możesz też rozdzielić mnożenie na oba składniki.`,
        errorRules: possible("algebra", "ALGEBRA_PARTIAL_DISTRIBUTION", r(a * x + b), answer,
          `pomnożono tylko x przez ${a}, pomijając drugi składnik nawiasu.`,
          "Mnożnik dotyczy całego nawiasu."),
      };
    },
  },
  {
    id: "equation-add", category: "equations", title: "Równanie z dodawaniem",
    parameterSets: sets(
      { a: [2, 3, 4], b: [2, 3], x: [2, 3, 4] },
      { a: [3, 4, 5], b: [5, 7], x: [4, 5, 6] },
      { a: [4, 6, 7], b: [8, 11], x: [-3, -2, 7] },
    ),
    create: ({ a, b, x }) => {
      const c = a * x + b;
      const answer = r(x);
      return {
        question: `Rozwiąż ${a}x + ${b} = ${number(c)}.`, answer,
        explanation: `Odejmij ${b}: ${a}x = ${number(c - b)}. Podziel przez ${a}: x = ${number(x)}.`,
        hint: `Najpierw odejmij ${b} od obu stron.`,
        nextHint: `Podziel otrzymane ${a}x przez ${a}.`,
        errorRules: possible("equations", "EQUATION_STOPPED_AT_AX", r(c - b), answer,
          `zatrzymano się na wartości ${a}x.`, `Na końcu podziel przez ${a}.`),
        step: {
          question: `Ile wynosi ${a}x po odjęciu ${b} od obu stron?`,
          answer: r(c - b), correctHint: `Teraz podziel przez ${a}.`,
          incorrectHint: `Oblicz ${number(c)} − ${b}.`,
        },
      };
    },
  },
  {
    id: "equation-subtract", category: "equations", title: "Równanie z odejmowaniem",
    parameterSets: sets(
      { a: [2, 3, 4], b: [2, 3], x: [3, 4, 5] },
      { a: [3, 4, 5], b: [6, 8], x: [4, 5, 6] },
      { a: [5, 7, 9], b: [8, 11], x: [-3, -2, 7] },
    ),
    create: ({ a, b, x }) => {
      const c = a * x - b;
      const answer = r(x);
      return {
        question: `Rozwiąż ${a}x − ${b} = ${number(c)}.`, answer,
        explanation: `Dodaj ${b}: ${a}x = ${number(c + b)}. Podziel przez ${a}: x = ${number(x)}.`,
        hint: `Dodaj ${b} do obu stron.`,
        nextHint: `Po uzyskaniu ${a}x podziel przez ${a}.`,
        errorRules: possible("equations", "EQUATION_STOPPED_AT_AX", r(c + b), answer,
          `zatrzymano się na wartości ${a}x.`, `Podziel obie strony przez ${a}.`),
      };
    },
  },
  {
    id: "equation-fraction", category: "equations", title: "Równanie z ułamkiem",
    parameterSets: sets(
      { a: [2, 3, 4], b: [1, 2], k: [2, 3, 4], offset: [0] },
      { a: [3, 4, 5], b: [2, 3], k: [3, 4], offset: [1] },
      { a: [4, 5, 7], b: [-3, -2], k: [-4, -3, 4], offset: [1, 2] },
    ),
    create: ({ a, b, k, offset }) => {
      const x = a * k + offset;
      const c = addRational(r(x, a), r(b));
      const quotient = r(x, a);
      const answer = r(x);
      const bText = b < 0 ? `− ${number(-b)}` : `+ ${b}`;
      return {
        question: `Rozwiąż x/${a} ${bText} = ${value(c)}.`, answer,
        explanation: `Po przeniesieniu ${number(b)} otrzymasz x/${a} = ${value(quotient)}. Pomnóż obie strony przez ${a}: x = ${number(x)}.`,
        hint: `Najpierw odizoluj x/${a}.`,
        nextHint: `Odejmij ${number(b)} od prawej strony, następnie pomnóż przez ${a}.`,
        errorRules: possible("equations", "EQUATION_STOPPED_AT_QUOTIENT", quotient, answer,
          `zatrzymano się na wartości x/${a}.`, `Pomnóż obie strony przez ${a}.`),
        step: {
          question: `Ile wynosi x/${a} po odizolowaniu?`, answer: quotient,
          correctHint: `Pomnóż ten wynik przez ${a}.`,
          incorrectHint: `Odejmij ${number(b)} od ${value(c)}.`,
        },
      };
    },
  },
];

export const allTemplates = [...templates, ...educationTemplates];

function combinations(choices: Record<string, readonly number[]>): Parameters[] {
  return Object.entries(choices).reduce<Parameters[]>(
    (acc, [key, values]) => acc.flatMap((previous) =>
      values.map((selected) => ({ ...previous, [key]: selected }))),
    [{}],
  );
}

export function makeInstance(template: Template, parameters: Parameters, difficulty: Difficulty): GeneratedExercise {
  const choices = template.parameterSets[difficulty];
  if (!choices || Object.keys(parameters).length !== Object.keys(choices).length ||
      Object.entries(choices).some(([name, allowed]) => !allowed.includes(parameters[name])))
    throw new Error(`Invalid parameters for ${template.id}/${difficulty}`);
  const details = template.create(parameters);
  const contentKey = details.question.replace(/\s+/g, " ").trim();
  return {
    ...details, id: `${template.id}:${JSON.stringify(parameters)}`,
    templateId: template.id, parameters: { ...parameters }, contentKey,
    difficulty, category: template.category, title: template.title,
  };
}

const cache = new Map<string, GeneratedExercise[]>();
export function pool(category: CategoryId, difficulty: Difficulty): readonly GeneratedExercise[] {
  const key = `${category}:${difficulty}`;
  if (!cache.has(key)) {
    const unique = new Map<string, GeneratedExercise>();
    for (const template of templates.filter((item) => item.category === category))
      for (const parameters of combinations(template.parameterSets[difficulty])) {
        const instance = makeInstance(template, parameters, difficulty);
        if (!unique.has(instance.contentKey)) unique.set(instance.contentKey, instance);
      }
    cache.set(key, [...unique.values()]);
  }
  return cache.get(key)!;
}

/** xorshift32: reproducible within a browser session, not cryptographic. */
export function seededRandom(seed: number): () => number {
  let state = seed >>> 0 || 0x9e3779b9;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 0x100000000;
  };
}

export function createGenerator(seed: number = Date.now()) {
  const random = seededRandom(seed);
  const seen = new Set<string>();
  return {
    next(category: CategoryId, difficulty: Difficulty, templateId?: string): { exercise: GeneratedTask; repeated: boolean } {
      const available = templateId
        ? taskPool(category, difficulty).filter((item) => item.templateId === templateId)
        : taskPool(category, difficulty);
      if (available.length === 0) throw new Error(`No exercises for ${category}/${difficulty}`);
      let unused = available.filter((item) => !seen.has(item.contentKey));
      const repeated = unused.length === 0;
      if (repeated) {
        for (const item of available) seen.delete(item.contentKey);
        unused = [...available];
      }
      const exercise = unused[Math.floor(random() * unused.length)];
      seen.add(exercise.contentKey);
      return { exercise, repeated };
    },
    seenCount: () => seen.size,
  };
}

const taskCache = new Map<string, readonly GeneratedTask[]>();
/** Legacy pools stay independently auditable; UI/session pools include typed education tasks. */
export function taskPool(category: CategoryId, difficulty: Difficulty): readonly GeneratedTask[] {
  const key = `${category}:${difficulty}`;
  if (!taskCache.has(key)) taskCache.set(key, [...pool(category, difficulty), ...educationPool(category, difficulty)]);
  return taskCache.get(key)!;
}
