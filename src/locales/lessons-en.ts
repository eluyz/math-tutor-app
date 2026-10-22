import { rational as r, addRational as add } from "../rational";
import type { GeneratedTask } from "../generators";
import type { AnswerSpec } from "../answers";
import { formatRational as f } from "../answers";
import { getAnswerSpec } from "../exercises";
import { solutionFor, calculationText } from "../solutions/model";
import type { Solution } from "../solutions/types";
import type { HigherTask } from "../advanced/catalog";
import { isUniversityTask, localizeUniversity } from "../university/catalog";
import {
  derive,
  expressionText,
  matrixExpressionText,
} from "../advanced/engine";

/** Authored English lesson text. These functions do not translate strings at runtime. */
export const familyEnglish: Record<string, readonly [string, string, string]> =
  {
    "order-add-product": [
      "Multiplication first",
      "Multiplication takes priority over addition.",
      "Evaluate products before adding the remaining terms.",
    ],
    "order-subtract-product": [
      "Multiplication before subtraction",
      "Calculate products before subtracting.",
      "Subtract the entire product, including its sign.",
    ],
    "order-parentheses": [
      "Brackets first",
      "Start with the innermost brackets.",
      "Evaluate each bracket before multiplying its result.",
    ],
    "signed-add": [
      "Adding opposite signs",
      "Subtract the absolute values.",
      "Use the sign of the term with the greater absolute value; equal absolute values give zero.",
    ],
    "signed-subtract-negative": [
      "Subtracting a negative number",
      "Subtracting a negative means adding its opposite.",
      "Change subtraction of a negative into addition, then calculate.",
    ],
    "signed-product": [
      "Multiplying signed numbers",
      "Determine the signs of the factors first.",
      "An even number of negative factors gives a positive product; keep brackets and fractions exact.",
    ],
    "fraction-add": [
      "Adding fractions",
      "Use a common denominator before adding.",
      "Expand numerator and denominator by the same nonzero number, then add the numerators.",
    ],
    "fraction-subtract": [
      "Subtracting fractions",
      "Use a common denominator before subtracting.",
      "Keep the common denominator and subtract the entire second numerator.",
    ],
    "fraction-product": [
      "Multiplying fractions",
      "Multiply numerators and denominators.",
      "Evaluate bracketed sums first, then multiply and reduce the resulting fraction.",
    ],
    "algebra-substitute": [
      "Substituting into an expression",
      "Replace each x with the given value.",
      "Use brackets around negative values; a square is a product, rather than twice the base.",
    ],
    "algebra-like-terms": [
      "Like terms",
      "Combine coefficients of matching powers of x.",
      "After collecting like terms, substitute the stated value of x.",
    ],
    "algebra-distribute": [
      "Multiplying brackets",
      "The factor multiplies every term in the bracket.",
      "Expand each bracket, keep signs and then collect like powers.",
    ],
    "equation-add": [
      "An equation with addition",
      "Apply the same operation to both sides.",
      "Collect the x terms, move the constants and divide by the nonzero coefficient.",
    ],
    "equation-subtract": [
      "An equation with subtraction",
      "Undo subtraction by adding to both sides.",
      "Expand the brackets first, then collect x terms and constants on opposite sides.",
    ],
    "equation-fraction": [
      "An equation with a fraction",
      "Isolate the fraction containing x.",
      "Use the same operations on both sides; multiply to remove a nonzero denominator.",
    ],
    "algebra-negative-brackets": [
      "A minus before brackets",
      "Distribute the negative factor to every term.",
      "Subtracting a bracket changes every sign; multiply two negatives to obtain a positive.",
    ],
    "algebra-monomials": [
      "Monomials and exponents",
      "Separate numerical coefficients from powers of x.",
      "Add exponents for multiplication and subtract them for division; then combine like terms.",
    ],
    "algebra-polynomial-product": [
      "A product of brackets with x",
      "Multiply every term in one bracket by every term in the other.",
      "Collect the resulting terms by their powers of x, keeping the sign before each bracket.",
    ],
    "equation-fraction-balance": [
      "Balancing fractions in an equation",
      "Expand both sides and isolate the terms containing x.",
      "The same operation on both sides preserves equality; keep all fractions exact.",
    ],
    "quadratic-square-sum": [
      "Square of a sum",
      "Use the two squares and the double product.",
      "(u + v)² = u² + 2uv + v². Do not omit 2uv.",
    ],
    "quadratic-square-difference": [
      "Square of a difference",
      "Keep the minus on the double product.",
      "(u − v)² = u² − 2uv + v². The last square is positive.",
    ],
    "quadratic-difference-squares": [
      "Difference of squares",
      "Recognise U² − V² = (U − V)(U + V).",
      "The mixed terms cancel; for an equation set each factor equal to zero.",
    ],
    "quadratic-discriminant": [
      "Calculating the discriminant",
      "Write the equation as ax² + bx + c = 0 first.",
      "Use Δ = b² − 4ac with the signed coefficients from the simplified equation.",
    ],
    "quadratic-delta-sign": [
      "Discriminant and number of roots",
      "Compare the discriminant with zero.",
      "A positive discriminant gives two roots, zero one repeated root, and a negative one no real roots.",
    ],
    "quadratic-roots": [
      "Solving a quadratic equation",
      "Simplify the equation and calculate its discriminant.",
      "If Δ ≥ 0, divide the whole numerator −b ± √Δ by 2a; otherwise there are no real roots.",
    ],
    "matrix-dimensions": [
      "Size of a matrix",
      "Rows run horizontally and columns vertically.",
      "State the number of rows first, then the number of columns.",
    ],
    "matrix-entry": [
      "Reading an entry aᵢⱼ",
      "The first index is the row and the second the column.",
      "Count indices from 1 and read the entry at the intersection.",
    ],
    "matrix-add": [
      "Adding matrices",
      "Check that the matrices have matching sizes.",
      "Combine entries in matching positions; evaluate transposes and scaling in the stated order.",
    ],
    "matrix-subtract": [
      "Subtracting matrices",
      "Subtract entries in matching positions.",
      "Subtracting a negative entry gives addition; keep every intermediate matrix.",
    ],
    "matrix-scale": [
      "Scaling a matrix",
      "A scalar multiplies every entry.",
      "Evaluate the matrix expression in brackets first, then scale every entry.",
    ],
    "matrix-transpose": [
      "Transpose Aᵀ",
      "Rows become columns when transposing.",
      "First evaluate the expression inside the transpose, then swap its row and column indices.",
    ],
    "matrix-product": [
      "Matrix multiplication AB",
      "Check the inner sizes and keep the order AB.",
      "Each entry is a row of the left factor times a column of the right factor, summed over all matching positions.",
    ],
    "determinant-two": [
      "A 2×2 determinant",
      "First evaluate any operations inside the determinant.",
      "For [[a,b],[c,d]], use ad − bc and subtract the entire second product.",
    ],
    "determinant-sarrus": [
      "A 3×3 determinant — Sarrus",
      "Calculate three downward products and three upward products.",
      "Add the three ↘ products and subtract the whole sum of the three ↗ products; this rule is for 3×3 only.",
    ],
    "determinant-zero-row": [
      "Determinant — a zero row",
      "Look for an entire row or column of zeros.",
      "Every term in expansion along a zero row has a zero factor, so the determinant is zero.",
    ],
  };
const fieldLabels: Record<string, string> = {
  D: "D", D1: "D1", D2: "D2", D3: "D3", D4: "D4",
  "X[1,1]": "X[1,1]", "X[1,2]": "X[1,2]", "X[2,1]": "X[2,1]", "X[2,2]": "X[2,2]",
  "Y[1,1]": "Y[1,1]", "Y[1,2]": "Y[1,2]", "Y[2,1]": "Y[2,1]", "Y[2,2]": "Y[2,2]",
  "max f": "max f", "min f": "min f",
  "q*": "q*", "P(q*)": "P(q*)", "x⁵": "x⁵",
  m:"m", c:"c", "x₀":"x₀", "y₀":"y₀", "x₁":"x₁", "y₁":"y₁", "x₂":"x₂", "y₂":"y₂",
  x: "x", y: "y", z: "z", a: "a", b: "b", "xᵥ": "xᵥ", "yᵥ": "yᵥ", "x²": "x²", "x³": "x³", "x⁴": "x⁴", "1": "1",
  "Współczynnik przy x²": "Coefficient of x²",
  "Współczynnik przy x": "Coefficient of x",
  "Wyraz wolny": "Constant term",
  Współczynnik: "Coefficient",
  "Wykładnik x": "Exponent of x",
  "Liczba wierszy": "Number of rows",
  "Liczba kolumn": "Number of columns",
};
export function englishAnswer(spec: AnswerSpec): AnswerSpec {
  if (spec.kind === "list")
    return {
      ...spec,
      labels: spec.labels.map((s) => {
        // Affine Gauss forms use fixed variable and parameter labels. Do not
        // blindly translate arbitrary input or introduce a symbolic parser.
        const constant = /^([xyzw]): stała$/.exec(s);
        if (constant) return `${constant[1]}: constant`;
        if (/^[xyzw]: t[12]$/.test(s)) return s;
        if (!fieldLabels[s])
          throw new Error(`Missing English answer label: ${s}`);
        return fieldLabels[s];
      }),
    };
  if (spec.kind === "choice")
    return {
      ...spec,
      options: spec.options.map((o) => ({
        ...o,
        label:
          (
            {
              two: "Two distinct real roots",
              "ext:min": "One local minimum",
              "ext:max": "One local maximum",
              "ext:min-max": "Minimum, then maximum (in increasing x order)",
              "ext:max-min": "Maximum, then minimum (in increasing x order)",
              "ext:none": "One stationary point without an extremum",
              double: "One repeated root",
              none: "No real roots",
              "system-one": "Exactly one solution",
              "system-none": "No solutions",
              "system-many": "Infinitely many solutions",
              "not-possible": "Not possible",
              "inverse-yes": "An inverse exists",
              "inverse-no": "No inverse",
              "function-increasing": "Strictly increasing",
              "function-decreasing": "Strictly decreasing",
              "function-constant": "Constant",
            } as Record<string, string>
          )[o.value] ?? o.label,
      })),
    };
  return spec;
}
function question(task: GeneratedTask): string {
  const { a, b, c, x, k, p, q, s, xN, xD, sign, i, j } = task.parameters;
  const poly = () => `(${a})x² + (${b})x + (${c})`;
  switch (task.templateId) {
    case "order-add-product":
    case "order-subtract-product":
    case "order-parentheses":
    case "signed-add":
    case "signed-subtract-negative":
    case "signed-product":
    case "fraction-add":
    case "fraction-subtract":
    case "fraction-product":
      return task.question;
    case "algebra-substitute":
      return `Calculate x² + ${k}x for x = ${x}.`;
    case "algebra-like-terms":
      return `Calculate ${a}x + ${b}x for x = ${x}.`;
    case "algebra-distribute":
      return `Calculate ${a}(x + ${b}) for x = ${x}.`;
    case "equation-add":
      return `Solve ${a}x + ${b} = ${a * x + b}.`;
    case "equation-subtract":
      return `Solve ${a}x − ${b} = ${a * x - b}.`;
    case "equation-fraction":
      return `Solve x/${a} + (${b}) = ${f(add(r(a * k + task.parameters.offset, a), r(b)))}.`;
    case "algebra-negative-brackets":
      return `Expand (${a})(x + (${b})). Enter the coefficient of x and the constant term.`;
    case "algebra-monomials":
      return `Multiply (${a}x^${p}) · (${b}x^${q}). Enter the coefficient and exponent of x.`;
    case "algebra-polynomial-product":
      return `Expand (${a}x + (${b}))(x + (${c})). Enter the coefficients of x², x and the constant term.`;
    case "equation-fraction-balance":
      return `Solve x/${s} + ${p}/${q} = ${f(r(xN * q + p * s * xD, xD * s * q))}. Enter x.`;
    case "quadratic-square-sum":
    case "quadratic-square-difference":
      return `Expand (${a}x ${sign === 1 ? "+" : "−"} ${b})². Enter the coefficients of x², x and the constant term.`;
    case "quadratic-difference-squares":
      return `Choose the factorisation of (${a}x)² − ${b}².`;
    case "quadratic-discriminant":
      return `Calculate Δ for ${poly()} = 0.`;
    case "quadratic-delta-sign":
      return `How many real roots does ${poly()} = 0 have?`;
    case "quadratic-roots":
      return `Solve over the real numbers: ${poly()} = 0. Choose the number of roots and enter their exact values, if any.`;
    case "matrix-dimensions":
      return "State the size of A: number of rows first, then columns.";
    case "matrix-entry":
      return `Read entry a${"₁₂₃"[i - 1]}${"₁₂₃"[j - 1]} of A. Indices start at 1.`;
    case "matrix-add":
      return "Calculate A + B. Enter the entire resulting matrix.";
    case "matrix-subtract":
      return "Calculate A − B. Enter the entire resulting matrix.";
    case "matrix-scale":
      return `Calculate (${f(r(task.parameters.kN, task.parameters.kD))})·A. Enter the entire resulting matrix.`;
    case "matrix-transpose":
      return "Find Aᵀ. Enter the entire transposed matrix.";
    case "matrix-product":
      return "Calculate AB in the stated order. Enter the entire resulting matrix.";
    case "determinant-two":
      return "Calculate det(A) for the 2×2 matrix.";
    case "determinant-sarrus":
      return "Calculate det(A) using Sarrus' rule (3×3).";
    case "determinant-zero-row":
      return "Calculate det(A) using the simplest visible matrix property.";
    default:
      throw new Error(`Missing English question: ${task.templateId}`);
  }
}
type Scene = readonly [string, string];
function legacyScenes(task: GeneratedTask): Scene[] {
  const p = task.parameters,
    id = task.templateId;
  const ordinary: Record<string, Scene[]> = {
    "order-add-product": [
      ["Calculate the product", "Multiplication takes priority over addition."],
      [
        "Add the remaining term",
        "Replace the product with its value before adding.",
      ],
    ],
    "order-subtract-product": [
      [
        "Calculate the product",
        "Multiplication takes priority over subtraction.",
      ],
      [
        "Subtract the product",
        "Subtract the entire product from the first number.",
      ],
    ],
    "order-parentheses": [
      ["Evaluate the bracket", "Brackets determine the first operation."],
      [
        "Multiply the bracket's value",
        "The multiplier applies to the whole bracket.",
      ],
    ],
    "signed-add": [
      [
        `Compare |−${p.a}| = ${p.a} and |${p.b}| = ${p.b}`,
        "Subtract the absolute values of terms with opposite signs.",
      ],
      [
        "Choose the sign using the greater absolute value",
        "The sign belongs to the term with the greater absolute value; equal magnitudes give zero.",
      ],
    ],
    "signed-subtract-negative": [
      [
        "Change subtraction of a negative into addition",
        "Subtracting a number means adding its opposite.",
      ],
      [
        "Add the signed numbers",
        "Keep the sign of the first term after changing the operation.",
      ],
    ],
    "signed-product": [
      [
        "Multiply the first two factors",
        "A negative times a positive is negative.",
      ],
      [
        `Multiply by the remaining factor (${p.c})`,
        "Two negative factors give a positive product; multiplying by 1 keeps the value.",
      ],
    ],
    "fraction-add": [
      [
        `Expand both fractions to denominator ${p.a * p.b}`,
        "Multiply numerator and denominator by the same nonzero number.",
      ],
      ["Add the numerators", "The common denominator remains unchanged."],
      [
        "Reduce the fraction",
        "Dividing numerator and denominator by a common factor keeps its value.",
      ],
    ],
    "fraction-subtract": [
      [
        `Expand both fractions to denominator ${p.a * p.b}`,
        "Multiply numerator and denominator by the same nonzero number.",
      ],
      [
        "Subtract the numerators",
        "Keep the common denominator and subtract the entire second numerator.",
      ],
      [
        "Reduce the fraction",
        "Use a common factor of the numerator and denominator.",
      ],
    ],
    "fraction-product": [
      [
        "Multiply the numerators and the denominators",
        "Multiplication does not require a common denominator.",
      ],
      [
        "Write the exact reduced fraction",
        "Reducing preserves the value of the fraction.",
      ],
    ],
    "algebra-substitute": [
      [
        `Substitute x = ${p.x}; calculate the square and product`,
        "x² means x times x. Put negative substituted values in brackets.",
      ],
      ["Add the two terms", "Evaluate the power and product before adding."],
    ],
    "algebra-like-terms": [
      [
        `${p.a}x + ${p.b}x = (${p.a} + ${p.b})x`,
        "Like terms have the same variable part; add their coefficients.",
      ],
      [
        `Substitute x = ${p.x}`,
        "Multiply the combined coefficient by the stated value of x.",
      ],
    ],
    "algebra-distribute": [
      [
        `${p.a}(x + ${p.b}) = ${p.a}x + ${p.a * p.b}`,
        "Distribute multiplication to every term in the bracket.",
      ],
      [`Substitute x = ${p.x}`, "Calculate each resulting term separately."],
      [
        "Add the terms",
        "Substitution turns the expression into numerical arithmetic.",
      ],
    ],
    "algebra-negative-brackets": [
      [
        `Distribute (${p.a}) to x and (${p.b})`,
        "Multiply every term, keeping the signs; two negative factors give a positive product.",
      ],
    ],
    "algebra-monomials": [
      [
        "Multiply the numerical coefficients",
        "The numerical part is the product of the coefficients.",
      ],
      [
        `Combine x^${p.p} · x^${p.q} = x^(${p.p}+${p.q})`,
        "Add exponents when multiplying powers of the same base.",
      ],
    ],
    "algebra-polynomial-product": [
      [
        "Expand all four products in the two brackets",
        "Multiply every term in the first bracket by every term in the second.",
      ],
      [
        "Collect the coefficients of x",
        "Combine only terms with the same power of x.",
      ],
    ],
    "quadratic-square-sum": [
      [
        "Use (u + v)² = u² + 2uv + v²",
        "Set u = ax and v = b; remember the double product.",
      ],
      [
        "Calculate all three coefficients",
        "Squaring ax gives a²x²; the middle term is the double product.",
      ],
    ],
    "quadratic-square-difference": [
      [
        "Use (u − v)² = u² − 2uv + v²",
        "The middle term is negative and the final square remains positive.",
      ],
      [
        "Calculate all three coefficients",
        "Keep the minus on the double product, rather than on the last square.",
      ],
    ],
    "quadratic-difference-squares": [
      [
        "Use U² − V² = (U − V)(U + V)",
        "Identify the two squares before factoring.",
      ],
      [
        "Expand the factors to check them",
        "The mixed terms cancel because their coefficients are opposites.",
      ],
    ],
    "matrix-dimensions": [
      [
        `Count the horizontal rows: ${"matrices" in task ? task.matrices![0].values.length : 0}`,
        "Rows run horizontally and are numbered from 1.",
      ],
      [
        `Count the vertical columns: ${"matrices" in task ? task.matrices![0].values[0].length : 0}`,
        "Write the number of rows first and then the number of columns.",
      ],
    ],
    "matrix-entry": [
      [
        `Find row ${p.i}`,
        "The first index specifies the row, counting from 1.",
      ],
      [
        `Read column ${p.j} in that row: ${id === "matrix-entry" && "matrices" in task ? f(task.matrices![0].values[p.i - 1][p.j - 1]) : ""}`,
        "The second index specifies the column; use their intersection.",
      ],
    ],
    "determinant-two": [
      [
        "Use det(A) = a₁₁a₂₂ − a₁₂a₂₁",
        "Subtract the other diagonal's product from the main diagonal's product.",
      ],
      [
        "Calculate the two products",
        "Treat each signed entry as a whole factor.",
      ],
      [
        "Subtract the second product",
        "Subtract the whole number, even when it is negative.",
      ],
    ],
    "determinant-zero-row": [
      [
        "The entire third row consists of zeros",
        "An entire zero row is needed, rather than just one zero entry.",
      ],
      [
        "Expand along the third row",
        "Every term has a zero factor, so det(A) = 0.",
      ],
    ],
  };
  if (ordinary[id]) return ordinary[id];
  if (id.startsWith("equation-"))
    return [
      [
        "Apply the inverse operation to both sides",
        "Adding or subtracting the same quantity on both sides preserves equality.",
      ],
      [
        id === "equation-fraction" || id === "equation-fraction-balance"
          ? "Multiply both sides to remove the denominator"
          : "Divide both sides by the coefficient of x",
        "The divisor or denominator is nonzero, so the operation preserves the solution.",
      ],
    ];
  if (
    [
      "quadratic-discriminant",
      "quadratic-delta-sign",
      "quadratic-roots",
    ].includes(id)
  ) {
    const delta = p.b * p.b - 4 * p.a * p.c;
    const result: Scene[] = [
      [
        `Read a = ${p.a}, b = ${p.b}, c = ${p.c}`,
        "Read every coefficient with its sign; a is nonzero.",
      ],
      [
        "Calculate b² and 4ac",
        "Use Δ = b² − 4ac, with brackets around negative b.",
      ],
      [
        "Subtract the entire product 4ac",
        "Subtract the product as a whole, including its sign.",
      ],
    ];
    result.push(
      delta < 0
        ? [
            "Δ < 0: no real roots",
            "A real square cannot be negative, so √Δ is not real.",
          ]
        : delta === 0
          ? [
              "Δ = 0: one repeated root x₀ = −b/(2a)",
              "Both signs in the quadratic formula give the same value.",
            ]
          : [
              `Δ > 0: two distinct roots; √Δ = ${p.sqrtDelta}`,
              "Check the square root by squaring it.",
            ],
    );
    if (delta > 0)
      result.push([
        "Use x₁ = (−b − √Δ)/(2a), x₂ = (−b + √Δ)/(2a)",
        "Divide the entire numerator by 2a for each sign.",
      ]);
    return result;
  }
  if (id === "determinant-sarrus")
    return [
      [
        "Use Sarrus' rule for 3×3 only",
        "Add three downward products and subtract all three upward products.",
      ],
      ...Array.from(
        { length: 6 },
        (_, i): Scene => [
          `${i < 3 ? "+ ↘" : "− ↗"} Product ${i + 1}`,
          i < 3
            ? "Add this signed product to the downward sum."
            : "Include this signed product in the upward sum, which will be subtracted.",
        ],
      ),
      [
        "Calculate both diagonal sums",
        "Keep the added and subtracted groups separate.",
      ],
      [
        "Subtract the entire upward sum",
        "Brackets keep the signs of all terms in the second sum.",
      ],
    ];
  if (id.startsWith("matrix-")) {
    const answer = getAnswerSpec(task);
    if (answer.kind !== "matrix") throw new Error("Matrix expected");
    const cols = answer.values[0].length;
    return [
      [
        `Result size: ${answer.values.length} × ${cols}`,
        id === "matrix-product"
          ? "The inner sizes must match; do not assume AB = BA."
          : id === "matrix-transpose"
            ? "Transpose swaps rows and columns."
            : "Addition and subtraction require matching sizes; scaling preserves size.",
      ],
      ...answer.values.flatMap((row, i) =>
        row.map(
          (_, j): Scene => [
            id === "matrix-product"
              ? `c(${i + 1},${j + 1}): row ${i + 1} of A × column ${j + 1} of B`
              : `Calculate entry (${i + 1},${j + 1})`,
            id === "matrix-product"
              ? "Multiply corresponding row and column entries, then add the products."
              : id === "matrix-transpose"
                ? `Copy entry (${j + 1},${i + 1}) from A without changing its value or sign.`
                : id === "matrix-scale"
                  ? "The scalar multiplies every entry, including zero and negative fractions."
                  : "Combine entries in matching positions, keeping their signs.",
          ],
        ),
      ),
    ];
  }
  throw new Error(`Missing English steps: ${id}`);
}
const diagnosis: Record<string, string> = {
  ORDER_LEFT_TO_RIGHT: "the addition was evaluated before the product",
  ORDER_SUBTRACTION_FIRST: "the subtraction was evaluated before the product",
  ORDER_IGNORED_PARENTHESES: "the brackets were ignored",
  SIGNED_ADDED_MAGNITUDES:
    "the absolute values were added despite the opposite signs",
  SIGNED_WRONG_DIRECTION: "adding a positive number was treated as moving left",
  SIGNED_DOUBLE_MINUS:
    "subtracting a negative was treated as subtracting a positive",
  SIGNED_PRODUCT_SIGN: "the sign of the product was reversed",
  FRACTION_ADD_DENOMINATORS:
    "numerators and denominators were added separately",
  FRACTION_SUBTRACT_DENOMINATORS:
    "numerators and denominators were subtracted separately",
  FRACTION_ADDED_INSTEAD: "the fractions were added instead of multiplied",
  ALGEBRA_SQUARE_AS_DOUBLE: "x² was replaced with 2x",
  ALGEBRA_COEFFICIENT_IGNORED: "the coefficient of x was omitted",
  ALGEBRA_FORGOT_SUBSTITUTION:
    "the coefficients were combined without substituting x",
  ALGEBRA_PARTIAL_DISTRIBUTION: "only one term in the bracket was multiplied",
  EQUATION_STOPPED_AT_AX: "the calculation stopped at the value of ax",
  EQUATION_STOPPED_AT_QUOTIENT:
    "the calculation stopped at the value of x divided by its denominator",
};
export function englishTask(task: GeneratedTask): GeneratedTask {
  if (isUniversityTask(task)) return localizeUniversity(task, "en");
  const info = familyEnglish[task.templateId];
  if (!info) throw new Error(`Missing English family: ${task.templateId}`);
  let solution: Solution, q: string;
  if ("math" in task) {
    const high = task as HigherTask,
      p = high.math;
    solution = derive(p, high.matrices, "en").solution;
    if (p.kind === "numeric")
      q = `Calculate exactly: ${expressionText(p.expression)}.`;
    else if (p.kind === "polynomial")
      q = p.at
        ? `Evaluate ${expressionText(p.expression)} for x = ${f(p.at)}.`
        : `Expand and collect ${expressionText(p.expression)}. Enter the coefficients in the labelled fields.`;
    else if (p.kind === "linear" || p.kind === "quadratic")
      q = `${p.kind === "linear" ? "Solve" : p.target === "delta" ? "Simplify to ax² + bx + c = 0 and calculate Δ" : "Simplify and solve over the real numbers"}: ${expressionText(p.left)} = ${expressionText(p.right)}.`;
    else if (p.kind === "monomial")
      q = `For x ≠ 0, simplify ((${f(p.a)})x^${p.p} · (${f(p.b)})x^${p.q}) ÷ ((${f(p.c)})x^${p.s})${p.combined ? ` + (${f(p.d)})x^${p.p + p.q - p.s}` : ""}. Enter the coefficient and exponent of x.`;
    else
      q = `Calculate ${p.kind === "determinant" ? `det(${matrixExpressionText(p.expression)})` : matrixExpressionText(p.expression)}. ${p.kind === "matrix" ? "Enter the entire resulting matrix." : "First evaluate the operations inside the determinant."}`;
  } else {
    const original = solutionFor(task),
      scenes = legacyScenes(task);
    if (scenes.length !== original.length - 1)
      throw new Error(`English step count mismatch: ${task.templateId}`);
    solution = original.map((step, i) =>
      step.kind === "answer"
        ? {
            ...step,
            action: "Correct answer",
            reason: "The preceding operations give the required result.",
            answer: englishAnswer(step.answer),
          }
        : { ...step, action: scenes[i][0], reason: scenes[i][1] },
    ) as unknown as Solution;
    q = question(task);
  }
  const answer = englishAnswer(getAnswerSpec(task));
  let step = task.step;
  if (step) {
    const p = task.parameters;
    const prompts: Record<string, string> = {
      "order-add-product": `What is ${p.b} × ${p.c}?`,
      "signed-add": `What is the difference between the absolute values ${p.a} and ${p.b}?`,
      "fraction-add": `What numerator does ${p.p}/${p.a} have when expanded to denominator ${p.a * p.b}?`,
      "algebra-substitute": `What is x² for x = ${p.x}?`,
      "equation-add": `What is ${p.a}x after subtracting ${p.b} from both sides?`,
      "equation-fraction": `What is x/${p.a} after isolating it?`,
    };
    step = {
      ...step,
      question: prompts[task.templateId],
      correctHint:
        "Now continue with the remaining operations in the question.",
      incorrectHint: "Recheck the arithmetic for this intermediate step.",
    };
    if (!step.question) throw new Error("Missing English auxiliary step");
  }
  const explanation = solution
    .map((s) =>
      s.kind === "working"
        ? `${s.action}. ${s.reason}\n${s.calculations.map(calculationText).join("\n")}`
        : "Correct answer shown in the final solution step.",
    )
    .join("\n");
  const presentation = {
    ...task,
    title: info[0],
    question: q,
    hint: info[1],
    nextHint: info[2],
    solution,
    explanation,
    step,
    errorRules: task.errorRules.map((rule) => {
      if (!diagnosis[rule.errorCode])
        throw new Error(`Missing English diagnosis ${rule.errorCode}`);
      return {
        ...rule,
        explanation: `One possibility is that ${diagnosis[rule.errorCode]}.`,
        hint: info[2],
      };
    }),
  };
  // Keep the original answer representation and hint availability. Locale changes
  // presentation, rather than enabling extra help or changing the editor type.
  if ("numerator" in task.answer)
    return { ...presentation, answer: task.answer };
  return { ...presentation, answer, startingHint: info[1] };
}
