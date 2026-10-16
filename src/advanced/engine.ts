import { rational as r, subtractRational as sub, multiplyRational as mul, equalRational as eq, type Rational } from "../rational";
import { formatRational as f, type AnswerSpec } from "../answers";
import { calculate, calculationText, type Solution, type SolutionStep, type Calculation } from "../solutions/types";
import { addMatrices, subtractMatrices, multiplyMatrices, scaleMatrix, transposeMatrix, type Matrix } from "../matrices";
import type { Expression, MatrixExpression, MathProblem, Operator } from "./schema";
export const val = (n: number, d = 1): Expression => ({ kind: "value", value: r(n, d) });
export const variable: Expression = { kind: "variable" };
export const binary = (operator: Operator, left: Expression, right: Expression): Expression => ({ kind: "binary", operator, left, right });
export const sum = (a: Expression, b: Expression) => binary("sum", a, b);
export const difference = (a: Expression, b: Expression) => binary("difference", a, b);
export const product = (a: Expression, b: Expression) => binary("product", a, b);
export const quotient = (a: Expression, b: Expression) => binary("quotient", a, b);
export const power = (base: Expression, exponent = 2): Expression => ({ kind: "power", base, exponent });
export const affine = (a: Expression, b: Expression) => sum(product(a, variable), b);
const signs = { sum: "+", difference: "−", product: "×", quotient: "÷" };
export function expressionText(e: Expression): string {
  switch (e.kind) {
    case "variable": return "x";
    case "value": return `(${f(e.value)})`;
    case "power": return `(${expressionText(e.base)})^${e.exponent}`;
    case "binary": return `(${expressionText(e.left)} ${signs[e.operator]} ${expressionText(e.right)})`;
  }
}
export function matrixExpressionText(e: MatrixExpression): string {
  switch (e.kind) {
    case "input": return e.name;
    case "transpose": return `(${matrixExpressionText(e.input)})ᵀ`;
    case "scale": return `(${f(e.scalar)})·(${matrixExpressionText(e.input)})`;
    default: return `(${matrixExpressionText(e.left)} ${signs[e.kind]} ${matrixExpressionText(e.right)})`;
  }
}
const reasons = {
  sum: "Dodajemy składniki po wykonaniu działań w nawiasach i mnożenia.",
  difference: "Odejmujemy cały drugi składnik, zachowując jego znak.",
  product: "Mnożymy dokładne ułamki, pilnując znaków i skracania.",
  quotient: "Dzielimy przez niezerową liczbę, czyli mnożymy przez jej odwrotność.",
};
export function derive(problem: MathProblem, matrices: readonly { label: string; values: Matrix }[] = []): { answer: AnswerSpec; solution: Solution; explanation: string } {
  const steps: SolutionStep[] = [];
  const work = (action: string, reason: string, ...calculations: Calculation[]) => { steps.push({ kind: "working", action, reason, calculations }); };
  function numeric(e: Expression, at?: Rational): Rational {
    if (e.kind === "value") return e.value;
    if (e.kind === "variable") { if (!at) throw new Error("Missing substitution"); return at; }
    if (e.kind === "power") {
      const base = numeric(e.base, at), c = calculate("product", ...Array.from({ length: e.exponent }, () => base));
      work(`Oblicz potęgę ${expressionText(e)}`, "Potęga to iloczyn jednakowych czynników; nawias zachowuje znak podstawy.", c); return c.result;
    }
    const c = calculate(e.operator, numeric(e.left, at), numeric(e.right, at));
    work(`Oblicz ${expressionText(e)}`, reasons[e.operator], c); return c.result;
  }
  function polynomial(e: Expression): Rational[] {
    if (e.kind === "value") return [e.value];
    if (e.kind === "variable") return [r(0), r(1)];
    if (e.kind === "power") {
      if (e.exponent !== 2) throw new Error("Only square expansion is used here");
      const base = polynomial(e.base); return combine("product", base, base, expressionText(e));
    }
    return combine(e.operator, polynomial(e.left), polynomial(e.right), expressionText(e));
  }
  function combine(op: Operator, a: Rational[], b: Rational[], text: string): Rational[] {
    if (op === "quotient" && (b.length !== 1 || eq(b[0], r(0)))) throw new Error("Polynomial division requires a nonzero constant");
    const length = op === "product" ? a.length + b.length - 1 : op === "quotient" ? a.length : Math.max(a.length, b.length);
    return Array.from({ length }, (_, n) => {
      const terms = op === "product" ? a.flatMap((v, i) => n - i >= 0 && n - i < b.length ? [calculate("product", v, b[n - i])] : []) : [];
      const c = op === "product" ? terms.length === 1 ? terms[0] : calculate("sum", ...terms.map((v) => v.result))
        : calculate(op, a[n] ?? r(0), b[op === "quotient" ? 0 : n] ?? r(0));
      work(`Współczynnik przy x^${n} w ${text}`, op === "product" ? "Każdy składnik pierwszego nawiasu mnożymy przez każdy drugiego; wykładniki dodajemy i łączymy wyrazy tej samej potęgi." : op === "quotient" ? reasons.quotient : "Łączymy współczynniki przy tej samej potędze x, z uwzględnieniem znaku działania.", ...(op === "product" && terms.length > 1 ? terms : []), c);
      return c.result;
    });
  }
  function matrix(e: MatrixExpression): Matrix {
    if (e.kind === "input") { const value = matrices.find((m) => m.label === e.name); if (!value) throw new Error("Missing matrix"); return value.values; }
    const text = matrixExpressionText(e);
    if (e.kind === "transpose") {
      const a = matrix(e.input), result = transposeMatrix(a);
      work(`Transponuj ${matrixExpressionText(e.input)}: ${a.length}×${a[0].length} → ${result.length}×${result[0].length}`, "Wiersze stają się kolumnami; wartości i znaki pozostają takie same.");
      result.forEach((row, i) => row.forEach((v, j) => work(`W ${text}: c(${i + 1},${j + 1}) = a(${j + 1},${i + 1}) = ${f(v)}`, "Przenosimy element na pozycję o zamienionych indeksach, licząc od 1.")));
      return result;
    }
    const a = e.kind === "scale" ? matrix(e.input) : matrix(e.left);
    const b = e.kind === "scale" ? undefined : matrix(e.right);
    const result = e.kind === "scale" ? scaleMatrix(a, e.scalar) : e.kind === "sum" ? addMatrices(a, b!) : e.kind === "difference" ? subtractMatrices(a, b!) : multiplyMatrices(a, b!);
    work(`Oblicz ${text}; wynik ma wymiar ${result.length}×${result[0].length}`, e.kind === "product" ? `Kolumny lewego czynnika (${a[0].length}) odpowiadają wierszom prawego (${b!.length}). Kolejności mnożenia nie wolno zmieniać.` : "Skalar zachowuje wymiar, a suma i różnica wymagają jednakowych wymiarów.");
    result.forEach((row, i) => row.forEach((_, j) => {
      if (e.kind === "product") {
        const products = a[i].map((v, k) => calculate("product", v, b![k][j]));
        work(`W ${text}: c(${i + 1},${j + 1}), wiersz ${i + 1} × kolumna ${j + 1}`, "Mnożymy kolejne elementy wiersza przez elementy kolumny i dodajemy wszystkie iloczyny.", ...products, calculate("sum", ...products.map((p) => p.result)));
      } else work(`W ${text}: element (${i + 1},${j + 1})`, e.kind === "scale" ? "Skalar mnoży każdy element, także zero i ułamki." : "Łączymy elementy na tych samych pozycjach, z zachowaniem znaków.", e.kind === "scale" ? calculate("product", e.scalar, a[i][j]) : calculate(e.kind, a[i][j], b![i][j]));
    }));
    return result;
  }
  function determinant(a: Matrix): Rational {
    if (a.length === 2) {
      const ad = calculate("product", a[0][0], a[1][1]), bc = calculate("product", a[0][1], a[1][0]);
      work("Dla otrzymanej macierzy 2×2 oblicz ad − bc", "Wyznacznik jest liczbą: odejmujemy cały iloczyn drugiej przekątnej.", ad, bc, calculate("difference", ad.result, bc.result));
      return sub(ad.result, bc.result);
    }
    const permutations = [[0,1,2],[1,2,0],[2,0,1],[2,1,0],[0,2,1],[1,0,2]];
    const products = permutations.map((js, k) => {
      const c = calculate("product", ...js.map((j, i) => a[i][j]));
      work(`${k < 3 ? "+ ↘" : "− ↗"} Iloczyn ${k + 1}: ${js.map((j, i) => `a(${i+1},${j+1})`).join("·")}`, k < 3 ? "Ten iloczyn dodajemy do pierwszej sumy Sarrusa dla 3×3." : "Ten iloczyn należy do drugiej sumy Sarrusa, którą w całości odejmiemy.", c); return c.result;
    });
    const positive = calculate("sum", ...products.slice(0,3)), negative = calculate("sum", ...products.slice(3)), result = calculate("difference", positive.result, negative.result);
    work("Dodaj trzy iloczyny ↘ i odejmij całą sumę ↗", "Nawias wokół drugiej sumy zachowuje właściwe znaki wszystkich sześciu składników.", positive, negative, result);
    return result.result;
  }
  function roots(a: Rational, b: Rational, c: Rational): Rational[] {
    const bs = calculate("product", b, b), fourac = calculate("product", r(4), a, c), delta = calculate("difference", bs.result, fourac.result);
    work(`Oblicz Δ = b² − 4ac dla a = ${f(a)}, b = ${f(b)}, c = ${f(c)}`, "Współczynniki odczytujemy dopiero po uporządkowaniu równania i przeniesieniu wszystkich wyrazów na jedną stronę.", bs, fourac, delta);
    if (delta.result.numerator < 0n) { work("Δ < 0: brak pierwiastków rzeczywistych", "Pierwiastek kwadratowy z ujemnej delty nie jest liczbą rzeczywistą."); return []; }
    const denominator = mul(r(2), a), negativeB = mul(r(-1), b);
    if (!delta.result.numerator) { const root = calculate("quotient", negativeB, denominator); work("Δ = 0: jeden pierwiastek podwójny x₀ = −b/(2a)", "Oba znaki we wzorze prowadzą do tej samej wartości.", root); return [root.result]; }
    const sqrt = (n: bigint) => { let lo = 0n, hi = n + 1n; while (hi - lo > 1n) { const m = (lo + hi) / 2n; if (m*m <= n) lo=m; else hi=m; } if (lo*lo !== n) throw new Error("Irrational root outside scope"); return lo; };
    const square = r(sqrt(delta.result.numerator), sqrt(delta.result.denominator));
    work(`Δ > 0: dwa pierwiastki; √Δ = ${f(square)}`, "Sprawdzamy dokładny pierwiastek przez podniesienie do kwadratu.", calculate("product", square, square));
    return ["difference", "sum"].map((op) => {
      const numerator = calculate(op as Operator, negativeB, square), root = calculate("quotient", numerator.result, denominator);
      work(op === "difference" ? "Oblicz x₁ = (−b − √Δ)/(2a)" : "Oblicz x₂ = (−b + √Δ)/(2a)", "Cały licznik dzielimy przez 2a; nie rozdzielamy mianownika pomiędzy wybrane składniki.", numerator, root); return root.result;
    });
  }
  let answer: AnswerSpec;
  const coefficients = (p: Rational[]): AnswerSpec => ({ kind: "list", labels: p.length === 2 ? ["Współczynnik przy x", "Wyraz wolny"] : ["Współczynnik przy x²", "Współczynnik przy x", "Wyraz wolny"], values: [...p].reverse() });
  switch (problem.kind) {
    case "numeric": answer = { kind: "scalar", value: numeric(problem.expression) }; break;
    case "polynomial":
      if (problem.at) { work(`Podstaw x = ${f(problem.at)} do całego wyrażenia`, "Każde wystąpienie x zastępujemy tą samą wartością, zachowując nawiasy."); answer = { kind: "scalar", value: numeric(problem.expression, problem.at) }; }
      else answer = coefficients(polynomial(problem.expression)); break;
    case "linear": {
      const standard = combine("difference", polynomial(problem.left), polynomial(problem.right), "lewa strona − prawa strona");
      if (standard.length !== 2 || eq(standard[1], r(0))) throw new Error("Unique linear solution required");
      const root = calculate("quotient", mul(r(-1), standard[0]), standard[1]);
      work(`Po zebraniu wyrazów: (${f(standard[1])})x = ${f(mul(r(-1), standard[0]))}`, "Przenosimy stałą na drugą stronę i dzielimy obie strony przez niezerowy współczynnik przy x.", root);
      answer = { kind: "scalar", value: root.result }; break;
    }
    case "quadratic": {
      const standard = combine("difference", polynomial(problem.left), polynomial(problem.right), "lewa strona − prawa strona");
      if (standard.length !== 3 || eq(standard[2], r(0))) throw new Error("Quadratic required");
      work(`Uporządkuj: (${f(standard[2])})x² + (${f(standard[1])})x + (${f(standard[0])}) = 0`, "Przeniesienie wszystkich wyrazów na jedną stronę zachowuje zbiór rozwiązań.");
      if (problem.factor) work("Zauważ różnicę kwadratów U² − V² = (U − V)(U + V)", "Po rozłożeniu iloczyn jest zerem, gdy jeden z czynników jest zerem; delta daje równoważną kontrolę otrzymanych pierwiastków.");
      const values = roots(standard[2], standard[1], standard[0]);
      answer = problem.target === "roots" ? { kind: "roots", values } : { kind: "scalar", value: sub(mul(standard[1], standard[1]), mul(r(4), mul(standard[2], standard[0]))) }; break;
    }
    case "monomial": {
      const first = calculate("product", problem.a, problem.b), coefficient = calculate("quotient", first.result, problem.c), exponent = problem.p + problem.q - problem.s;
      work("Pomnóż współczynniki liczbowe", "Część liczbowa iloczynu powstaje przez mnożenie współczynników ze znakami.", first);
      work(`Podziel współczynnik przez (${f(problem.c)})`, "Dla x ≠ 0 można podzielić przez wskazany jednomian; dzielnik liczbowy również jest niezerowy.", coefficient);
      work(`x^${problem.p}·x^${problem.q} ÷ x^${problem.s} = x^${exponent}`, "Przy mnożeniu potęg dodajemy wykładniki, a przy dzieleniu odejmujemy.", calculate("sum", r(problem.p), r(problem.q)), calculate("difference", r(problem.p + problem.q), r(problem.s)));
      let result = coefficient.result;
      if (problem.combined) { const combined = calculate("sum", result, problem.d); work("Połącz otrzymany jednomian z drugim jednomianem", "Wyrazy mają już tę samą potęgę x, więc dodajemy ich współczynniki.", combined); result = combined.result; }
      answer = { kind: "list", labels: ["Współczynnik", "Wykładnik x"], values: [result, r(exponent)] }; break;
    }
    default: {
      const value = matrix(problem.expression);
      answer = problem.kind === "matrix" ? { kind: "matrix", values: value } : { kind: "scalar", value: determinant(value) };
    }
  }
  const end: SolutionStep = { kind: "answer", action: "Poprawna odpowiedź", reason: "Wynik wynika z kolejnych działań, z zachowaniem znaków, wymiarów i dokładnych ułamków.", answer };
  if (!steps.length) throw new Error("Missing working");
  const solution: Solution = [steps[0], ...steps.slice(1), end];
  const explanation = steps.map((s) => s.kind === "working" ? `${s.action}. ${s.reason}\n${s.calculations.map(calculationText).join("\n")}` : "").join("\n");
  return { answer, solution, explanation };
}
