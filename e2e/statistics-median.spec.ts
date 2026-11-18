import { expect, test, type Page } from "@playwright/test";
import { HISTORY_KEY } from "../src/progress/model";

for(const width of [375,1280]) for(const locale of ["pl","en"] as const) {
 const en=locale==="en";
 const copy={mean:en?"Arithmetic mean":"Średnia arytmetyczna",median:en?"Median":"Mediana",easy:en?"Easy":"Łatwy",medium:en?"Medium":"Średni",hard:en?"Hard":"Trudny",next:en?"Next exercise":"Następne zadanie",check:en?"Check":"Sprawdź",answer:en?"Your answer":"Twoja odpowiedź",solution:en?"Show solution":"Pokaż rozwiązanie",hint:en?"Show hint":"Pokaż podpowiedź",hint2:en?"Show second hint":"Pokaż drugą podpowiedź",right:en?"Correct answer.":"Poprawna odpowiedź.",wrong:en?"The result differs.":"Wynik jest inny."};
 test.describe(`ST-102 ${locale} ${width}px`,()=>{
  test.use({viewport:{width,height:width===375?812:800}});
  const errors=new WeakMap<Page,string[]>();
  test.beforeEach(async({page})=>{
   errors.set(page,[]);
   page.on("pageerror",e=>errors.get(page)!.push(e.message));
   page.on("console",m=>{if(m.type()==="error") errors.get(page)!.push(m.text());});
   page.on("requestfailed",r=>errors.get(page)!.push(r.url()));
   page.on("response",r=>{if(r.status()>=400) errors.get(page)!.push(`HTTP ${r.status()} ${r.url()}`);});
   await page.goto("/"); if(en) await page.getByRole("button",{name:"English",exact:true}).click();
  });
  test.afterEach(async({page})=>{
   expect(errors.get(page)).toEqual([]);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
  });
  const panel=(page:Page)=>page.locator(".statistics-practice");
  async function enter(page:Page) {
   await page.locator(".subject-navigation").getByRole("button",{name:/Statystyka|Statistics/}).click();
   await panel(page).getByRole("button",{name:copy.median,exact:true}).click();
   await expect(panel(page).getByRole("heading",{name:en?"ST-102 — Median":"ST-102 — Mediana",exact:true})).toBeVisible();
  }
  async function submit(page:Page,answer:string) {
   await panel(page).getByLabel(copy.answer,{exact:true}).fill(answer);
   await panel(page).getByRole("button",{name:copy.check,exact:true}).click();
  }
  test("pins permutation, odd/even/negative/fractional answers and parser behavior",async({page})=>{
   await enter(page);const p=panel(page);
   await expect(p.locator(".question")).toContainText("3, 2, 2, 2, 1");
   for(const raw of ["","  ","1/0","abc","1+1","9".repeat(101)]) {
    await submit(page,raw);await expect(p.locator(".feedback")).toHaveClass(/invalid/);
   }
   await submit(page,"2");await expect(p.locator(".feedback")).toContainText(copy.right);
   await p.getByRole("button",{name:copy.next,exact:true}).click();
   await expect(p.locator(".question")).toContainText("1, 6, 9, 4, 5");
   await submit(page,"9");await expect(p.locator(".feedback")).toContainText(copy.wrong);
   await submit(page,"5");await expect(p.locator(".feedback")).toContainText(copy.right);
   await p.getByRole("button",{name:copy.medium,exact:true}).click();
   await expect(p.locator(".question")).toHaveAttribute("data-seed","0");
   await submit(page,"43/6");await expect(p.locator(".feedback")).toContainText(copy.wrong);
   await submit(page,"5");await expect(p.locator(".feedback")).toContainText(copy.right);
   await p.getByRole("button",{name:copy.next,exact:true}).click();
   await expect(p.locator(".question")).toContainText("2, 2, 3, 10, 1, 7");
   for(const raw of ["5/2","10/4","2.5","2,5","−5/−2"]) {
    await submit(page,raw);await expect(p.locator(".feedback")).toContainText(copy.right);
   }
   await submit(page,"2");await expect(p.locator(".feedback")).toContainText(copy.wrong);
   await p.getByRole("button",{name:copy.hard,exact:true}).click();
   for(const raw of ["-1","−1","-2/2"]) {await submit(page,raw);await expect(p.locator(".feedback")).toContainText(copy.right);}
   await submit(page,"0");await expect(p.locator(".feedback")).toContainText(copy.wrong);
  });
  test("checks both original hints and every median solution step in the displayed order",async({page})=>{
   await enter(page);const p=panel(page);
   await p.getByRole("button",{name:copy.next,exact:true}).click();
   await expect(p.locator(".solution-calculation")).toHaveCount(0);
   await p.getByRole("button",{name:copy.hint,exact:true}).click();
   await p.getByRole("button",{name:copy.hint2,exact:true}).click();
   await expect(p.locator(".learning-hint")).toHaveText(en?[
    "Sort the observations in increasing order, retaining all repetitions.","Check whether the observation count is odd or even. Use the middle value or the mean of the two middle values.",
   ]:["Uporządkuj obserwacje rosnąco; zachowaj wszystkie powtórzenia.","Sprawdź parzystość liczby obserwacji. Wybierz środkową wartość lub średnią dwóch środkowych."]);
   await p.getByRole("button",{name:copy.solution,exact:true}).click();
   await expect(p.locator(".solution-calculation")).toHaveText(["x↑ = [1, 4, 5, 6, 9]","n = 5; k = 3","Me = x[3] = 5"]);
   await expect(p.locator(".solution-step-explanation")).toHaveText(en?[
    "Sort every observation without removing repeated values.","For odd n, the middle position is (n+1)/2. Positions start at 1.","The median is the observation at the middle position.",
   ]:["Sortujemy wszystkie obserwacje, nie usuwając powtórzeń.","Dla nieparzystego n środkowa pozycja to (n+1)/2. Liczymy od 1.","Mediana jest wartością obserwacji na środkowej pozycji."]);
   await p.getByRole("button",{name:copy.medium,exact:true}).click();
   await p.getByRole("button",{name:copy.next,exact:true}).click();
   await p.getByRole("button",{name:copy.solution,exact:true}).click();
   await expect(p.locator(".solution-calculation")).toHaveText(["x↑ = [1, 2, 2, 3, 7, 10]","n = 6; k₁ = 3; k₂ = 4","Me = (x[3] + x[4])/2 = ((2) + (3))/2 = 5/2"]);
   await expect(p.locator(".solution-step-explanation").last()).toHaveText(en?"The median is the mean of the two middle values; it may be a fraction.":"Mediana jest średnią dwóch środkowych wartości; wynik może być ułamkiem.");
   await p.getByRole("button",{name:copy.hard,exact:true}).click();
   await p.getByRole("button",{name:copy.solution,exact:true}).click();
   await expect(p.locator(".solution-calculation")).toHaveText(["x↑ = [-16, -13, -9, -1, 8, 14, 17]","n = 7; k = 4","Me = x[4] = −1"]);
  });
  test("retains locale state, resets topic/track changes and supports keyboard selection",async({page})=>{
   await enter(page);const p=panel(page);
   await p.getByRole("button",{name:copy.medium,exact:true}).click();
   await p.getByRole("button",{name:copy.next,exact:true}).click();
   await submit(page,"10/4");
   await p.getByRole("button",{name:copy.hint,exact:true}).click();
   await p.getByRole("button",{name:copy.solution,exact:true}).click();
   await page.getByRole("button",{name:en?"Polski":"English",exact:true}).click();
   await expect(p.locator(".question")).toContainText("2, 2, 3, 10, 1, 7");
   await expect(p.getByRole("textbox")).toHaveValue("10/4");
   await expect(p.locator(".question")).toHaveAttribute("data-seed","1");
   await expect(p.locator(".learning-hint")).toHaveCount(1);
   await expect(p.locator(".solution-calculation").last()).toHaveText("Me = (x[3] + x[4])/2 = ((2) + (3))/2 = 5/2");
   await expect(p.locator("[data-topic=median]")).toHaveAttribute("aria-pressed","true");
   await page.getByRole("button",{name:en?"English":"Polski",exact:true}).click();
   await p.getByRole("button",{name:copy.mean,exact:true}).click();
   await expect(p.locator(".question")).toHaveAttribute("data-lesson","mean");
   await expect(p.locator(".question")).toHaveAttribute("data-seed","0");
   await expect(p.locator(".feedback,.learning-hint,.solution-calculation")).toHaveCount(0);
   await expect(p.getByRole("textbox")).toHaveValue("");
   await p.locator("[data-topic=mean]").focus(); await page.keyboard.press("Tab");
   await expect(p.locator("[data-topic=median]")).toBeFocused();
   await page.keyboard.press("Enter"); await expect(p.getByRole("textbox")).toBeFocused();
   await p.getByRole("button",{name:en?"University statistics":"Statystyka na studia",exact:true}).click();
   await expect(p.locator(".question")).toHaveCount(0);
   await p.getByRole("button",{name:en?"Statistics fundamentals":"Podstawy statystyki",exact:true}).click();
   await expect(p.locator(".question")).toHaveAttribute("data-lesson","mean");
   await expect(p.getByRole("textbox")).toHaveValue("");
  });
  test("keeps Mathematics question/session/progress and active-exam locks unchanged",async({page})=>{
   await page.getByRole("button",{name:/Najpierw mnożenie|Multiplication first/}).click();
   await page.getByRole("button",{name:en?"Start a session (10 exercises)":"Rozpocznij sesję (10 zadań)",exact:true}).click();
   await page.locator("#answer").fill("17");
   const question=await page.locator(".practice .question").innerText();
   const position=await page.locator(".session-progress").first().innerText();
   const snapshot=()=>page.evaluate(()=>({local:Object.fromEntries(Object.entries(localStorage)),session:Object.fromEntries(Object.entries(sessionStorage))}));
   const before=await snapshot();await enter(page);await submit(page,"2");
   await panel(page).getByRole("button",{name:copy.solution,exact:true}).click();
   expect(await snapshot()).toEqual(before);
   await page.locator(".subject-navigation").getByRole("button",{name:en?/Mathematics Available/:/Matematyka Dostępne/}).click();
   await expect(page.locator(".practice .question")).toHaveText(question);
   await expect(page.locator("#answer")).toHaveValue("17");
   await expect(page.locator(".session-progress").first()).toHaveText(position);
   for(let i=0;i<10;i++) {
          // Deliberately discard the retained, unchecked Mathematics answer.
          if (i === 0) page.once("dialog", dialog => { expect(dialog.type()).toBe("confirm"); return dialog.accept(); });
          await page.getByRole("button",{name:i===9?(en?"Finish session":"Zakończ sesję"):(en?"Next exercise":"Następne zadanie"),exact:true}).click();
        }
   const after=await snapshot();expect(JSON.parse(after.local[HISTORY_KEY]).sessions).toHaveLength(1);
   await enter(page);await submit(page,"2");expect(await snapshot()).toEqual(after);
   await page.locator(".subject-navigation").getByRole("button",{name:en?/Mathematics Available/:/Matematyka Dostępne/}).click();
   await page.getByRole("button",{name:en?"Exam":"Sprawdzian",exact:true}).click();
   await page.getByRole("button",{name:en?"Start exam":"Rozpocznij sprawdzian",exact:true}).click();
   for(const b of await page.locator(".subject-navigation").getByRole("button").all()) await expect(b).toBeDisabled();
  });
 });
}
