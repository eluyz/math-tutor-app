import {
  rational as r,
  addRational as add,
  multiplyRational as mul,
  equalRational,
  type Rational,
} from "../rational";
import { formatRational as f, type AnswerSpec } from "../answers";
import type { Matrix } from "../matrices";
import type { Locale } from "../locales/types";
import {
  difficulties,
  legacyDifficulties,
  type Difficulty,
} from "../difficulty";
import { calculate, teaching } from "./teaching";
import type { SystemProblem, UniversityFamily } from "./schema";
type Teacher = ReturnType<typeof teaching>;
const zero = (a: Rational) => a.numerator === 0n;
const dot = (a: readonly Rational[], b: readonly Rational[]) =>
  a.reduce((sum, v, i) => add(sum, mul(v, b[i])), r(0));
const matrixText = (a: Matrix) =>
  `[${a.map((row) => `[${row.map(f).join(", ")}]`).join("; ")}]`;
const coordinateMatrix = (p: SystemProblem): Matrix =>
  p.coordinates === "sum-difference"
    ? [
        [r(1), r(1)],
        [r(1), r(-1)],
      ]
    : p.coordinates === "triangular"
      ? [
          [r(1), r(1), r(0)],
          [r(0), r(1), r(1)],
          [r(0), r(0), r(1)],
        ]
      : p.coefficients.map((row, i) => row.map((_, j) => r(i === j ? 1 : 0)));
export function originalSystem(p: SystemProblem): {
  coefficients: Matrix;
  rhs: readonly Rational[];
} {
  const transform = coordinateMatrix(p);
  return {
    coefficients: p.coefficients.map((row) =>
      row.map((_, j) =>
        row.reduce((sum, a, k) => add(sum, mul(a, transform[k][j])), r(0)),
      ),
    ),
    rhs: p.rhs,
  };
}
export function systemEquations(p: SystemProblem): string {
  const names =
    p.coordinates === "sum-difference"
      ? ["(x + y)", "(x − y)"]
      : p.coordinates === "triangular"
        ? ["(x + y)", "(y + z)", "z"]
        : ["x", "y", "z"];
  return p.coefficients
    .map((row, i) => {
      const rhs = p.shifts ? add(p.rhs[i], dot(row, p.shifts)) : p.rhs[i];
      return `${row.map((a, j) => `(${f(a)})·${p.shifts ? `(${names[j]} + (${f(p.shifts[j])}))` : names[j]}`).join(" + ")} = ${f(rhs)}`;
    })
    .join("\n");
}

function determinantWithWorking(
  a: Matrix,
  name: string,
  lesson: Teacher,
): Rational {
  const { t } = lesson;
  if (a.length === 2) {
    const first = calculate("product", a[0][0], a[1][1]),
      second = calculate("product", a[0][1], a[1][0]);
    const det = calculate("difference", first.result, second.result);
    lesson.work(
      `${name} = det ${matrixText(a)} = ${f(det.result)}`,
      t(
        "Dla macierzy 2×2 odejmujemy cały drugi iloczyn: ad − bc.",
        "For a 2×2 matrix subtract the entire second product: ad − bc.",
      ),
      first,
      second,
      det,
    );
    return det.result;
  }
  const term = (i: number, j: number, k: number) =>
    calculate("product", a[0][i], a[1][j], a[2][k]);
  const positive = [term(0, 1, 2), term(1, 2, 0), term(2, 0, 1)],
    negative = [term(2, 1, 0), term(0, 2, 1), term(1, 0, 2)];
  const pos = calculate("sum", ...positive.map((c) => c.result)),
    neg = calculate("sum", ...negative.map((c) => c.result));
  const det = calculate("difference", pos.result, neg.result);
  lesson.work(
    `${name} = det ${matrixText(a)} = ${f(det.result)}`,
    t(
      "Sarrus jest tu poprawny: macierz ma dokładnie wymiar 3×3. Sumujemy trzy iloczyny dodatnie i odejmujemy trzy przeciwne.",
      "Sarrus applies here because the matrix is exactly 3×3. Add the three forward products and subtract the three reverse products.",
    ),
    ...positive,
    ...negative,
    pos,
    neg,
    det,
  );
  return det.result;
}

function gauss(
  p: SystemProblem,
  lesson: Teacher,
): {
  classification: "system-one" | "system-none" | "system-many";
  values: Rational[];
} {
  const a = p.coefficients.map((row, i) => [...row, p.rhs[i]]),
    n = a.length,
    { t } = lesson;
  let pivotRow = 0;
  for (let column = 0; column < n; column++) {
    const pivot = a.findIndex((row, i) => i >= pivotRow && !zero(row[column]));
    if (pivot < 0) continue;
    if (pivot !== pivotRow) {
      [a[pivot], a[pivotRow]] = [a[pivotRow], a[pivot]];
      lesson.work(
        `R${pivot + 1} ↔ R${pivotRow + 1}: ${matrixText(a)}`,
        t(
          "Zamiana równań nie zmienia zbioru rozwiązań i zapewnia niezerowy element główny.",
          "Swapping equations preserves the solution set and supplies a nonzero pivot.",
        ),
      );
    }
    const divisor = a[pivotRow][column];
    if (!equalRational(divisor, r(1))) {
      const operations = a[pivotRow].map((v) =>
        calculate("quotient", v, divisor),
      );
      a[pivotRow] = operations.map((c) => c.result);
      lesson.work(
        `R${pivotRow + 1} ÷ (${f(divisor)}): ${matrixText(a)}`,
        t(
          "Dzielimy całe równanie przez sprawdzoną niezerową liczbę, także wyraz po prawej stronie.",
          "Divide the entire equation by a verified nonzero number, including the right-hand side.",
        ),
        ...operations,
      );
    }
    for (let i = 0; i < n; i++)
      if (i !== pivotRow && !zero(a[i][column])) {
        const factor = a[i][column];
        const products = a[pivotRow].map((v) =>
          calculate("product", factor, v),
        );
        const differences = a[i].map((v, j) =>
          calculate("difference", v, products[j].result),
        );
        a[i] = differences.map((c) => c.result);
        lesson.work(
          `R${i + 1} ← R${i + 1} − (${f(factor)})R${pivotRow + 1}: ${matrixText(a)}`,
          t(
            "Odejmujemy tę samą wielokrotność drugiego równania po obu stronach, eliminując niewiadomą.",
            "Subtract the same multiple of the pivot equation on both sides to eliminate this variable.",
          ),
          ...products,
          ...differences,
        );
      }
    pivotRow++;
  }
  const inconsistent = a.some(
    (row) => row.slice(0, n).every(zero) && !zero(row[n]),
  );
  const classification = inconsistent
    ? "system-none"
    : pivotRow < n
      ? "system-many"
      : "system-one";
  lesson.work(
    t(
      "Odczytaj rząd i sprawdź sprzeczność",
      "Read the rank and check consistency",
    ),
    inconsistent
      ? t(
          "Otrzymaliśmy równanie 0 = c z c ≠ 0, więc żaden zestaw wartości nie spełnia układu.",
          "A row says 0 = c with c ≠ 0, so no values can satisfy all the equations.",
        )
      : pivotRow < n
        ? t(
            `Pozostało ${n - pivotRow} zmiennych swobodnych i nie ma sprzeczności: rozwiązań jest nieskończenie wiele.`,
            `There are ${n - pivotRow} free variables and no contradiction: there are infinitely many solutions.`,
          )
        : t(
            "Każda niewiadoma ma element główny: układ ma dokładnie jedno rozwiązanie.",
            "Every variable has a pivot: the system has exactly one solution.",
          ),
  );
  return {
    classification,
    values: classification === "system-one" ? a.map((row) => row[n]) : [],
  };
}

function substitution(p: SystemProblem, lesson: Teacher): Rational[] {
  let [first, second] = p.coefficients,
    [c, h] = p.rhs;
  const { t } = lesson;
  const [firstName, secondName] = p.coordinates ? ["u", "v"] : ["x", "y"];
  if (zero(first[0])) {
    [first, second] = [second, first];
    [c, h] = [h, c];
    lesson.work(
      t("Zamień równania: R1 ↔ R2", "Swap equations: R1 ↔ R2"),
      t(
        "Wybieramy równanie z niezerowym współczynnikiem przy pierwszej niewiadomej.",
        "Choose an equation with a nonzero coefficient of the first variable.",
      ),
    );
  }
  const [a, b] = first,
    [d, e] = second;
  lesson.work(
    `${firstName} = ((${f(c)}) − (${f(b)})${secondName}) ÷ (${f(a)})`,
    t(
      "Izolujemy pierwszą niewiadomą. Współczynnik, przez który dzielimy, jest niezerowy.",
      "Isolate the first variable. Its coefficient is nonzero, so division is valid.",
    ),
  );
  const db = calculate("product", d, b),
    dc = calculate("product", d, c);
  const dbOverA = calculate("quotient", db.result, a),
    dcOverA = calculate("quotient", dc.result, a);
  const coefficient = calculate("difference", e, dbOverA.result),
    rhs = calculate("difference", h, dcOverA.result);
  lesson.work(
    `${t("Po podstawieniu", "After substitution")}: (${f(coefficient.result)})${secondName} = ${f(rhs.result)}`,
    t(
      "Podstawiamy wyrażenie za pierwszą niewiadomą do drugiego równania i łączymy współczynniki.",
      "Substitute the expression for the first variable into the other equation and collect coefficients.",
    ),
    db,
    dc,
    dbOverA,
    dcOverA,
    coefficient,
    rhs,
  );
  const y = calculate("quotient", rhs.result, coefficient.result);
  const by = calculate("product", b, y.result),
    numerator = calculate("difference", c, by.result),
    x = calculate("quotient", numerator.result, a);
  lesson.work(
    `${secondName} = ${f(y.result)}, ${firstName} = ${f(x.result)}`,
    t(
      "Po wyznaczeniu drugiej niewiadomej wracamy do pierwszego równania; zachowujemy dokładne ułamki.",
      "After solving for the second variable, substitute back into the first equation, keeping exact fractions.",
    ),
    y,
    by,
    numerator,
    x,
  );
  return [x.result, y.result];
}

export function presentSystem(p: SystemProblem, locale: Locale) {
  const lesson = teaching(locale),
    { t } = lesson;
  const n = p.coefficients.length;
  if (
    (n !== 2 && n !== 3) ||
    p.rhs.length !== n ||
    p.coefficients.some((row) => row.length !== n) ||
    (p.shifts && p.shifts.length !== n) ||
    (p.coordinates === "sum-difference" && n !== 2) ||
    (p.coordinates === "triangular" && n !== 3)
  )
    throw new Error("Invalid system dimensions");
  const variableNames = p.coordinates ? ["u", "v", "w"] : ["x", "y", "z"];
  const method = {
    substitution: t("podstawianie", "substitution"),
    elimination: t("eliminacja", "elimination"),
    classification: t("klasyfikacja", "classification"),
    cramer: t("reguła Cramera", "Cramer's rule"),
  }[p.method];
  const question = `${t("Układ", "System")} ${n}×${n} — ${method}. ${p.method === "classification" ? t("Sklasyfikuj układ. Przy jednym rozwiązaniu wyznacz wszystkie niewiadome.", "Classify the system. If unique, find every variable.") : t("Wyznacz wszystkie niewiadome.", "Find all the variables.")}\n${systemEquations(p)}`;
  lesson.work(
    t(
      "Zapisz równoważny układ współczynników",
      "Write an equivalent coefficient system",
    ),
    t(
      "Każde równanie musi być spełnione jednocześnie; przekształcamy całe równania, zachowując równości.",
      "All equations must hold simultaneously; operations apply to whole equations and preserve equality.",
    ),
  );
  if (p.shifts) {
    for (const [i, row] of p.coefficients.entries()) {
      const terms = row.map((v, j) => calculate("product", v, p.shifts![j]));
      const constant = calculate("sum", ...terms.map((c) => c.result));
      const normalized = calculate(
        "difference",
        add(p.rhs[i], constant.result),
        constant.result,
      );
      lesson.work(
        `R${i + 1}: ${row.map((v, j) => `(${f(v)})${"xyz"[j]}`).join(" + ")} = ${f(normalized.result)}`,
        t(
          "Rozwijamy nawiasy i odejmujemy sumę stałych po obu stronach. Znak minusa dotyczy całej sumy.",
          "Expand the brackets and subtract the sum of constants on both sides; the subtraction applies to the entire sum.",
        ),
        ...terms,
        constant,
        normalized,
      );
    }
  }
  if (p.coordinates)
    lesson.work(
      p.coordinates === "sum-difference"
        ? "u = x + y, v = x − y"
        : "u = x + y, v = y + z, w = z",
      t(
        "Wprowadzamy pomocnicze niewiadome. To odwracalna zmiana: po rozwiązaniu wrócimy do oryginalnych zmiennych.",
        "Introduce auxiliary variables through an invertible change; after solving we will recover the original variables.",
      ),
    );
  let classification: "system-one" | "system-none" | "system-many" =
      "system-one",
    values: Rational[];
  if (p.method === "classification" || p.method === "elimination")
    ({ classification, values } = gauss(p, lesson));
  else if (p.method === "substitution") values = substitution(p, lesson);
  else {
    const det = determinantWithWorking(p.coefficients, "D", lesson);
    if (zero(det)) {
      lesson.work(
        "D = 0",
        t(
          "Nie wolno dzielić przez zerowy wyznacznik. Samo D = 0 nie odróżnia sprzeczności od nieskończenie wielu rozwiązań; użyjemy eliminacji.",
          "Never divide by a zero determinant. D = 0 alone does not distinguish inconsistency from infinitely many solutions; use elimination.",
        ),
      );
      ({ classification, values } = gauss(p, lesson));
    } else {
      values = p.rhs.map((_, column) => {
        const replaced = p.coefficients.map((row, i) =>
          row.map((v, j) => (j === column ? p.rhs[i] : v)),
        );
        const name = variableNames[column];
        const numerator = determinantWithWorking(replaced, `D_${name}`, lesson);
        const value = calculate("quotient", numerator, det);
        lesson.work(
          `${name} = D_${name} / D = ${f(value.result)}`,
          t(
            "Zastępujemy wyłącznie odpowiednią kolumnę wyrazami wolnymi. D ≠ 0, więc iloraz jest dozwolony.",
            "Replace only the corresponding column by the right-hand side. D ≠ 0, so the quotient is valid.",
          ),
          value,
        );
        return value.result;
      });
    }
  }
  if (classification === "system-one" && p.coordinates) {
    if (p.coordinates === "sum-difference") {
      const sum = calculate("sum", values[0], values[1]),
        difference = calculate("difference", values[0], values[1]);
      const x = calculate("quotient", sum.result, r(2)),
        y = calculate("quotient", difference.result, r(2));
      values = [x.result, y.result];
      lesson.work(
        `x = (u + v)/2 = ${f(values[0])}, y = (u − v)/2 = ${f(values[1])}`,
        t(
          "Dodajemy i odejmujemy definicje u, v; dzielenie przez 2 odwraca zmianę zmiennych.",
          "Add and subtract the definitions of u and v; division by 2 reverses the variable change.",
        ),
        sum,
        difference,
        x,
        y,
      );
    } else {
      const y = calculate("difference", values[1], values[2]),
        x = calculate("difference", values[0], y.result);
      values = [x.result, y.result, values[2]];
      lesson.work(
        `z = w, y = v − w = ${f(values[1])}, x = u − y = ${f(values[0])}`,
        t(
          "Wracamy do oryginalnych niewiadomych w odwrotnej kolejności; wynik pomocniczy nie jest jeszcze odpowiedzią x, y, z.",
          "Recover the original variables in reverse order; auxiliary values are not yet the requested x, y, z.",
        ),
        y,
        x,
      );
    }
  }
  if (classification === "system-one") {
    const original = originalSystem(p);
    original.coefficients.forEach((row, i) => {
      const products = row.map((v, j) => calculate("product", v, values[j]));
      const sum = calculate("sum", ...products.map((c) => c.result));
      if (!equalRational(sum.result, original.rhs[i]))
        throw new Error("System verification failed");
      lesson.work(
        `R${i + 1}: ${f(sum.result)} = ${f(original.rhs[i])}`,
        t(
          "Podstawiamy wszystkie znalezione wartości do oryginalnego równania, niezależnie od użytej metody rozwiązywania.",
          "Substitute every value into the original equation, independently of the solving method.",
        ),
        ...products,
        sum,
      );
    });
  }
  const answer: AnswerSpec =
    p.method === "classification" || classification !== "system-one"
      ? {
          kind: "system",
          classification,
          variables: ["x", "y", "z"].slice(0, n),
          values,
        }
      : { kind: "list", labels: ["x", "y", "z"].slice(0, n), values };
  const hint = {
    substitution: t(
      "Wybierz równanie z niezerowym współczynnikiem przy x. Wyraź x przez y i podstaw do drugiego równania.",
      "Choose an equation with a nonzero x coefficient. Express x in terms of y and substitute into the other equation.",
    ),
    elimination: t(
      "Wybierz niezerowy element główny. Odejmij odpowiednią wielokrotność równania, aby usunąć niewiadomą.",
      "Choose a nonzero pivot. Subtract an appropriate multiple of its equation to eliminate a variable.",
    ),
    classification: t(
      "Sprawdź, czy pojawia się 0 = c z c ≠ 0, albo pozostają zmienne swobodne. Zerowy wyznacznik sam nie rozstrzyga klasyfikacji.",
      "Look for a row 0 = c with c ≠ 0, or for free variables. A zero determinant alone does not settle the classification.",
    ),
    cramer: t(
      "Zapisz macierz współczynników w kolejności x, y, z i oblicz D. Dopiero gdy D ≠ 0, zastępuj kolejne kolumny wyrazami wolnymi.",
      "Write the coefficient matrix in x, y, z order and calculate D. Only if D ≠ 0 replace its columns by the right-hand side.",
    ),
  }[p.method];
  return lesson.finish(
    question,
    answer,
    hint,
    t(
      "Przekształcaj całe równania. Dla Cramera sprawdź D ≠ 0; na końcu podstaw wszystkie wartości do każdego oryginalnego równania.",
      "Transform whole equations. For Cramer check D ≠ 0; finally substitute all values into every original equation.",
    ),
  );
}

function buildSystem(
  v: number,
  difficulty: Difficulty,
  method: SystemProblem["method"],
  n: number,
): SystemProblem {
  const level = difficulties.indexOf(difficulty),
    k = (v % 4) - 1,
    s = (v % 3) - 1,
    q = (v % 2) + 1,
    u = (Math.floor(v / 4) % 3) - 1;
  let coefficients: Rational[][] =
    n === 2
      ? [
          [r(1), r(k)],
          [r(s), r(s * k + (v % 2 ? -2 : 1))],
        ]
      : [
          [r(1), r(k), r(0)],
          [r(s), r(s * k + 1), r(q)],
          [r(0), r(u), r(u * q + 1)],
        ];
  const factors =
    level === 0
      ? [r(1), r(1), r(1)]
      : level === 1
        ? [r(-2), r(3), r(-1)]
        : n === 3 && level === 2
          ? [r(1), r(-1), r(1)]
          : [r(1, 2), r(-2, 3), r(3, 2)];
  coefficients = coefficients.map((row, i) =>
    row.map((a) => mul(a, factors[i])),
  );
  const values = [
    r(v - 11, level < 2 ? 1 : 2),
    r((v % 7) - 3, level < 2 ? 1 : 3),
    r((v % 5) - 2, 2),
  ].slice(0, n);
  let rhs = coefficients.map((row) => dot(row, values));
  if (method === "classification" && v % 3 !== 0) {
    const multiplier = r((v % 5) - 2);
    coefficients[1] = coefficients[0].map((a) => mul(a, multiplier));
    rhs = [rhs[0], add(mul(rhs[0], multiplier), r(v % 3 === 1 ? 1 : 0))];
  }
  return {
    kind: "system",
    coefficients,
    rhs,
    method,
    ...(level === 3
      ? {
          shifts: Array.from({ length: n }, (_, i) =>
            r(i % 2 ? -v - 1 : v + 1, i + 2),
          ),
        }
      : {}),
    ...(level === 4
      ? {
          coordinates:
            n === 2 ? ("sum-difference" as const) : ("triangular" as const),
        }
      : {}),
  };
}
export const systemFamilies: readonly UniversityFamily[] = [
  {
    id: "system-substitution",
    category: "systems",
    titles: { pl: "Układ 2×2 — podstawianie", en: "2×2 system — substitution" },
    supportedDifficulties: difficulties,
    create: (v, d) => buildSystem(v, d, "substitution", 2),
  },
  {
    id: "system-elimination",
    category: "systems",
    titles: { pl: "Układ 2×2 — eliminacja", en: "2×2 system — elimination" },
    supportedDifficulties: difficulties,
    create: (v, d) => buildSystem(v, d, "elimination", 2),
  },
  {
    id: "system-classification",
    category: "systems",
    titles: {
      pl: "Ile rozwiązań ma układ?",
      en: "How many solutions does the system have?",
    },
    supportedDifficulties: legacyDifficulties,
    create: (v, d) => buildSystem(v, d, "classification", 2),
  },
  {
    id: "system-cramer-two",
    category: "systems",
    titles: { pl: "Reguła Cramera — 2×2", en: "Cramer's rule — 2×2" },
    supportedDifficulties: difficulties,
    create: (v, d) => buildSystem(v, d, "cramer", 2),
  },
  {
    id: "system-cramer-three",
    category: "systems",
    titles: { pl: "Reguła Cramera — 3×3", en: "Cramer's rule — 3×3" },
    supportedDifficulties: ["hard", "advanced", "expert"],
    create: (v, d) => buildSystem(v, d, "cramer", 3),
  },
];
