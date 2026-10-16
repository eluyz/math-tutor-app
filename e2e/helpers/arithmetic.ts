import { expect } from "@playwright/test";
import {
  rational as r,
  addRational as add,
  subtractRational as sub,
  multiplyRational as mul,
  divideRational as div,
  type Rational,
} from "../../src/rational";
/** Test-only arithmetic parser for the displayed expression; no eval or generator answers. */
export function parse(source: string, x = r(0)): Rational {
  const tokens = source.replace(/−/g, "-").match(/\d+|[()+\-*×÷/^x]/g) ?? [];
  let i = 0;
  const atom = (): Rational => {
    if (tokens[i] === "-") {
      i++;
      return mul(r(-1), atom());
    }
    if (tokens[i] === "+") {
      i++;
      return atom();
    }
    if (tokens[i] === "(") {
      i++;
      const v = sum();
      expect(tokens[i++]).toBe(")");
      return v;
    }
    if (tokens[i] === "x") {
      i++;
      return x;
    }
    return r(BigInt(tokens[i++]));
  };
  const power = () => {
    let a = atom();
    if (tokens[i] === "^") {
      i++;
      const n = Number(tokens[i++]);
      a = r(a.numerator ** BigInt(n), a.denominator ** BigInt(n));
    }
    return a;
  };
  const term = () => {
    let a = power();
    while (["*", "×", "÷", "/"].includes(tokens[i])) {
      const op = tokens[i++],
        b = power();
      a = op === "*" || op === "×" ? mul(a, b) : div(a, b);
    }
    return a;
  };
  const sum = () => {
    let a = term();
    while (["+", "-"].includes(tokens[i])) {
      const op = tokens[i++],
        b = term();
      a = op === "+" ? add(a, b) : sub(a, b);
    }
    return a;
  };
  const value = sum();
  expect(i).toBe(tokens.length);
  return value;
}
export function numeric(question: string) {
  return parse(
    question.includes(":")
      ? question.split(":")[1].replace(/\.$/, "")
      : question.split("=")[0],
  );
}
