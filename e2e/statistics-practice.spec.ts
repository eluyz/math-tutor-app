import { expect, test, type Page } from "@playwright/test";
import { HISTORY_KEY } from "../src/progress/model";

const copies = {
  pl: { subject:"Statystyka i prawdopodobieństwo", math:/Matematyka Dostępne/, title:"ST-101 — Średnia arytmetyczna", easy:"Łatwy", medium:"Średni", hard:"Trudny", answer:"Twoja odpowiedź", check:"Sprawdź", next:"Następne zadanie", hint1:"Pokaż podpowiedź", hint2:"Pokaż drugą podpowiedź", solution:"Pokaż rozwiązanie", hide:"Ukryj rozwiązanie", correct:"Poprawna odpowiedź.", wrong:"Wynik jest inny.", empty:"Wpisz odpowiedź, aby ją sprawdzić.", invalid:"Podaj liczbę całkowitą", exam:"Sprawdzian", startExam:"Rozpocznij sprawdzian", startSession:"Rozpocznij sesję (10 zadań)" },
  en: { subject:"Statistics & Probability", math:/Mathematics Available/, title:"ST-101 — Arithmetic mean", easy:"Easy", medium:"Medium", hard:"Hard", answer:"Your answer", check:"Check", next:"Next exercise", hint1:"Show hint", hint2:"Show second hint", solution:"Show solution", hide:"Hide solution", correct:"Correct answer.", wrong:"The result differs.", empty:"Enter an answer before checking it.", invalid:"Enter an integer", exam:"Exam", startExam:"Start exam", startSession:"Start a session (10 exercises)" },
};

async function storage(page: Page) {
  return page.evaluate(()=>({local:Object.fromEntries(Object.entries(localStorage)), session:Object.fromEntries(Object.entries(sessionStorage))}));
}

for (const viewport of [{width:375,height:812},{width:1280,height:800}]) {
  for (const locale of ["pl","en"] as const) {
    const c=copies[locale];
    test.describe(`ST-101 ${locale} ${viewport.width}px`,()=>{
      test.use({viewport});
      const errors=new WeakMap<Page,string[]>();
      test.beforeEach(async({page})=>{
        errors.set(page,[]);
        page.on("pageerror",error=>errors.get(page)!.push(error.message));
        page.on("console",message=>{if(message.type()==="error") errors.get(page)!.push(message.text());});
        page.on("requestfailed",request=>errors.get(page)!.push(`requestfailed ${request.url()}`));
        page.on("response",response=>{if(response.status()>=400) errors.get(page)!.push(`HTTP ${response.status()} ${response.url()}`);});
        await page.goto("/");
        if(locale==="en") await page.getByRole("button",{name:"English",exact:true}).click();
      });
      test.afterEach(async({page})=>{
        expect(errors.get(page)).toEqual([]);
        expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
      });
      async function enter(page:Page) {
        await page.locator(".subject-navigation").getByRole("button",{name:new RegExp(c.subject)}).click();
        await expect(page.getByRole("heading",{name:c.title,exact:true})).toBeVisible();
      }
      function panel(page:Page) {return page.locator(".statistics-practice");}
      async function submit(page:Page,answer:string) {
        await panel(page).getByLabel(c.answer,{exact:true}).fill(answer);
        await panel(page).getByRole("button",{name:c.check,exact:true}).click();
      }

      test("pins all difficulty datasets and exact correct/wrong/invalid answers",async({page})=>{
        const before=await storage(page);
        await enter(page);
        const p=panel(page), input=p.getByLabel(c.answer,{exact:true});
        await expect(p.getByText(locale === "pl" ? "W rozwoju" : "Work in progress",{exact:true})).toBeVisible();
        await expect(p.getByRole("group",{name:locale==="pl"?"Poziom trudności":"Difficulty"}).getByRole("button")).toHaveCount(3);
        await expect(p.locator(".question")).toContainText("3, 2, 2, 1, 2");
        await expect(p.locator(".question")).toHaveAttribute("data-seed","0");
        await expect(p.locator(".solution-calculation")).toHaveCount(0);
        for(const answer of ["","   "]) {
          await submit(page,answer);
          await expect(p.locator(".feedback")).toContainText(c.empty);
          await expect(input).toHaveAttribute("aria-invalid","true");
        }
        for(const answer of ["1/0","9".repeat(101),"1+1","sqrt(4)","1e2"]) {
          await submit(page,answer);
          await expect(p.locator(".feedback")).toContainText(c.invalid);
        }
        await submit(page,"3"); await expect(p.locator(".feedback")).toContainText(c.wrong);
        for(const answer of ["2","4/2","2.0","2,00"]) {
          await submit(page,answer); await expect(p.locator(".feedback")).toContainText(c.correct);
        }
        await p.getByRole("button",{name:c.medium,exact:true}).click();
        await expect(input).toBeFocused();
        await expect(p.locator(".feedback")).toHaveCount(0);
        await expect(p.locator(".question")).toContainText("3, 3, 1, 16, 7, 13");
        for(const answer of ["43/6","86/12","−86/−12"]) {
          await submit(page,answer); await expect(p.locator(".feedback")).toContainText(c.correct);
        }
        for(const answer of ["43/5","7.1666666667"]) {
          await submit(page,answer); await expect(p.locator(".feedback")).toContainText(c.wrong);
        }
        await p.getByRole("button",{name:c.hard,exact:true}).click();
        await expect(p.locator(".question")).toContainText("-16, -13, 8, 17, -1, 14, -9");
        await submit(page,"0"); await expect(p.locator(".feedback")).toContainText(c.correct);
        await submit(page,"1"); await expect(p.locator(".feedback")).toContainText(c.wrong);
        expect(await storage(page)).toEqual(before);
        await expect(p.getByRole("button",{name:/median|warianc|variance/i})).toHaveCount(0);
      });

      test("reveals both original hints and every solution step, then resets with next/difficulty",async({page})=>{
        await enter(page); const p=panel(page);
        await p.getByRole("button",{name:c.medium,exact:true}).click();
        const first=p.getByRole("button",{name:c.hint1,exact:true});
        await expect(first).toHaveAttribute("aria-expanded","false");
        await first.click();
        await expect(p.locator(".learning-hint")).toHaveCount(1);
        await expect(p.locator(".learning-hint").first()).toHaveText(locale==="pl"?"Policz wszystkie obserwacje, uwzględniając powtórzenia.":"Count every observation, including repeated values.");
        await expect(p.getByRole("button",{name:c.hint2,exact:true})).toHaveAttribute("aria-expanded","true");
        await p.getByRole("button",{name:c.hint2,exact:true}).click();
        await expect(p.locator(".learning-hint")).toHaveCount(2);
        await expect(p.locator(".learning-hint").nth(1)).toHaveText(locale==="pl"?"Dodaj wszystkie wartości, a następnie podziel sumę przez liczbę obserwacji.":"Add all the values, then divide their sum by the number of observations.");
        await expect(p.locator(".learning-hint")).not.toContainText(["43/6","43/6"]);
        await p.getByRole("button",{name:c.solution,exact:true}).click();
        await expect(p.getByRole("button",{name:c.hide,exact:true})).toHaveAttribute("aria-expanded","true");
        await expect(p.locator(".solution-calculation")).toHaveText(["n = 6","Σx = 3 + 3 + 1 + 16 + 7 + 13 = 43","μ = (43)/6 = 43/6"]);
        await expect(p.locator(".solution-step-explanation")).toHaveText(locale==="pl"?[
          "Każda podana wartość to jedna obserwacja, także gdy się powtarza.","Dodaj wszystkie obserwacje, zachowując znaki liczb ujemnych.","Średnia to suma podzielona przez n. Zachowaj wynik dokładny; nie zaokrąglaj ułamka.",
        ]:["Each listed value is one observation, even when it is repeated.","Add every observation, retaining the signs of negative values.","The mean is the sum divided by n. Keep the result exact; do not round a fraction."]);
        await submit(page,"43/6");
        await p.getByRole("button",{name:c.next,exact:true}).click();
        await expect(p.getByLabel(c.answer,{exact:true})).toBeFocused();
        await expect(p.getByLabel(c.answer,{exact:true})).toHaveValue("");
        await expect(p.locator(".question")).toHaveAttribute("data-seed","1");
        await expect(p.locator(".question")).toContainText("2, 2, 3, 10, 1, 7");
        await expect(p.locator(".feedback, .learning-hint, .solution-calculation")).toHaveCount(0);
        await submit(page,"25/6"); await expect(p.locator(".feedback")).toContainText(c.correct);
        await p.getByRole("button",{name:c.hard,exact:true}).click();
        await expect(p.locator(".question")).toHaveAttribute("data-seed","0");
        await p.getByRole("button",{name:c.solution,exact:true}).click();
        await expect(p.locator(".solution-calculation")).toHaveText(["n = 7","Σx = (-16) + (-13) + 8 + 17 + (-1) + 14 + (-9) = 0","μ = (0)/7 = 0"]);
      });

      test("keeps input/question/reveals across locale changes and supports keyboard submission",async({page})=>{
        await enter(page); const p=panel(page);
        await expect(page.locator("#st101-title")).toBeFocused();
        await p.getByRole("button",{name:c.medium,exact:true}).click();
        const input=p.getByLabel(c.answer,{exact:true});
        await input.fill("86/12");
        await input.press("Tab");
        await expect(p.getByRole("button",{name:c.check,exact:true})).toBeFocused();
        await page.keyboard.press("Enter");
        await expect(p.locator(".feedback")).toContainText(c.correct);
        await p.getByRole("button",{name:c.hint1,exact:true}).click();
        await p.getByRole("button",{name:c.solution,exact:true}).click();
        const question=await p.locator(".question").getAttribute("data-seed");
        await page.getByRole("button",{name:locale==="pl"?"English":"Polski",exact:true}).click();
        const other=copies[locale==="pl"?"en":"pl"];
        await expect(p.getByLabel(other.answer,{exact:true})).toHaveValue("86/12");
        await expect(p.locator(".question")).toHaveAttribute("data-seed",question!);
        await expect(p.locator(".question")).toContainText("3, 3, 1, 16, 7, 13");
        await expect(p.locator(".feedback")).toContainText(other.correct);
        await expect(p.locator(".learning-hint")).toHaveCount(1);
        await expect(p.locator(".solution-calculation").last()).toHaveText("μ = (43)/6 = 43/6");
        await expect(page.getByRole("button",{name:locale==="pl"?"English":"Polski",exact:true})).toBeFocused();
        await p.getByLabel(other.answer,{exact:true}).fill("43/5");
        await expect(p.locator(".feedback")).toHaveCount(0);
        await p.getByLabel(other.answer,{exact:true}).press("Enter");
        await expect(p.locator(".feedback")).toContainText(other.wrong);
      });

      test("preserves Mathematics session/input/storage and active-exam subject lock",async({page})=>{
        await page.getByRole("button",{name:/Najpierw mnożenie|Multiplication first/}).click();
        await page.getByRole("button",{name:c.startSession,exact:true}).click();
        await page.locator("#answer").fill("17");
        const mathQuestion=await page.locator(".practice .question").innerText();
        const position=await page.locator(".session-progress").first().innerText();
        const before=await storage(page);
        await enter(page);
        await submit(page,"2");
        await panel(page).getByRole("button",{name:c.solution,exact:true}).click();
        await panel(page).getByRole("button",{name:c.next,exact:true}).click();
        expect(await storage(page)).toEqual(before);
        await page.locator(".subject-navigation").getByRole("button",{name:c.math}).click();
        await expect(page.locator(".practice .question")).toHaveText(mathQuestion);
        await expect(page.locator("#answer")).toHaveValue("17");
        await expect(page.locator(".session-progress").first()).toHaveText(position);
        for(let index=0;index<10;index++) await page.getByRole("button",{name:index===9?(locale==="pl"?"Zakończ sesję":"Finish session"):(locale==="pl"?"Następne zadanie":"Next exercise"),exact:true}).click();
        const afterSession=await storage(page);
        expect(JSON.parse(afterSession.local[HISTORY_KEY]).sessions).toHaveLength(1);
        await enter(page); await submit(page,"2");
        await page.locator(".subject-navigation").getByRole("button",{name:c.math}).click();
        expect(await storage(page)).toEqual(afterSession);
        await page.getByRole("button",{name:c.exam,exact:true}).click();
        await page.getByRole("button",{name:c.startExam,exact:true}).click();
        for (const subject of await page.locator(".subject-navigation").getByRole("button").all()) await expect(subject).toBeDisabled();
        await expect(page.locator(".statistics-practice")).toBeHidden();
        const question=await page.locator(".exam-work .question").innerText();
        await page.getByRole("link",{name:locale==="pl"?"Math Tutor — strona startowa":"Math Tutor — home"}).click();
        await expect(page.locator(".exam-work .question")).toHaveText(question);
      });
    });
  }
}
