/** Exact fractions keep decimal and a/b answers comparable without floating-point tolerances. */
export type Rational = Readonly<{ numerator: bigint; denominator: bigint }>;

function gcd(left: bigint, right: bigint): bigint {
  let a = left < 0n ? -left : left;
  let b = right < 0n ? -right : right;
  while (b !== 0n) [a, b] = [b, a % b];
  return a || 1n;
}

export function rational(
  numerator: bigint | number,
  denominator: bigint | number = 1,
): Rational {
  if (typeof numerator === "number" && !Number.isSafeInteger(numerator))
    throw new Error("Unsafe numerator");
  if (typeof denominator === "number" && !Number.isSafeInteger(denominator))
    throw new Error("Unsafe denominator");
  let n = BigInt(numerator);
  let d = BigInt(denominator);
  if (d === 0n) throw new Error("Division by zero");
  if (d < 0n) [n, d] = [-n, -d];
  const factor = gcd(n, d);
  return { numerator: n / factor, denominator: d / factor };
}

export function equalRational(left: Rational, right: Rational): boolean {
  return (
    left.numerator === right.numerator && left.denominator === right.denominator
  );
}

export function addRational(left: Rational, right: Rational): Rational {
  return rational(
    left.numerator * right.denominator + right.numerator * left.denominator,
    left.denominator * right.denominator,
  );
}

export function subtractRational(left: Rational, right: Rational): Rational {
  return rational(
    left.numerator * right.denominator - right.numerator * left.denominator,
    left.denominator * right.denominator,
  );
}

export function multiplyRational(left: Rational, right: Rational): Rational {
  return rational(
    left.numerator * right.numerator,
    left.denominator * right.denominator,
  );
}

export function divideRational(left: Rational, right: Rational): Rational {
  if (right.numerator === 0n) throw new Error("Division by zero");
  return rational(
    left.numerator * right.denominator,
    left.denominator * right.numerator,
  );
}

export type ParsedAnswer =
  | { kind: "valid"; value: Rational }
  | {
      kind: "invalid";
      reason: "empty" | "format" | "division-by-zero" | "too-long";
    };

/** Accepts one signed integer, finite decimal (dot or comma), or integer fraction. */
export function parseAnswer(raw: string): ParsedAnswer {
  const input = raw.trim();
  if (!input) return { kind: "invalid", reason: "empty" };
  if (input.length > 100) return { kind: "invalid", reason: "too-long" };
  // Accept the mathematical minus only where a signed number is valid.
  const normalized = input.replace(/\u2212/g, "-");

  const fraction = /^([+-]?\d+)\s*\/\s*([+-]?\d+)$/.exec(normalized);
  if (fraction) {
    const denominator = BigInt(fraction[2]);
    if (denominator === 0n)
      return { kind: "invalid", reason: "division-by-zero" };
    return { kind: "valid", value: rational(BigInt(fraction[1]), denominator) };
  }

  if (!/^[+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)$/.test(normalized)) {
    return { kind: "invalid", reason: "format" };
  }
  const sign = normalized.startsWith("-") ? -1n : 1n;
  const unsigned = normalized.replace(/^[+-]/, "").replace(",", ".");
  const [whole = "0", decimal = ""] = unsigned.split(".");
  const denominator = 10n ** BigInt(decimal.length);
  const numerator =
    sign * (BigInt(whole || "0") * denominator + BigInt(decimal || "0"));
  return { kind: "valid", value: rational(numerator, denominator) };
}
