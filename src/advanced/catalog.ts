import type { CategoryId, TypedExercise } from "../exercises";
import { formatRational as f } from "../answers";
import { rational as r, addRational as add, multiplyRational as mul, subtractRational as sub } from "../rational";
import type { Matrix } from "../matrices";
import { type Difficulty, type HigherDifficulty, higherDifficulties } from "../difficulty";
import { val as n, variable as x, sum as plus, difference as minus, product as times, quotient as over, power as square, affine, derive, expressionText, matrixExpressionText } from "./engine";
import type { Expression, MathProblem, MatrixExpression } from "./schema";

export const higherFamilyIds = [
  "order-add-product", "order-subtract-product", "order-parentheses", "signed-product",
  "fraction-add", "fraction-subtract", "fraction-product",
  "algebra-substitute", "algebra-like-terms", "algebra-distribute", "algebra-negative-brackets", "algebra-monomials", "algebra-polynomial-product",
  "equation-add", "equation-subtract", "equation-fraction", "equation-fraction-balance",
  "quadratic-square-sum", "quadratic-square-difference", "quadratic-difference-squares", "quadratic-discriminant", "quadratic-roots",
  "matrix-add", "matrix-subtract", "matrix-scale", "matrix-transpose", "matrix-product", "determinant-two", "determinant-sarrus",
] as const;
export const supportsHigher = (id: string) => higherFamilyIds.some((supported) => supported === id);
export const HIGHER_VARIANTS = 24;
export type HigherTask = TypedExercise & { templateId: string; parameters: Readonly<Record<string, number>>; contentKey: string; difficulty: HigherDifficulty; math: MathProblem };
type Descriptor = { id: string; title: string; category: CategoryId };
function matrixData(v: number, rows: number, columns: number, salt: number): Matrix {
  return Array.from({ length: rows }, (_, i) => Array.from({ length: columns }, (_, j) => r(
    i === 0 && j === 0 ? v % 6 - 2 + salt : i === 0 && j === 1 ? Math.floor(v / 6) - 1 - salt : (v * (i+j+2) + 3*i + 5*j + salt*7) % 9 - 4,
    (i + j + salt) % 2 + 2,
  )));
}
function makeProblem(id: string, v: number, level: HigherDifficulty): { math: MathProblem; matrices?: readonly { label: string; values: Matrix }[] } {
  const expert = level === "expert";
  const a = n(v + 1, 2), b = n(v % 4 + 1, 3), c = n(-2 - v % 3, 2), d = n(Math.floor(v / 4) + 1, 2), e = n(v % 3 + 2), g = n(3, 2);
  const numeric = (expression: Expression) => ({ math: { kind: "numeric", expression } as MathProblem });
  const polynomial = (expression: Expression, at?: ReturnType<typeof r>) => ({ math: { kind: "polynomial", expression, ...(at ? { at } : {}) } as MathProblem });
  switch (id) {
    case "order-add-product": return numeric(expert ? minus(times(plus(a, over(b, c)), minus(d, e)), over(g, e)) : plus(a, times(plus(b, over(c, d)), e)));
    case "order-subtract-product": return numeric(expert ? over(minus(a, times(b, minus(c, d))), plus(e, g)) : minus(a, over(times(b, minus(c, d)), e)));
    case "order-parentheses": return numeric(expert ? times(minus(a, over(b, c)), over(plus(d, e), g)) : over(times(minus(a, b), plus(c, d)), e));
    case "signed-product": return numeric(expert ? over(times(times(n(-1), a), minus(c, over(d, e))), plus(b, g)) : times(times(n(-1), a), minus(c, over(d, e))));
    case "fraction-add": return numeric(expert ? over(plus(over(a, b), over(c, d)), minus(e, n(1, 2))) : plus(over(a, b), over(c, d)));
    case "fraction-subtract": return numeric(expert ? minus(over(a, plus(b, g)), times(over(c, d), minus(e, n(1, 3)))) : minus(over(a, b), over(c, d)));
    case "fraction-product": return numeric(expert ? over(times(minus(a, b), plus(c, d)), minus(e, n(1, 2))) : times(minus(a, b), plus(c, d)));
    case "algebra-substitute": return polynomial(expert ? minus(square(affine(b, a)), times(c, affine(d, n(-1)))) : minus(times(a, square(plus(x, b))), times(c, x)), r(v % 2 ? -3 : 2, 3));
    case "algebra-like-terms": return polynomial(expert ? plus(minus(times(a, plus(x, b)), times(c, minus(x, d))), times(e, affine(n(2), n(-1)))) : minus(times(a, plus(x, b)), times(c, minus(x, d))), r(-2, 3));
    case "algebra-distribute": return polynomial(expert ? minus(times(times(a, plus(x, b)), minus(x, c)), times(d, plus(x, e))) : minus(times(a, plus(x, b)), times(c, plus(x, d))));
    case "algebra-negative-brackets": return polynomial(expert ? minus(times(times(times(n(-1), a), minus(x, b)), plus(x, c)), times(d, plus(x, e))) : minus(times(times(n(-1), a), minus(x, b)), times(c, plus(x, d))));
    case "algebra-monomials": return { math: { kind: "monomial", a: r(v + 1, 2), b: r(v % 2 ? -2 : 3, 3), c: r(v % 3 + 1, 2), d: r(-1, 3), p: v % 3 + 2, q: Math.floor(v / 3) % 3 + 2, s: 2, combined: expert } };
    case "algebra-polynomial-product": return polynomial(expert ? minus(times(affine(a, b), affine(c, d)), times(affine(e, n(-1)), affine(n(1), g))) : minus(times(affine(a, b), affine(c, d)), times(e, x)));
    case "quadratic-square-sum": case "quadratic-square-difference": {
      const sign = id === "quadratic-square-sum" ? 1 : -1;
      const first = square(affine(a, times(n(sign), b)));
      return polynomial(expert ? minus(plus(first, square(affine(c, d))), times(affine(e, n(-1)), affine(n(1), g))) : minus(first, affine(c, d)));
    }
    case "quadratic-difference-squares": return { math: { kind: "quadratic", left: square(affine(n(2), a)), right: expert ? square(affine(n(1), b)) : square(b), target: "roots", factor: true } };
  }
  if (id.startsWith("equation-")) {
    // A chosen rational root defines the balancing constant, never the solving steps.
    const root = r(v % 2 ? -(v + 1) : v + 1, 3), shift = r(v % 4 + 1, 2);
    const constant = add(mul(r(13, 6), root), shift); // (3/2 - (-2/3))*root + shift
    const coefficientLeft = n(3, 2), coefficientRight = n(-2, 3), shiftExpr: Expression = { kind: "value", value: shift }, rhs: Expression = { kind: "value", value: constant };
    let left: Expression, right: Expression;
    if (id === "equation-add") {
      left = times(coefficientLeft, plus(x, over(shiftExpr, coefficientLeft)));
      right = plus(times(coefficientRight, x), rhs);
    } else if (id === "equation-subtract") {
      left = minus(times(coefficientLeft, minus(x, n(1, 3))), n(1, 2));
      right = plus(times(coefficientRight, x), { kind: "value", value: add(mul(r(13,6), root), r(-1)) });
    } else if (id === "equation-fraction") {
      left = plus(over(plus(x, n(1,3)), n(2,3)), minus(shiftExpr, n(1,2)));
      right = plus(times(coefficientRight, x), rhs);
    } else {
      left = minus(over(plus(times(n(3), x), n(2)), n(2)), minus(n(1), shiftExpr));
      right = over(plus(times(n(-4), x), times(n(6), rhs)), n(6));
    }
    if (expert) {
      // Different bracketed terms on both sides require collecting unknowns;
      // the balancing constant preserves the independently audited rational root.
      const leftTerm = over(times(plus(x, a), b), n(2));
      const rightTerm = over(times(minus(times(n(2), x), c), d), n(3));
      const av = r(v + 1, 2), bv = r(v % 4 + 1, 3), cv = r(-2 - v % 3, 2), dv = r(Math.floor(v / 4) + 1, 2);
      const correction = sub(overValue(mul(add(root, av), bv), r(2)), overValue(mul(sub(mul(r(2), root), cv), dv), r(3)));
      left = plus(left, leftTerm); right = plus(plus(right, rightTerm), { kind: "value", value: correction });
    }
    return { math: { kind: "linear", left, right } };
  }
  if (id === "quadratic-discriminant" || id === "quadratic-roots") {
    const root1 = r(-(v + 1), 2), root2 = v % 3 === 1 ? root1 : r(v % 4 + 1, 3);
    const A = r(v % 2 ? -2 : 2), B = mul(r(-1), mul(A, add(root1, root2)));
    const C = v % 3 === 2 ? add(overValue(mul(B, B), mul(r(4), A)), r(A.numerator > 0n ? 1 : -1)) : mul(A, mul(root1, root2));
    const value = (value: ReturnType<typeof r>): Expression => ({ kind: "value", value });
    const av = r(v + 1, 2), bv = r(v % 4 + 1, 3), rightScale = sub(r(1), A);
    const linear = add(sub(B, mul(r(2), av)), mul(mul(r(2), rightScale), bv));
    const constant = add(sub(C, mul(av, av)), mul(rightScale, mul(bv, bv)));
    const left = expert ? plus(square(plus(x, a)), plus(times(value(linear), x), value(constant))) : plus(times(affine(value(A), minus(value(B), n(1))), x), plus(x, value(C)));
    const right = expert ? times(value(rightScale), square(plus(x, b))) : n(0);
    return { math: { kind: "quadratic", left, right, target: id === "quadratic-roots" ? "roots" : "delta" } };
  }
  const input = (name: string): MatrixExpression => ({ kind: "input", name });
  const op = (kind: "sum" | "difference" | "product", left: MatrixExpression, right: MatrixExpression): MatrixExpression => ({ kind, left, right });
  const transpose = (input: MatrixExpression): MatrixExpression => ({ kind: "transpose", input });
  const scale = (scalar: number, input: MatrixExpression): MatrixExpression => ({ kind: "scale", scalar: r(scalar, 2), input });
  const size = id === "determinant-two" ? 2 : id === "determinant-sarrus" ? 3 : v % 2 + 2;
  const rectangular = ["matrix-product", "matrix-transpose"].includes(id), inner = rectangular ? size === 2 ? 3 : 2 : size;
  const matrices = [
    { label: "A", values: matrixData(v, size, inner, 0) },
    { label: "B", values: matrixData(v, inner, size, 1) },
    { label: "C", values: matrixData(v, size, size, 2) },
  ];
  const A = input("A"), B = input("B"), C = input("C");
  let expression: MatrixExpression;
  switch (id) {
    case "matrix-add": expression = expert ? op("difference", scale(3, op("sum", A, transpose(B))), C) : op("sum", scale(4, A), B); break;
    case "matrix-subtract": expression = expert ? op("product", op("difference", A, B), C) : op("difference", transpose(A), B); break;
    case "matrix-scale": expression = expert ? op("difference", scale(-3, op("product", A, B)), scale(2, C)) : scale(-3, op("sum", A, B)); break;
    case "matrix-transpose": expression = expert ? transpose(op("difference", op("product", A, B), C)) : transpose(op("product", A, B)); break;
    case "matrix-product": expression = expert ? op("sum", transpose(op("product", A, B)), scale(-3, C)) : op("difference", op("product", A, B), C); break;
    case "determinant-two": case "determinant-sarrus": expression = expert ? op("difference", op("product", A, B), transpose(C)) : op("difference", scale(4, A), B); break;
    default: throw new Error(`Unsupported higher family ${id}`);
  }
  const used = new Set<string>();
  const visit = (e: MatrixExpression) => { if (e.kind === "input") used.add(e.name); else if (e.kind === "scale" || e.kind === "transpose") visit(e.input); else { visit(e.left); visit(e.right); } }; visit(expression);
  return { math: { kind: id.startsWith("determinant-") ? "determinant" : "matrix", expression }, matrices: matrices.filter((m) => used.has(m.label)) };
}
function overValue(a: ReturnType<typeof r>, b: ReturnType<typeof r>) { return r(a.numerator * b.denominator, a.denominator * b.numerator); }
export function makeHigherInstance(template: Descriptor, variant: number, difficulty: HigherDifficulty): HigherTask {
  if (!supportsHigher(template.id) || !higherDifficulties.includes(difficulty) || !Number.isInteger(variant) || variant < 0 || variant >= HIGHER_VARIANTS) throw new Error("Unsupported higher instance");
  const { math, matrices } = makeProblem(template.id, variant, difficulty);
  const derived = derive(math, matrices);
  let question: string, startingHint: string, nextHint: string;
  switch (math.kind) {
    case "numeric": question = `Oblicz dokładnie: ${expressionText(math.expression)}.`; startingHint = "Zacznij od wewnętrznych nawiasów, potem wykonaj mnożenie i dzielenie."; nextHint = "Ułamki zachowuj dokładnie. Odejmowany nawias traktuj jako całość; nie zmieniaj kolejności działań."; break;
    case "polynomial": question = math.at ? `Oblicz ${expressionText(math.expression)} dla x = ${f(math.at)}.` : `Rozwiń i uporządkuj ${expressionText(math.expression)}. Podaj współczynniki w opisanych polach.`; startingHint = math.at ? "Podstaw tę samą wartość do każdego x; zachowaj wszystkie nawiasy." : "Rozwiń każdy nawias, a dopiero potem połącz współczynniki przy tych samych potęgach x."; nextHint = "Minus przed nawiasem dotyczy każdego składnika. Kwadrat nawiasu zawiera także podwójny iloczyn."; break;
    case "linear": case "quadratic": question = `${math.kind === "linear" ? "Rozwiąż" : math.target === "delta" ? "Uprość do ax² + bx + c = 0 i oblicz Δ" : "Rozwiąż w liczbach rzeczywistych po uproszczeniu"}: ${expressionText(math.left)} = ${expressionText(math.right)}.`; startingHint = "Rozwiń obie strony równania i przenieś wyrazy na jedną stronę."; nextHint = math.kind === "linear" ? "Połącz współczynniki przy x, przenieś stałą i podziel przez niezerowy współczynnik." : "Deltę obliczaj z uporządkowanego równania, ze znakami a, b i c. Cały licznik wzoru na x dzielimy przez 2a."; break;
    case "monomial": question = `Dla x ≠ 0 uprość ((${f(math.a)})x^${math.p} · (${f(math.b)})x^${math.q}) ÷ ((${f(math.c)})x^${math.s})${math.combined ? ` + (${f(math.d)})x^${math.p+math.q-math.s}` : ""}. Podaj współczynnik i wykładnik x.`; startingHint = "Oddziel rachunek na współczynnikach od praw działań na potęgach."; nextHint = "Dodaj wykładniki przy mnożeniu, odejmij przy dzieleniu. Dopiero po uproszczeniu połącz jednomiany podobne."; break;
    default: question = `Oblicz ${math.kind === "determinant" ? `det(${matrixExpressionText(math.expression)})` : matrixExpressionText(math.expression)}.${math.kind === "matrix" ? " Wpisz całą macierz wynikową." : " Najpierw wykonaj działania wewnątrz wyznacznika."}`; startingHint = "Sprawdź wymiary i kolejność działań; transpozycja zamienia wiersze z kolumnami."; nextHint = "W iloczynie każde pole pochodzi z wiersza lewego czynnika i kolumny prawego. Dla wyznacznika odejmujemy całą drugą sumę.";
  }
  const contentKey = JSON.stringify({ question, matrices }, (_, value) => typeof value === "bigint" ? String(value) : value);
  return { ...derived, id: `${template.id}:${difficulty}:${variant}`, templateId: template.id, title: template.title, category: template.category, difficulty,
    parameters: { variant }, contentKey, question, startingHint, hint: startingHint, nextHint, errorRules: [], math, ...(matrices ? { matrices } : {}) };
}
const cache = new Map<string, readonly HigherTask[]>();
export function higherPool(category: CategoryId, difficulty: Difficulty, templates: readonly Descriptor[]): readonly HigherTask[] {
  if (!higherDifficulties.includes(difficulty as HigherDifficulty)) return [];
  const key = `${category}:${difficulty}`;
  if (!cache.has(key)) cache.set(key, templates.filter((t) => t.category === category && supportsHigher(t.id)).flatMap((t) => Array.from({ length: HIGHER_VARIANTS }, (_, v) => makeHigherInstance(t, v, difficulty as HigherDifficulty))));
  return cache.get(key)!;
}
