import { expect, type Page } from "@playwright/test";
import { parseAnswer, rational, type Rational } from "../../src/rational";
import { a, m, s, d, q, laplace } from "../../src/university/audit";
const parse = (text: string) => {
  const p = parseAnswer(text.trim());
  if (p.kind !== "valid")
    throw new Error(`Invalid displayed fraction: ${text}`);
  return p.value;
};
/** Reduce exact fractions before entering the app's max-100-character answer fields. */
export const fractionText = (v: Rational) => {
  const reduced = rational(v.numerator, v.denominator);
  return `${reduced.numerator}/${reduced.denominator}`;
};
const subsets = (n: number, k: number): number[][] => k === 0 ? [[]] : Array.from({ length: n }, (_, i) => subsets(n - i - 1, k - 1).map(rest => [i, ...rest.map(j => j + i + 1)])).flat();
function referenceRank(matrix: Rational[][]): number {
  for (let size = Math.min(matrix.length, matrix[0].length); size >= 1; size--)
    for (const rows of subsets(matrix.length, size))
      for (const columns of subsets(matrix[0].length, size))
        if (laplace(rows.map(i => columns.map(j => matrix[i][j]))).numerator !== 0n) return size;
  return 0;
}
export async function readSystem(page: Page) {
  const augmentedTable = page.locator(".linear-algebra-matrices .given-matrix");
  if (await augmentedTable.count()) {
    const matrix = await Promise.all((await augmentedTable.first().locator("tbody tr").all()).map(async row =>
      (await row.locator("td").allTextContents()).map(parse)));
    const n = matrix[0].length - 1;
    const coefficients = matrix.map(row => row.slice(0, n));
    const rhs = matrix.map(row => row[n]);
    const rankA = referenceRank(coefficients), rankAugmented = referenceRank(matrix);
    const classification = rankA < rankAugmented ? "system-none" : rankA === n ? "system-one" : "system-many";
    const determinant = classification === "system-one" && coefficients.length === n ? laplace(coefficients) : null;
    return { classification, values: determinant ? Array.from({ length: n }, (_, column) =>
      d(laplace(coefficients.map((row, i) => row.map((v, j) => j === column ? rhs[i] : v))), determinant)) : [] };
  }
  const text = await page.locator(".question").innerText();
  const rows = text.split("\n").filter((line) => line.includes(" = "));
  const coefficients = rows.map((row) =>
    [...row.matchAll(/\(([^()]+)\)·/g)].map((match) => parse(match[1])),
  );
  const rhs = rows.map((row, i) => {
    const shown = parse(row.split(" = ").at(-1)!);
    const shifts = [...row.matchAll(/·\([xyz] \+ \(([^)]+)\)\)/g)].map(
      (match) => parse(match[1]),
    );
    return shifts.length
      ? s(shown, coefficients[i].map((v, j) => m(v, shifts[j])).reduce(a, q(0)))
      : shown;
  });
  const original = coefficients.map((row) =>
    text.includes("·(y + z)")
      ? [row[0], a(row[0], row[1]), a(row[1], row[2])]
      : text.includes("·(x + y)")
        ? [a(row[0], row[1]), s(row[0], row[1])]
        : row,
  );
  const det = laplace(original);
  if (det.numerator === 0n) {
    const dx = laplace(original.map((row, i) => [rhs[i], row[1]])),
      dy = laplace(original.map((row, i) => [row[0], rhs[i]]));
    return {
      classification:
        dx.numerator !== 0n || dy.numerator !== 0n
          ? "system-none"
          : "system-many",
      values: [],
    };
  }
  return {
    classification: "system-one",
    values: rhs.map((_, column) =>
      d(
        laplace(
          original.map((row, i) =>
            row.map((v, j) => (j === column ? rhs[i] : v)),
          ),
        ),
        det,
      ),
    ),
  };
}
export async function fillSystem(page: Page) {
  const answer = await readSystem(page);
  const classification = await page
    .locator("#answer")
    .evaluate((e) => e.tagName === "SELECT");
  if (classification) await page.locator("#answer").selectOption(answer.classification);
  const fields = classification ? await page.locator("[id^='system-value-']").count() : answer.values.length;
  for (let i = 0; i < fields; i++)
    await page
      .locator(
        classification ? `#system-value-${i}` : i ? `#answer-${i}` : "#answer",
      )
      .fill(fractionText(answer.values[i]));
  return answer;
}


/** Independent exact RREF oracle for the fixed canonical t1/t2 answer convention.
 * Normalization after every row operation prevents enormous unreduced fractions. */
export function parametricCoefficients(augmented: Rational[][]) {
  const n=augmented[0].length-1;
  const rows=augmented.map(row=>row.map(v=>rational(v.numerator,v.denominator)));
  const pivots:number[]=[];
  const normalize=(v:Rational)=>rational(v.numerator,v.denominator);
  let lead=0;
  for(let col=0;col<n && lead<rows.length;col++){
    const pivotRow=rows.findIndex((row,i)=>i>=lead && row[col].numerator!==0n);
    if(pivotRow<0)continue;
    [rows[lead],rows[pivotRow]]=[rows[pivotRow],rows[lead]];
    const pivot=rows[lead][col];
    rows[lead]=rows[lead].map(v=>normalize(d(v,pivot)));
    for(let i=0;i<rows.length;i++)if(i!==lead&&rows[i][col].numerator!==0n){
      const factor=rows[i][col];
      rows[i]=rows[i].map((v,j)=>normalize(s(v,m(factor,rows[lead][j]))));
    }
    pivots.push(col);lead++;
  }
  if(rows.some(row=>row.slice(0,n).every(v=>v.numerator===0n)&&row[n].numerator!==0n))
    throw Error("Parametric system is inconsistent");
  const free=Array.from({length:n},(_,j)=>j).filter(j=>!pivots.includes(j));
  if(free.length<1||free.length>2)throw Error("Expected 1-2 free variables");
  const coefficients=Array.from({length:n},(_,j)=>{
    const freeIndex=free.indexOf(j);
    if(freeIndex>=0)return [q(0),...free.map((_,k)=>q(k===freeIndex?1:0))];
    const row=pivots.indexOf(j);
    return [rows[row][n],...free.map(col=>normalize(m(q(-1),rows[row][col])))];
  });
  return {values:coefficients.flat(),free};
}
export async function fillParametricSystem(page:Page) {
  const table=page.locator(".linear-algebra-matrices .given-matrix").first();
  const rows=await Promise.all((await table.locator("tbody tr").all()).map(async row=>
    (await row.locator("td").allTextContents()).map(parse)));
  const expected=parametricCoefficients(rows).values.map(fractionText);
  for(let i=0;i<expected.length;i++){
    const field=page.locator(i===0?"#answer":`#answer-${i}`);
    await field.fill(expected[i]);
    await field.blur();
    await expect(field).toHaveValue(expected[i]);
  }
  const fields=page.locator("form .coefficient-field input");
  await expect.poll(()=>fields.evaluateAll(nodes=>nodes.map(node=>(node as HTMLInputElement).value)),{
    message:"All parametric coefficients must survive controlled React updates",
  }).toEqual(expected);
  return {classification:"system-many",values:[]};
}


/** Solve a displayed 5-expression equality chain independently of production solver. */
export function readChain(question:string) {
  const entries=[...question.matchAll(/\(\(([^()]+)\)·x \+ \(([^()]+)\)·y \+ \(([^()]+)\)\)\/\(([^()]+)\)/g)]
    .map(match=>({a:parse(match[1]),b:parse(match[2]),c:parse(match[3]),den:parse(match[4])}));
  if(entries.length!==6)throw Error("Expected exactly six expressions with five equalities");
  const first=entries[0];
  const difference=(right:typeof first)=>({
    a:s(d(first.a,first.den),d(right.a,right.den)),
    b:s(d(first.b,first.den),d(right.b,right.den)),
    rhs:s(d(right.c,right.den),d(first.c,first.den)),
  });
  const u=difference(entries[1]),v=difference(entries[2]);
  const determinant=s(m(u.a,v.b),m(u.b,v.a));
  if(determinant.numerator===0n)throw Error("Ambiguous equality chain");
  const x=d(s(m(u.rhs,v.b),m(u.b,v.rhs)),determinant);
  const y=d(s(m(u.a,v.rhs),m(u.rhs,v.a)),determinant);
  const values=entries.map(e=>d(a(a(m(e.a,x),m(e.b,y)),e.c),e.den));
  if(values.some(z=>z.numerator*values[0].denominator!==values[0].numerator*z.denominator))
    throw Error("Unverified remaining chain equalities");
  const target=/^(?:Oblicz|Find) x\b/.test(question)?"x":"y";
  return {x,y,target,answer:target==="x"?x:y};
}
