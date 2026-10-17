import type { Operator } from "../advanced/schema";
const plReasons = {
  sum: "Dodajemy składniki po wykonaniu działań w nawiasach i mnożenia.",
  difference: "Odejmujemy cały drugi składnik, zachowując jego znak.",
  product: "Mnożymy dokładne ułamki, pilnując znaków i skracania.",
  quotient:
    "Dzielimy przez niezerową liczbę, czyli mnożymy przez jej odwrotność.",
};
const enReasons = {
  sum: "Add the terms after evaluating brackets and multiplication.",
  difference: "Subtract the entire second term, keeping its sign.",
  product: "Multiply exact fractions, keeping their signs and reducing them.",
  quotient: "Divide by a nonzero number by multiplying by its reciprocal.",
};
export const mathCopy = {
  pl: {
    power: (e: string) =>
      [
        `Oblicz potęgę ${e}`,
        "Potęga to iloczyn jednakowych czynników; nawias zachowuje znak podstawy.",
      ] as const,
    numeric: (e: string, op: Operator) =>
      [`Oblicz ${e}`, plReasons[op]] as const,
    coefficient: (n: number, e: string, op: Operator) =>
      [
        `Współczynnik przy x^${n} w ${e}`,
        op === "product"
          ? "Każdy składnik pierwszego nawiasu mnożymy przez każdy drugiego; wykładniki dodajemy i łączymy wyrazy tej samej potęgi."
          : op === "quotient"
            ? plReasons.quotient
            : "Łączymy współczynniki przy tej samej potędze x, z uwzględnieniem znaku działania.",
      ] as const,
    transpose: (e: string, shape: string) =>
      [
        `Transponuj ${e}: ${shape}`,
        "Wiersze stają się kolumnami; wartości i znaki pozostają takie same.",
      ] as const,
    transposedCell: (e: string) =>
      [
        e,
        "Przenosimy element na pozycję o zamienionych indeksach, licząc od 1.",
      ] as const,
    matrix: (e: string, shape: string, inner?: number) =>
      [
        `Oblicz ${e}; wynik ma wymiar ${shape}`,
        inner === undefined
          ? "Skalar zachowuje wymiar, a suma i różnica wymagają jednakowych wymiarów."
          : `Kolumny lewego czynnika (${inner}) odpowiadają wierszom prawego (${inner}). Kolejności mnożenia nie wolno zmieniać.`,
      ] as const,
    productCell: (e: string, i: number, j: number) =>
      [
        `W ${e}: c(${i},${j}), wiersz ${i} × kolumna ${j}`,
        "Mnożymy kolejne elementy wiersza przez elementy kolumny i dodajemy wszystkie iloczyny.",
      ] as const,
    cell: (e: string, i: number, j: number, scale: boolean) =>
      [
        `W ${e}: element (${i},${j})`,
        scale
          ? "Skalar mnoży każdy element, także zero i ułamki."
          : "Łączymy elementy na tych samych pozycjach, z zachowaniem znaków.",
      ] as const,
    det2: [
      "Dla otrzymanej macierzy 2×2 oblicz ad − bc",
      "Wyznacznik jest liczbą: odejmujemy cały iloczyn drugiej przekątnej.",
    ] as const,
    sarrus: (k: number, indices: string) =>
      [
        `${k < 3 ? "+ ↘" : "− ↗"} Iloczyn ${k + 1}: ${indices}`,
        k < 3
          ? "Ten iloczyn dodajemy do pierwszej sumy Sarrusa dla 3×3."
          : "Ten iloczyn należy do drugiej sumy Sarrusa, którą w całości odejmiemy.",
      ] as const,
    det3: [
      "Dodaj trzy iloczyny ↘ i odejmij całą sumę ↗",
      "Nawias wokół drugiej sumy zachowuje właściwe znaki wszystkich sześciu składników.",
    ] as const,
    delta: (a: string, b: string, c: string) =>
      [
        `Oblicz Δ = b² − 4ac dla a = ${a}, b = ${b}, c = ${c}`,
        "Współczynniki odczytujemy dopiero po uporządkowaniu równania i przeniesieniu wszystkich wyrazów na jedną stronę.",
      ] as const,
    noRoots: [
      "Δ < 0: brak pierwiastków rzeczywistych",
      "Pierwiastek kwadratowy z ujemnej delty nie jest liczbą rzeczywistą.",
    ] as const,
    doubleRoot: [
      "Δ = 0: jeden pierwiastek podwójny x₀ = −b/(2a)",
      "Oba znaki we wzorze prowadzą do tej samej wartości.",
    ] as const,
    sqrt: (s: string) =>
      [
        `Δ > 0: dwa pierwiastki; √Δ = ${s}`,
        "Sprawdzamy dokładny pierwiastek przez podniesienie do kwadratu.",
      ] as const,
    root: (minus: boolean) =>
      [
        minus ? "Oblicz x₁ = (−b − √Δ)/(2a)" : "Oblicz x₂ = (−b + √Δ)/(2a)",
        "Cały licznik dzielimy przez 2a; nie rozdzielamy mianownika pomiędzy wybrane składniki.",
      ] as const,
    substitute: (x: string) =>
      [
        `Podstaw x = ${x} do całego wyrażenia`,
        "Każde wystąpienie x zastępujemy tą samą wartością, zachowując nawiasy.",
      ] as const,
    linear: (a: string, b: string) =>
      [
        `Po zebraniu wyrazów: (${a})x = ${b}`,
        "Przenosimy stałą na drugą stronę i dzielimy obie strony przez niezerowy współczynnik przy x.",
      ] as const,
    standard: (a: string, b: string, c: string) =>
      [
        `Uporządkuj: (${a})x² + (${b})x + (${c}) = 0`,
        "Przeniesienie wszystkich wyrazów na jedną stronę zachowuje zbiór rozwiązań.",
      ] as const,
    factor: [
      "Zauważ różnicę kwadratów U² − V² = (U − V)(U + V)",
      "Po rozłożeniu iloczyn jest zerem, gdy jeden z czynników jest zerem; delta daje równoważną kontrolę otrzymanych pierwiastków.",
    ] as const,
    monomialProduct: [
      "Pomnóż współczynniki liczbowe",
      "Część liczbowa iloczynu powstaje przez mnożenie współczynników ze znakami.",
    ] as const,
    monomialDivide: (c: string) =>
      [
        `Podziel współczynnik przez (${c})`,
        "Dla x ≠ 0 można podzielić przez wskazany jednomian; dzielnik liczbowy również jest niezerowy.",
      ] as const,
    exponents: (p: number, q: number, s: number, e: number) =>
      [
        `x^${p}·x^${q} ÷ x^${s} = x^${e}`,
        "Przy mnożeniu potęg dodajemy wykładniki, a przy dzieleniu odejmujemy.",
      ] as const,
    likeTerms: [
      "Połącz otrzymany jednomian z drugim jednomianem",
      "Wyrazy mają już tę samą potęgę x, więc dodajemy ich współczynniki.",
    ] as const,
    final: [
      "Poprawna odpowiedź",
      "Wynik wynika z kolejnych działań, z zachowaniem znaków, wymiarów i dokładnych ułamków.",
    ] as const,
    coefficients: [
      "Współczynnik przy x²",
      "Współczynnik przy x",
      "Wyraz wolny",
    ],
    monomialLabels: ["Współczynnik", "Wykładnik x"],
    differenceSides: "lewa strona − prawa strona",
  },
  en: {
    power: (e: string) =>
      [
        `Evaluate the power ${e}`,
        "A power is a product of equal factors; brackets keep the sign of the base.",
      ] as const,
    numeric: (e: string, op: Operator) =>
      [`Calculate ${e}`, enReasons[op]] as const,
    coefficient: (n: number, e: string, op: Operator) =>
      [
        `Coefficient of x^${n} in ${e}`,
        op === "product"
          ? "Multiply every term in the first bracket by every term in the second. Add exponents and collect equal powers."
          : op === "quotient"
            ? enReasons.quotient
            : "Combine coefficients of the same power, keeping the sign of the operation.",
      ] as const,
    transpose: (e: string, shape: string) =>
      [
        `Transpose ${e}: ${shape}`,
        "Rows become columns; values and signs stay the same.",
      ] as const,
    transposedCell: (e: string) =>
      [e, "Swap the row and column indices, counting from 1."] as const,
    matrix: (e: string, shape: string, inner?: number) =>
      [
        `Calculate ${e}; the result has size ${shape}`,
        inner === undefined
          ? "Scaling keeps the size; addition and subtraction require equal sizes."
          : `The left factor has ${inner} columns and the right factor has ${inner} rows. Do not change the order of multiplication.`,
      ] as const,
    productCell: (e: string, i: number, j: number) =>
      [
        `In ${e}: c(${i},${j}), row ${i} × column ${j}`,
        "Multiply corresponding entries of the row and column, then add all products.",
      ] as const,
    cell: (e: string, i: number, j: number, scale: boolean) =>
      [
        `In ${e}: entry (${i},${j})`,
        scale
          ? "The scalar multiplies every entry, including zero and fractions."
          : "Combine entries in matching positions, keeping their signs.",
      ] as const,
    det2: [
      "For the resulting 2×2 matrix, calculate ad − bc",
      "A determinant is a number: subtract the entire product of the other diagonal.",
    ] as const,
    sarrus: (k: number, indices: string) =>
      [
        `${k < 3 ? "+ ↘" : "− ↗"} Product ${k + 1}: ${indices}`,
        k < 3
          ? "Add this product to the first sum in Sarrus' rule for 3×3."
          : "This product belongs to the second sum, which we subtract in its entirety.",
      ] as const,
    det3: [
      "Add the three ↘ products and subtract the whole ↗ sum",
      "Brackets around the second sum keep the correct signs of all six terms.",
    ] as const,
    delta: (a: string, b: string, c: string) =>
      [
        `Calculate Δ = b² − 4ac with a = ${a}, b = ${b}, c = ${c}`,
        "Read the coefficients only after simplifying and moving all terms to one side.",
      ] as const,
    noRoots: [
      "Δ < 0: no real roots",
      "The square root of a negative discriminant is not a real number.",
    ] as const,
    doubleRoot: [
      "Δ = 0: one repeated root x₀ = −b/(2a)",
      "Both signs in the formula give the same value.",
    ] as const,
    sqrt: (s: string) =>
      [
        `Δ > 0: two distinct roots; √Δ = ${s}`,
        "Check the exact square root by squaring it.",
      ] as const,
    root: (minus: boolean) =>
      [
        minus
          ? "Calculate x₁ = (−b − √Δ)/(2a)"
          : "Calculate x₂ = (−b + √Δ)/(2a)",
        "Divide the entire numerator by 2a, rather than only some of its terms.",
      ] as const,
    substitute: (x: string) =>
      [
        `Substitute x = ${x} throughout the expression`,
        "Replace every occurrence of x with the same value and keep all brackets.",
      ] as const,
    linear: (a: string, b: string) =>
      [
        `After collecting terms: (${a})x = ${b}`,
        "Move the constant to the other side and divide both sides by the nonzero coefficient of x.",
      ] as const,
    standard: (a: string, b: string, c: string) =>
      [
        `Write in standard form: (${a})x² + (${b})x + (${c}) = 0`,
        "Moving all terms to one side preserves the solution set.",
      ] as const,
    factor: [
      "Use the difference of squares U² − V² = (U − V)(U + V)",
      "A product is zero if either factor is zero. The discriminant provides an equivalent check of the roots.",
    ] as const,
    monomialProduct: [
      "Multiply the numerical coefficients",
      "Multiply the signed coefficients to obtain the numerical part of the product.",
    ] as const,
    monomialDivide: (c: string) =>
      [
        `Divide the coefficient by (${c})`,
        "For x ≠ 0, division by the stated monomial is allowed; its numerical coefficient is also nonzero.",
      ] as const,
    exponents: (p: number, q: number, s: number, e: number) =>
      [
        `x^${p}·x^${q} ÷ x^${s} = x^${e}`,
        "Add exponents when multiplying powers and subtract them when dividing.",
      ] as const,
    likeTerms: [
      "Combine the resulting monomial with the other monomial",
      "Both terms now have the same power of x, so add their coefficients.",
    ] as const,
    final: [
      "Correct answer",
      "The result follows from the preceding operations, keeping signs, sizes and exact fractions.",
    ] as const,
    coefficients: ["Coefficient of x²", "Coefficient of x", "Constant term"],
    monomialLabels: ["Coefficient", "Exponent of x"],
    differenceSides: "left side − right side",
  },
};
