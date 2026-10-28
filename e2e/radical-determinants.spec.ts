import { test, expect, type Page } from "@playwright/test";

const button = (page: Page, name: string) => page.getByRole("button", { name, exact: true });
type Pair = readonly [number, number];
const multiply = (x: Pair, y: Pair, d: number): Pair =>
  [x[0] * y[0] + d * x[1] * y[1], x[0] * y[1] + x[1] * y[0]];
for (const width of [375, 1280])
  for (const english of [false, true])
    for (const level of ["hard", "advanced", "expert"] as const)
      test(`MT-EDU-032 radical determinant ${width}px ${english?"EN":"PL"} ${level}`, async ({page}) => {
        test.setTimeout(90_000);
        await page.setViewportSize({width,height:900});
        const errors:string[]=[];
        page.on("pageerror",e=>errors.push(e.message));
        await page.goto("/");
        if (english) await button(page,"English").click();
        await button(page,english?"University mathematics":"Matematyka na studia").click();
        await button(page,english?"Determinants":"Wyznaczniki").click();
        await button(page,english
          ? ({hard:"Hard",advanced:"Advanced",expert:"Expert"} as const)[level]
          : ({hard:"Trudny",advanced:"Zaawansowany",expert:"Ekspert"} as const)[level]).click();
        const title=english?"2×2 determinant with radicals":"Wyznacznik 2×2 z pierwiastkami";
        await page.locator(".exercise-list-items .exercise-item").filter({hasText:title}).click();
        await expect(page.locator(".question")).toHaveAttribute("data-template-id","determinant-radical-two");
        const table = page.locator(".determinant-display.determinant-radical");
        await expect(table).toBeVisible();
        await expect(table.locator("tbody tr")).toHaveCount(2);
        const rows = await table.locator("tbody tr").all();
        const A:Pair[][]=[];
        let d=0;
        for (const row of rows) {
          const cells=await row.locator("td").all();
          expect(cells).toHaveLength(2);
          const output: Pair[]=[];
          for(const cell of cells) {
            const a=await cell.getAttribute("data-whole"),
              b=await cell.getAttribute("data-root"),
              radicand=await cell.getAttribute("data-radicand");
            expect(a).not.toBeNull(); expect(b).not.toBeNull();
            const n=Number(a),root=Number(b);
            d=Number(radicand);
            expect([2,3,5,7]).toContain(d);
            expect(Number.isSafeInteger(n) && Number.isSafeInteger(root)).toBe(true);
            expect(await cell.innerText()).toContain(root===0?String(n).replace("-","−"):"√"+d);
            output.push([n,root]);
          }
          A.push(output);
        }
        expect(A.flat().some(x=>x[1]!==0)).toBe(true);
        const ad=multiply(A[0][0],A[1][1],d),bc=multiply(A[0][1],A[1][0],d);
        expect(ad[1]-bc[1]).toBe(0);
        const expected=ad[0]-bc[0];
        const check=button(page,english?"Check":"Sprawdź");
        await check.click();await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
        await page.locator("#answer").fill("1/0");
        await check.click();await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
        await page.locator("#answer").fill(String(expected+1));
        await check.click();await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
        await page.locator("#answer").fill(String(expected));
        await check.click();await expect(page.locator(".feedback")).toHaveClass("feedback correct");
        await button(page,english?"Show solution":"Pokaż rozwiązanie").click();
        await button(page,english?"Show all steps":"Pokaż wszystkie kroki").click();
        const solution=await page.locator(".solution-panel").innerText();
        expect(solution).toContain("√"+d);
        expect(solution).toContain("det(A)");
        expect(solution).toContain(String(expected).replace("-","−"));
        expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
        expect(errors).toEqual([]);
      });
