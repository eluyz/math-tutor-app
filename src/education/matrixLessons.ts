import { rational as r, addRational, equalRational } from "../rational";
import { formatRational as f } from "../answers";
import { addMatrices, subtractMatrices, scaleMatrix, transposeMatrix, multiplyMatrices, determinant, sarrusProducts, type Matrix } from "../matrices";
import { lesson, levelIndex, type EducationTemplate } from "./types";

function data(variant: number, difficulty: number, rows: number, columns: number, salt = 0): Matrix {
  const range = 3 + difficulty * 3;
  return Array.from({ length: rows }, (_, i) => Array.from({ length: columns }, (_, j) => {
    // Two bounded digits encode 24 distinct first rows, not 9 independent parameters.
    const numerator = i === 0 && j === 0 ? variant % 6 - 2 + salt
      : i === 0 && j === 1 ? Math.floor(variant / 6) - 1 - salt
      : ((variant * (i + j + 3) + i * 7 + j * 11 + salt * 13) % (2 * range + 1)) - range;
    return r(numerator, difficulty === 2 ? (i + j) % 2 + 2 : 1);
  }));
}
const coordinate = (i: number, j: number) => `c${"₁₂₃"[i]}${"₁₂₃"[j]}`;
const entries = (matrix: Matrix, detail: (i: number, j: number) => string) => matrix.flatMap((row, i) => row.map((_, j) => detail(i, j))).join("\n");
const matrixText = (matrix: Matrix) => `[${matrix.map((row) => row.map(f).join(", ")).join("; ")}]`;
function dimensions(variant: number, d: number) {
  return d === 0 ? { rows: 2, columns: 2 } : { rows: variant % 2 + 2, columns: variant % 2 === 0 ? 3 : 2 };
}
function shown(details: ReturnType<typeof lesson>, a: Matrix, b?: Matrix) {
  return { ...details, matrices: [{ label: "A", values: a }, ...(b ? [{ label: "B", values: b }] : [])] };
}

export const matrixTemplates: EducationTemplate[] = [
  { id: "matrix-dimensions", category: "matrices", title: "Wymiar macierzy", create: (v, level) => {
    const d = levelIndex(level), rows = 2 + v % 2, columns = 2 + Math.floor(v / 2) % 2, a = data(v, d, rows, columns);
    return shown(lesson({ rows, columns }, "Podaj wymiar macierzy A: najpierw liczbę wierszy, potem liczbę kolumn.",
      { kind: "list", values: [r(rows), r(columns)], labels: ["Liczba wierszy", "Liczba kolumn"] },
      `Policz poziome wiersze: ${rows}. Policz pionowe kolumny: ${columns}. Wymiar zapisujemy w tej kolejności: ${rows} × ${columns}. Macierz to prostokątna tablica liczb; wektor można zapisać jako macierz o jednym wierszu albo jednej kolumnie.`,
      "Wiersze biegną poziomo, kolumny pionowo. Kolejność wymiarów ma znaczenie.", "Pierwsza liczba opisuje wiersze, druga kolumny; nie liczymy wszystkich elementów jako wymiaru."), a);
  } },
  { id: "matrix-entry", category: "matrices", title: "Odczyt elementu aᵢⱼ", create: (v, level) => {
    const d = levelIndex(level), { rows, columns } = dimensions(v, d), a = data(v, d, rows, columns), i = v % rows + 1, j = Math.floor(v / 3) % columns + 1;
    return shown(lesson({ i, j, rows, columns }, `Odczytaj element a${"₁₂₃"[i - 1]}${"₁₂₃"[j - 1]} macierzy A. Indeksy liczymy od 1.`,
      { kind: "scalar", value: a[i - 1][j - 1] },
      `Pierwszy indeks i = ${i} oznacza wiersz, drugi j = ${j} kolumnę. Zaczynając od 1, wybierz wiersz ${i} i kolumnę ${j}; na przecięciu znajduje się ${f(a[i - 1][j - 1])}.`,
      "Najpierw znajdź wiersz wskazany pierwszym indeksem, potem kolumnę wskazaną drugim.", "Indeksy zaczynają się od 1, a nie od 0. Nie zamieniaj kolejności wiersza i kolumny."), a);
  } },
  ...(["add", "subtract"] as const).map((operation): EducationTemplate => ({
    id: `matrix-${operation}`, category: "matrices", title: operation === "add" ? "Dodawanie macierzy" : "Odejmowanie macierzy", create: (v, level) => {
      const d = levelIndex(level), { rows, columns } = dimensions(v, d), a = data(v, d, rows, columns), b = data(v, d, rows, columns, 2);
      const result = operation === "add" ? addMatrices(a, b) : subtractMatrices(a, b), sign = operation === "add" ? "+" : "−";
      return shown(lesson({ rows, columns }, `Oblicz A ${sign} B. Wpisz całą macierz wynikową.`, { kind: "matrix", values: result },
        `Obie macierze mają wymiar ${rows} × ${columns}, więc działanie jest wykonalne. Łączymy elementy w tych samych pozycjach:\n` +
        entries(result, (i, j) => `${coordinate(i, j)} = (${f(a[i][j])}) ${sign} (${f(b[i][j])}) = ${f(result[i][j])}.`),
        "Porównaj wymiary, a potem wykonaj działanie na odpowiadających sobie polach.", "Przy odejmowaniu ujemnego elementu odejmujesz całą liczbę w nawiasie: minus ujemnej liczby daje plus."), a, b);
    },
  })),
  { id: "matrix-scale", category: "matrices", title: "Macierz razy skalar", create: (v, level) => {
    const d = levelIndex(level), { rows, columns } = dimensions(v, d), a = data(v, d, rows, columns);
    const kN = v % 7 === 0 ? 0 : (v % 3 + 1) * (v % 2 ? -1 : 1), kD = d === 2 ? 2 : 1, k = r(kN, kD), result = scaleMatrix(a, k);
    return shown(lesson({ rows, columns, kN, kD }, `Oblicz (${f(k)})·A. Wpisz całą macierz wynikową.`, { kind: "matrix", values: result },
      `Skalar mnoży każdy element, a wymiar pozostaje ${rows} × ${columns}.\n` + entries(result, (i, j) => `${coordinate(i, j)} = (${f(k)})·(${f(a[i][j])}) = ${f(result[i][j])}.`),
      "Pomnóż każdy element macierzy przez tę samą liczbę; nie zmieniaj jego miejsca.", "Nie mnożymy tylko przekątnej — skalar dotyczy wszystkich pól, także ujemnych i zerowych."), a);
  } },
  { id: "matrix-transpose", category: "matrices", title: "Transpozycja Aᵀ", create: (v, level) => {
    const d = levelIndex(level), rows = v % 2 + 2, columns = rows === 2 ? 3 : 2, a = data(v, d, rows, columns), result = transposeMatrix(a);
    return shown(lesson({ rows, columns }, "Wyznacz Aᵀ. Wpisz całą macierz transponowaną.", { kind: "matrix", values: result },
      `Transpozycja zamienia wiersze z kolumnami: ${rows} × ${columns} przechodzi w ${columns} × ${rows}. Element z pozycji (j, i) macierzy A przechodzi na (i, j).\n` +
      entries(result, (i, j) => `${coordinate(i, j)} = a${"₁₂₃"[j]}${"₁₂₃"[i]} = ${f(a[j][i])}.`),
      "Pierwszy wiersz A stanie się pierwszą kolumną Aᵀ. Sprawdź nowy wymiar.", "Transpozycja nie zmienia znaków ani wartości elementów; zmienia wyłącznie ich pozycje."), a);
  } },
  { id: "matrix-product", category: "matrices", title: "Mnożenie macierzy AB", create: (v, level) => {
    const d = levelIndex(level), rows = d === 0 ? 2 : v % 2 + 2, inner = d === 0 ? 2 : rows === 2 ? 3 : 2;
    const a = data(v, d, rows, inner), b = data(v, d, inner, rows, 3), result = multiplyMatrices(a, b), reverse = multiplyMatrices(b, a);
    const same = result.length === reverse.length && result[0].length === reverse[0].length && result.every((row, i) => row.every((value, j) => equalRational(value, reverse[i][j])));
    return shown(lesson({ rows, inner, columns: rows }, "Oblicz AB w podanej kolejności. Wpisz całą macierz wynikową.", { kind: "matrix", values: result },
      `A ma wymiar ${rows} × ${inner}, B ma ${inner} × ${rows}. Wewnętrzne wymiary są równe (${inner}), a wynik ma ${rows} × ${rows}. Każde pole to iloczyn wiersza A i kolumny B, zsumowany po wspólnym indeksie:\n` +
      entries(result, (i, j) => `${coordinate(i, j)} = ${a[i].map((value, k) => `(${f(value)})·(${f(b[k][j])})`).join(" + ")} = ${f(result[i][j])}.`) +
      `\nDla porównania BA = ${matrixText(reverse)}. ${same ? "Dla tych danych AB = BA, ale nie jest to ogólna reguła." : "Tutaj AB ≠ BA. Zmiana kolejności zmienia wynik lub jego wymiar."}`,
      "Sprawdź liczbę kolumn A i wierszy B. Dla każdego pola połącz wiersz A z kolumną B.", "Mnożenie macierzy nie jest mnożeniem odpowiadających sobie pól. Potrzebujesz sumy iloczynów; nie zakładaj AB = BA."), a, b);
  } },
  { id: "determinant-two", category: "determinants", title: "Wyznacznik 2×2", create: (v, level) => {
    let a = data(v, levelIndex(level), 2, 2);
    if (v % 4 === 0) a = [a[0], scaleMatrix([a[0]], r(2))[0]];
    const result = determinant(a);
    return shown(lesson({}, "Oblicz det(A) dla macierzy 2×2.", { kind: "scalar", value: result },
      `Dla macierzy [[a,b],[c,d]] wyznacznik to ad − bc. Tutaj det(A) = (${f(a[0][0])})·(${f(a[1][1])}) − (${f(a[0][1])})·(${f(a[1][0])}) = ${f(result)}. Odejmujemy cały drugi iloczyn, także jeśli jest ujemny.`,
      "Pomnóż elementy głównej przekątnej i odejmij iloczyn drugiej przekątnej.", "Zapisz ad − bc z nawiasami wokół liczb ujemnych. Wyznacznik jest pojedynczą liczbą, a nie macierzą."), a);
  } },
  { id: "determinant-sarrus", category: "determinants", title: "Wyznacznik 3×3 — Sarrus", create: (v, level) => {
    let a = data(v, levelIndex(level), 3, 3);
    if (v % 4 === 0) a = [a[0], a[1], [...a[0]]];
    const result = determinant(a), products = sarrusProducts(a);
    const triples = [[0, 1, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0], [0, 2, 1], [1, 0, 2]];
    const steps = triples.map((indices, k) => `${k < 3 ? "↘" : "↗"} ${indices.map((j, i) => `(${f(a[i][j])})`).join("·")} = ${f([...products.positive, ...products.negative][k])}.`).join("\n");
    const positive = products.positive.reduce(addRational, r(0)), negative = products.negative.reduce(addRational, r(0));
    return shown(lesson({}, "Oblicz det(A) regułą Sarrusa (3×3).", { kind: "scalar", value: result },
      `Sarrus dla 3×3: dodaj trzy iloczyny ↘ i odejmij sumę trzech iloczynów ↗.\n${steps}\nSuma ↘ = ${f(positive)}, suma ↗ = ${f(negative)}. det(A) = (${f(positive)}) − (${f(negative)}) = ${f(result)}. Reguła Sarrusa w tej postaci nie działa dla większych macierzy.`,
      "Przygotuj sześć iloczynów po trzy elementy: trzy w dół i trzy w górę.", "Odejmij całą sumę trzech iloczynów w górę. Ujemne elementy zachowują swoje znaki w każdym iloczynie."), a);
  } },
  { id: "determinant-zero-row", category: "determinants", title: "Wyznacznik — zerowy wiersz", create: (v, level) => {
    const original = data(v, levelIndex(level), 3, 3), a = [original[0], original[1], [r(0), r(0), r(0)]];
    return shown(lesson({}, "Oblicz det(A), korzystając z najprostszej własności widocznej macierzy.", { kind: "scalar", value: r(0) },
      "Trzeci wiersz składa się wyłącznie z zer. Przy rozwinięciu wyznacznika według tego wiersza każdy składnik zawiera mnożnik 0. Zatem det(A) = 0. Nie trzeba obliczać sześciu iloczynów Sarrusa.",
      "Przed rozpoczęciem długich rachunków obejrzyj wszystkie wiersze i kolumny.", "Sprawdź, czy któryś cały wiersz lub kolumna składa się z zer; pojedyncze zero nie wystarcza do takiego wniosku."), a);
  } },
];
