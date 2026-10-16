import type { Rational } from "../rational";
import { rational as r, addRational, subtractRational, multiplyRational, divideRational } from "../rational";
import { formatRational as f, type AnswerSpec } from "../answers";
import { getAnswerSpec } from "../exercises";
import type { GeneratedTask } from "../generators";
import type { Matrix } from "../matrices";

export type Calculation = Readonly<{ operation: "sum" | "difference" | "product" | "quotient"; operands: readonly Rational[]; result: Rational }>;
export type SolutionStep = Readonly<{ kind: "working"; action: string; reason: string; calculations: readonly Calculation[] }>
  | Readonly<{ kind: "answer"; action: string; reason: string; answer: AnswerSpec }>;
export type Solution = readonly [SolutionStep, ...SolutionStep[]];
const operators = { sum: addRational, difference: subtractRational, product: multiplyRational, quotient: divideRational };
export function calculate(operation: Calculation["operation"], ...operands: Rational[]): Calculation {
  if (operands.length < 2) throw new Error("A calculation needs two operands");
  return { operation, operands, result: operands.slice(1).reduce(operators[operation], operands[0]) };
}
export function calculationText(c: Calculation): string {
  const sign = { sum: " + ", difference: " − ", product: " × ", quotient: " ÷ " }[c.operation];
  return `${c.operands.map((v) => `(${f(v)})`).join(sign)} = ${f(c.result)}`;
}
/** Every branch constructs mathematical stages from parameters, never from explanation prose. */
export function solutionFor(task: GeneratedTask): Solution {
  const steps: SolutionStep[] = [];
  const working = (action: string, reason: string, ...calculations: Calculation[]) => { steps.push({ kind: "working", action, reason, calculations }); };
  const calc = (operation: Calculation["operation"], ...numbers: number[]) => calculate(operation, ...numbers.map((v) => r(v)));
  const spec = getAnswerSpec(task);
  const scalar = (value: Rational): AnswerSpec => ({ kind: "scalar", value });
  const list = (values: readonly Rational[]): AnswerSpec => ({ kind: "list", values, labels: spec.kind === "list" ? spec.labels : [] });
  const choice = (value: string): AnswerSpec => {
    if (spec.kind !== "choice") throw new Error("Choice expected");
    return { kind: "choice", value, options: spec.options };
  };
  const finish = (answer: AnswerSpec): Solution => {
    if (!steps.length) throw new Error("A solution needs working before its answer");
    return [steps[0], ...steps.slice(1), { kind: "answer", action: "Poprawna odpowiedź", reason: "Po wykonaniu powyższych działań otrzymujemy wynik w wymaganym układzie.", answer }];
  };
  const { a, b, c, x, k, p, q, offset, s, xN, xD, sign } = task.parameters;
  const id = task.templateId;
  switch (id) {
    case "order-add-product": case "order-subtract-product": {
      const product = calc("product", b, c);
      working("Oblicz mnożenie", "Mnożenie ma pierwszeństwo przed dodawaniem i odejmowaniem.", product);
      const result = calculate(id === "order-add-product" ? "sum" : "difference", r(a), product.result);
      working("Dokończ działanie", "Zastępujemy iloczyn jego wartością.", result);
      return finish(scalar(result.result));
    }
    case "order-parentheses": {
      const sum = calc("sum", a, b); working("Oblicz nawias", "Nawias wyznacza pierwsze działanie.", sum);
      const product = calculate("product", sum.result, r(c)); working("Pomnóż wynik nawiasu", "Mnożnik dotyczy całego nawiasu.", product);
      return finish(scalar(product.result));
    }
    case "signed-add": {
      working(`Porównaj wartości bezwzględne: |−${a}| = ${a}, |${b}| = ${b}`, "Przy różnych znakach odejmujemy wartości bezwzględne, a znak wybieramy według składnika o większej wartości bezwzględnej.", calc("difference", Math.max(a, b), Math.min(a, b)));
      const sum = calc("sum", -a, b);
      working(b === a ? "Równe wartości bezwzględne dają zero" : `Wybierz znak składnika ${b > a ? b : `−${a}`}`, "Znak zależy od wartości bezwzględnej składnika, nie od tego, która liczba jest większa.", sum);
      return finish(scalar(sum.result));
    }
    case "signed-subtract-negative": {
      working(`Zamień odjęcie (−${b}) na dodanie ${b}`, "Odejmowanie liczby to dodawanie liczby do niej przeciwnej.");
      const sum = calc("sum", a, b); working("Dodaj liczby ze znakami", "Po zmianie działania zachowujemy znak pierwszego składnika.", sum);
      return finish(scalar(sum.result));
    }
    case "signed-product": {
      const first = calc("product", -a, b); working("Pomnóż dwa pierwsze czynniki", "Iloczyn liczby ujemnej i dodatniej jest ujemny.", first);
      const last = calculate("product", first.result, r(c)); working(`Uwzględnij czynnik ${c}`, "Dwie liczby ujemne dają dodatni iloczyn; mnożenie przez 1 zachowuje wynik.", last);
      return finish(scalar(last.result));
    }
    case "fraction-add": case "fraction-subtract": {
      working(`Rozszerz oba ułamki do mianownika ${a * b}`, "Mnożymy licznik i mianownik przez tę samą niezerową liczbę, więc wartość ułamka nie zmienia się.", calc("product", p, b), calc("product", q, a), calc("product", a, b));
      const numerator = calc(id === "fraction-add" ? "sum" : "difference", p * b, q * a);
      working("Wykonaj działanie na licznikach", "Przy wspólnym mianowniku mianownik pozostaje ten sam.", numerator);
      const result = calculate("quotient", numerator.result, r(a * b));
      working("Skróć wynik", "Dzielimy licznik i mianownik przez ich wspólny dzielnik.", result);
      return finish(scalar(result.result));
    }
    case "fraction-product": {
      working("Pomnóż liczniki i mianowniki", "Przy mnożeniu ułamków nie trzeba wspólnego mianownika.", calc("product", p, q), calc("product", a, b));
      const result = calc("quotient", p * q, a * b); working("Zapisz dokładny, skrócony ułamek", "Skracanie zachowuje wartość ułamka.", result); return finish(scalar(result.result));
    }
    case "algebra-substitute": {
      working(`Podstaw x = ${x} i oblicz kwadrat oraz iloczyn`, "x² oznacza x razy x. Ujemne x zapisujemy w nawiasie.", calc("product", x, x), calc("product", k, x));
      const sum = calc("sum", x * x, k * x); working("Dodaj składniki", "Po obliczeniu potęgi i iloczynu wykonujemy dodawanie.", sum); return finish(scalar(sum.result));
    }
    case "algebra-like-terms": {
      working(`Połącz ${a}x + ${b}x = (${a} + ${b})x`, "Jednomiany podobne mają tę samą część literową; dodajemy współczynniki.", calc("sum", a, b));
      const result = calc("product", a + b, x); working(`Podstaw x = ${x}`, "Współczynnik mnożymy przez podaną wartość x.", result); return finish(scalar(result.result));
    }
    case "algebra-distribute": {
      working(`${a}(x + ${b}) = ${a}x + ${a * b}`, "Mnożenie rozdzielamy na każdy składnik nawiasu.", calc("product", a, b));
      working(`Podstaw x = ${x}`, "Obliczamy każdy składnik osobno.", calc("product", a, x));
      const result = calc("sum", a * x, a * b); working("Dodaj składniki", "Po podstawieniu otrzymujemy wyrażenie liczbowe.", result); return finish(scalar(result.result));
    }
    case "equation-add": case "equation-subtract": {
      const rhs = a * x + (id === "equation-add" ? b : -b);
      const balanced = calc(id === "equation-add" ? "difference" : "sum", rhs, b);
      working(`${id === "equation-add" ? "Odejmij" : "Dodaj"} ${b} po obu stronach`, "Ta sama operacja po obu stronach zachowuje równość.", balanced);
      const result = calculate("quotient", balanced.result, r(a)); working(`Podziel obie strony przez ${a}`, "Współczynnik przy x jest niezerowy.", result); return finish(scalar(result.result));
    }
    case "equation-fraction": case "equation-fraction-balance": {
      const divisor = id === "equation-fraction" ? a : s;
      const target = id === "equation-fraction" ? r(a * k + offset) : r(xN, xD);
      const added = id === "equation-fraction" ? r(b) : r(p, q);
      const rhs = addRational(divideRational(target, r(divisor)), added);
      const balanced = calculate("difference", rhs, added);
      working(`Odejmij (${f(added)}) po obu stronach`, "Izolujemy iloraz zawierający x, zachowując równość.", balanced);
      const result = calculate("product", balanced.result, r(divisor)); working(`Pomnóż obie strony przez ${divisor}`, "Usuwamy niezerowy mianownik przy x.", result); return finish(scalar(result.result));
    }
    case "algebra-negative-brackets": {
      working(`${a}(x + (${b})) = (${a})x + (${a})·(${b})`, "Mnożnik przed nawiasem dotyczy obu składników. Dwa minusy w iloczynie dają plus.", calc("product", a, 1), calc("product", a, b));
      return finish(list([r(a), r(a * b)]));
    }
    case "algebra-monomials": {
      working("Pomnóż współczynniki", "Część liczbowa jest iloczynem współczynników.", calc("product", a, b));
      working(`Połącz x^${p} · x^${q} = x^(${p}+${q})`, "Przy mnożeniu potęg o tej samej podstawie dodajemy wykładniki.", calc("sum", p, q));
      return finish(list([r(a * b), r(p + q)]));
    }
    case "algebra-polynomial-product": {
      working(`(${a}x + (${b}))(x + (${c})) = ${a}x² + (${a * c})x + (${b})x + (${b * c})`, "Każdy składnik pierwszego nawiasu mnożymy przez każdy drugiego: otrzymujemy cztery iloczyny.", calc("product", a, 1), calc("product", a, c), calc("product", b, 1), calc("product", b, c));
      working("Połącz współczynniki przy x", "Łączymy tylko wyrazy o tej samej potędze x.", calc("sum", a * c, b));
      return finish(list([r(a), r(a * c + b), r(b * c)]));
    }
    case "quadratic-square-sum": case "quadratic-square-difference": {
      working(`Zastosuj (u ${sign === 1 ? "+" : "−"} v)² = u² ${sign === 1 ? "+" : "−"} 2uv + v²; u = ${a}x, v = ${b}`, "Kwadrat nawiasu zawiera także podwójny iloczyn; kwadrat drugiego składnika jest dodatni.");
      working("Oblicz trzy współczynniki", "Kwadrat ax daje a²x²; środkowy składnik ma znak ze wzoru.", calc("product", a, a), calc("product", sign, 2, a, b), calc("product", b, b));
      return finish(list([r(a * a), r(sign * 2 * a * b), r(b * b)]));
    }
    case "quadratic-difference-squares": {
      working(`Przyjmij u = ${a}x oraz v = ${b}`, "Różnica dwóch kwadratów rozkłada się jako u² − v² = (u − v)(u + v).");
      working(`(${a}x − ${b})(${a}x + ${b}) = ${a * a}x² + ${a * b}x − ${a * b}x − ${b * b}`, "Wyrazy mieszane mają przeciwne współczynniki, więc ich suma wynosi zero.", calc("sum", a * b, -a * b));
      return finish(choice("product"));
    }
    case "quadratic-discriminant": case "quadratic-delta-sign": case "quadratic-roots": {
      working(`Odczytaj a = ${a}, b = ${b}, c = ${c}`, "Współczynniki odczytujemy wraz ze znakami. a ≠ 0 oznacza równanie kwadratowe.");
      working("Oblicz b² i 4ac", "Δ = b² − 4ac. Ujemne b podnosimy do kwadratu w nawiasie.", calc("product", b, b), calc("product", 4, a, c));
      const delta = b * b - 4 * a * c;
      working("Odejmij cały iloczyn 4ac", "Także ujemny iloczyn odejmujemy jako całą liczbę.", calc("difference", b * b, 4 * a * c));
      let roots: Rational[] = [];
      if (delta < 0) working("Δ < 0: brak pierwiastków rzeczywistych", "Kwadrat liczby rzeczywistej nie jest ujemny, więc √Δ nie jest liczbą rzeczywistą.");
      else if (delta === 0) {
        const root = calc("quotient", -b, 2 * a); roots = [root.result];
        working("Δ = 0: jeden pierwiastek podwójny x₀ = −b/(2a)", "Oba znaki we wzorze dają tę samą wartość, bo √Δ = 0.", root);
      } else {
        const sqrt = Math.sqrt(delta);
        if (!Number.isInteger(sqrt)) throw new Error("This family requires an exact square discriminant");
        working(`Δ > 0: dwa różne pierwiastki; √Δ = ${sqrt}`, "Sprawdzamy pierwiastek z delty przez podniesienie do kwadratu.", calc("product", sqrt, sqrt));
        const lower = calc("quotient", -b - sqrt, 2 * a), upper = calc("quotient", -b + sqrt, 2 * a);
        roots = [lower.result, upper.result];
        working(`x₁ = (−b − √Δ)/(2a), x₂ = (−b + √Δ)/(2a); −b = ${-b}, 2a = ${2 * a}`, "Cały licznik dzielimy przez 2a. Dwa różne znaki dają dwa pierwiastki.", calc("difference", -b, sqrt), calc("sum", -b, sqrt), lower, upper);
      }
      return finish(id === "quadratic-discriminant" ? scalar(r(delta)) : id === "quadratic-delta-sign" ? choice(delta < 0 ? "none" : delta === 0 ? "double" : "two") : { kind: "roots", values: roots });
    }
  }
  const matrices = "matrices" in task ? task.matrices : undefined;
  if (!matrices?.length) throw new Error(`Missing solution family: ${id}`);
  const A = matrices[0].values, B = matrices[1]?.values;
  const rows = A.length, columns = A[0].length;
  switch (id) {
    case "matrix-dimensions":
      working(`Policz poziome wiersze: ${rows}`, "Wiersz biegnie poziomo; numerujemy wiersze od 1.");
      working(`Policz pionowe kolumny: ${columns}`, "Wymiar zapisujemy: liczba wierszy × liczba kolumn.");
      return finish(list([r(rows), r(columns)]));
    case "matrix-entry": {
      const { i, j } = task.parameters;
      working(`Znajdź wiersz ${i}`, "Pierwszy indeks oznacza wiersz, licząc od 1.");
      working(`W wierszu ${i} wybierz kolumnę ${j}: a(${i},${j}) = ${f(A[i - 1][j - 1])}`, "Drugi indeks oznacza kolumnę; szukamy przecięcia wiersza i kolumny.");
      return finish(scalar(A[i - 1][j - 1]));
    }
    case "matrix-add": case "matrix-subtract": case "matrix-scale": case "matrix-transpose": case "matrix-product": {
      const transpose = id === "matrix-transpose", product = id === "matrix-product";
      const outRows = transpose ? columns : rows, outColumns = transpose ? rows : product ? B![0].length : columns;
      working(product ? `A: ${rows} × ${columns}, B: ${B!.length} × ${outColumns}; wynik: ${outRows} × ${outColumns}` : `Wymiar wyniku: ${outRows} × ${outColumns}`,
        product ? "Liczba kolumn A musi być równa liczbie wierszy B. Nie zakładamy AB = BA." : transpose ? "Transpozycja zamienia wiersze z kolumnami." : "Dodawanie i odejmowanie wymaga równych wymiarów; skalar zachowuje wymiar.");
      const result: Matrix = Array.from({ length: outRows }, (_, i) => Array.from({ length: outColumns }, (_, j) => {
        if (transpose) { working(`c(${i + 1},${j + 1}) = a(${j + 1},${i + 1}) = ${f(A[j][i])}`, "Przenosimy element bez zmiany wartości z pozycji (j,i) na (i,j)."); return A[j][i]; }
        if (product) {
          const products = A[i].map((v, index) => calculate("product", v, B![index][j]));
          const sum = calculate("sum", ...products.map((v) => v.result));
          working(`c(${i + 1},${j + 1}): wiersz ${i + 1} macierzy A × kolumna ${j + 1} macierzy B`, "Mnożymy odpowiadające sobie elementy wiersza i kolumny, następnie sumujemy iloczyny.", ...products, sum);
          return sum.result;
        }
        const operation = id === "matrix-scale" ? calculate("product", r(task.parameters.kN, task.parameters.kD), A[i][j])
          : calculate(id === "matrix-add" ? "sum" : "difference", A[i][j], B![i][j]);
        working(`Oblicz c(${i + 1},${j + 1})`, id === "matrix-scale" ? "Skalar mnoży każdy element macierzy, także zero i liczby ujemne." : "Łączymy elementy w tym samym wierszu i kolumnie; zachowujemy ich znaki.", operation);
        return operation.result;
      }));
      return finish({ kind: "matrix", values: result });
    }
    case "determinant-two": {
      working("Zastosuj det(A) = a₁₁a₂₂ − a₁₂a₂₁", "Dla macierzy 2×2 odejmujemy iloczyn drugiej przekątnej od iloczynu głównej przekątnej.");
      const main = calculate("product", A[0][0], A[1][1]), other = calculate("product", A[0][1], A[1][0]);
      working("Oblicz dwa iloczyny", "Każdą liczbę ujemną traktujemy jako cały czynnik.", main, other);
      const result = calculate("difference", main.result, other.result); working("Odejmij drugi iloczyn", "Odejmujemy całą liczbę, nawet jeśli jest ujemna.", result); return finish(scalar(result.result));
    }
    case "determinant-sarrus": {
      working("Zastosuj Sarrusa wyłącznie dla 3×3", "Dodajemy trzy iloczyny ↘ i odejmujemy sumę trzech iloczynów ↗.");
      const indices = [[0, 1, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0], [0, 2, 1], [1, 0, 2]];
      const products = indices.map((js, index) => {
        const product = calculate("product", ...js.map((j, i) => A[i][j]));
        working(`${index < 3 ? "+ ↘" : "− ↗"} Iloczyn ${index + 1}: ${js.map((j, i) => `a(${i + 1},${j + 1})`).join("·")}`, index < 3 ? "Ten iloczyn dodajemy do sumy ↘; zachowujemy znaki czynników." : "Ten iloczyn należy do sumy ↗, którą w całości odejmiemy.", product);
        return product.result;
      });
      const positive = calculate("sum", ...products.slice(0, 3)), negative = calculate("sum", ...products.slice(3));
      working("Oblicz obie sumy przekątnych", "Oddzielamy trzy składniki dodawane od trzech odejmowanych.", positive, negative);
      const result = calculate("difference", positive.result, negative.result); working("Odejmij sumę ↗ od sumy ↘", "Nawias obejmuje całą drugą sumę.", result); return finish(scalar(result.result));
    }
    case "determinant-zero-row":
      working("Trzeci wiersz składa się wyłącznie z zer", "Sprawdzamy cały wiersz, a nie pojedynczy zerowy element.");
      working("Rozwiń wyznacznik według trzeciego wiersza", "Każdy składnik zawiera mnożnik 0: 0·M₃₁ − 0·M₃₂ + 0·M₃₃ = 0.");
      return finish(scalar(r(0)));
    default: throw new Error(`Missing solution family: ${id}`);
  }
}
