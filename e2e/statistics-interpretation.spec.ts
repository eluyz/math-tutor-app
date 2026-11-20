import { expect, test, type Locator, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";

// Literal answers for the six independently reviewed construction families.
// No production engine or grading helper is imported to calculate expectations.
const answers=["mean-equals-median","mean-above-median","mean-below-median","median-changes-less","mean-changes-less","equal-change"];

function textContrast(foreground:string,background:string) {
  const luminance=(rgb:string)=>(rgb.match(/[\d.]+/g)??[]).slice(0,3).map(Number).map(value=>{
    const s=value/255;return s<=0.04045?s/12.92:((s+0.055)/1.055)**2.4;
  }).reduce((sum,value,index)=>sum+value*[0.2126,0.7152,0.0722][index],0);
  const a=luminance(foreground),b=luminance(background);
  return (Math.max(a,b)+0.05)/(Math.min(a,b)+0.05);
}

for(const width of [375,768,1280]) for(const locale of ["pl","en"] as const) {
  const en=locale==="en";
  const c={check:en?"Check":"Sprawdź",next:en?"Next exercise":"Następne zadanie",hint:en?"Show hint":"Pokaż podpowiedź",
    hint2:en?"Show second hint":"Pokaż drugą podpowiedź",solution:en?"Show solution":"Pokaż rozwiązanie",
    title:en?"ST-104 — Statistical Interpretation":"ST-104 — Interpretacja statystyczna",
    group:en?"Choose one answer":"Wybierz jedną odpowiedź"};
  test.describe(`ST-104 ${locale} ${width}px`,()=>{
    test.use({viewport:{width,height:850}});
    async function open(page:Page) {
      await page.goto("/");
      if(en) await page.getByRole("button",{name:"English",exact:true}).click();
      await page.locator(".subject-navigation").getByRole("button",{name:/Statystyka|Statistics/}).click();
      const p=page.locator(".statistics-practice");
      await p.locator("[data-topic=interpretation]").click();
      await expect(p.getByRole("heading",{name:c.title,exact:true})).toBeVisible();
      await expect(p.locator(".statistics-heading .subject-roadmap-description")).toContainText(en?"statistical interpretation":"interpretację statystyczną");
      return p;
    }
    const selected=(p:Locator,id:string)=>p.locator(`input[type=radio][value="${id}"]`);
    async function submit(p:Locator,id:string) {
      await selected(p,id).check();
      await p.getByRole("button",{name:c.check,exact:true}).click();
    }
    async function noOverflow(page:Page) {
      expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
    }

    test("offers exactly three choices and grades all six families across all available levels",async({page})=>{
      const p=await open(page);
      for(const difficulty of ["easy","medium","hard"]) {
        await p.locator(`[data-level=${difficulty}]`).click();
        for(let seed=0;seed<6;seed++) {
          const question=p.locator(".question");
          await expect(question).toHaveAttribute("data-exercise-id",`st104-${difficulty}-${seed}`);
          await expect(p.getByRole("radiogroup",{name:c.group})).toBeVisible();
          await expect(p.getByRole("radio")).toHaveCount(3);
          await expect(p.getByRole("radio",{checked:true})).toHaveCount(0);
          const wrong=await p.getByRole("radio").evaluateAll((radios,correct)=>radios.map(r=>(r as HTMLInputElement).value).find(id=>id!==correct)!,answers[seed]);
          await submit(p,wrong);
          await expect(p.locator(".feedback")).toHaveClass(/incorrect/);
          await expect(p.locator(".feedback")).toContainText(en?"The answer differs.":"Odpowiedź jest inna.");
          await submit(p,answers[seed]);
          await expect(p.locator(".feedback")).toHaveClass(/\bcorrect\b/);
          await expect(p.locator(".feedback")).toContainText(en?"Correct answer.":"Poprawna odpowiedź.");
          if(seed===3) {
            await p.getByRole("button",{name:c.solution,exact:true}).click();
            await expect(p.locator(".solution-calculation")).toHaveCount(8);
            await expect(p.locator(".solution-calculation").nth(6)).toContainText("|Δμ|");
          }
          await noOverflow(page);
          if(seed<5) await p.getByRole("button",{name:c.next,exact:true}).click();
        }
      }
      for(const level of ["advanced","expert"]) await expect(p.locator(`[data-level=${level}]`)).toBeDisabled();
      for(const topic of ["data-tables","charts"]) await expect(p.locator(`[data-topic=${topic}]`)).toBeDisabled();
      await expect(p.locator("[data-topic=mode]")).toBeEnabled();
    });

    test("preserves identity, selection, hints, solution and results through locale and subject changes",async({page})=>{
      const p=await open(page);
      const storageBefore=await page.evaluate(()=>({local:{...localStorage},session:{...sessionStorage}}));
      await selected(p,answers[0]).check();
      await p.getByRole("button",{name:c.hint,exact:true}).click();
      await p.getByRole("button",{name:c.hint2,exact:true}).click();
      await p.getByRole("button",{name:c.solution,exact:true}).click();
      await expect(p.locator(".learning-hint")).toHaveCount(2);
      await expect(p.locator(".solution-calculation")).toHaveCount(4);
      const steps=await p.locator(".solution-calculation").allTextContents();
      await page.getByRole("button",{name:en?"Polski":"English",exact:true}).click();
      await expect(p.locator(".question")).toHaveAttribute("data-exercise-id","st104-easy-0");
      await expect(selected(p,answers[0])).toBeChecked();
      await expect(p.locator(".learning-hint")).toHaveCount(2);
      await expect(p.getByRole("radiogroup",{name:en?"Wybierz jedną odpowiedź":"Choose one answer"})).toBeVisible();
      for(const [id,sign] of [["mean-below-median","<"],["mean-equals-median","="],["mean-above-median",">"]]) {
        await expect(selected(p,id)).toHaveAccessibleName(en?`Średnia ${sign} mediana`:`Mean ${sign} median`);
      }
      await expect(p.locator(".learning-hint").first()).toHaveText(en
        ? "Oblicz średnią ze wszystkich obserwacji, a medianę wyznacz po ich uporządkowaniu."
        : "Calculate the mean from every observation, then obtain the median from the ordered data.");
      await expect(p.locator(".solution-panel h4").first()).toHaveText(en?"Liczba i suma obserwacji":"Observation count and sum");
      expect(await p.locator(".solution-calculation").allTextContents()).toEqual(steps);
      await p.getByRole("button",{name:en?"Sprawdź":"Check",exact:true}).click();
      await expect(p.locator(".feedback")).toContainText(en?"Poprawna odpowiedź.":"Correct answer.");
      await page.getByRole("button",{name:en?"English":"Polski",exact:true}).click();
      await expect(p.locator(".feedback")).toContainText(en?"Correct answer.":"Poprawna odpowiedź.");
      await page.locator(".subject-navigation button").first().click();
      await page.locator(".subject-navigation").getByRole("button",{name:/Statystyka|Statistics/}).click();
      await expect(selected(p,answers[0])).toBeChecked();
      await expect(p.locator(".learning-hint")).toHaveCount(2);
      await expect(p.locator(".feedback")).toHaveClass(/\bcorrect\b/);
      for(const label of await p.locator(".statistics-choice").all()) {
        const colors=await label.evaluate(el=>({text:getComputedStyle(el).color,background:getComputedStyle(el).backgroundColor}));
        expect(textContrast(colors.text,colors.background)).toBeGreaterThanOrEqual(4.5);
      }
      expect(await page.evaluate(()=>({local:{...localStorage},session:{...sessionStorage}}))).toEqual(storageBefore);
      await noOverflow(page);
      await mkdir("test-results/ui-evidence",{recursive:true});
      await p.locator(".statistics-task-panel").screenshot({path:`test-results/ui-evidence/st104-${locale}-${width}.png`});
    });

    test("supports native keyboard selection, empty/invalid feedback and dirty-task confirmation",async({page})=>{
      const p=await open(page),radios=p.getByRole("radio");
      await p.getByRole("button",{name:c.check,exact:true}).click();
      await expect(p.getByRole("radiogroup")).toHaveAttribute("aria-invalid","true");
      await expect(p.getByRole("radiogroup")).toHaveAccessibleDescription(en?/Choose an answer before checking it/:/Wybierz odpowiedź, aby ją sprawdzić/);
      await expect(p.locator(".feedback")).toContainText(en?"Choose an answer before checking it.":"Wybierz odpowiedź, aby ją sprawdzić.");
      await expect(radios).toHaveCount(3);
      await expect(radios.first()).toBeFocused();
      await expect(p.getByRole("radio",{checked:true})).toHaveCount(0);
      await page.keyboard.press("Space");
      await expect(radios.first()).toBeChecked();
      expect(await radios.first().evaluate(el=>el.matches(":focus-visible") && getComputedStyle(el).outlineStyle!=="none")).toBe(true);
      await page.keyboard.press("ArrowRight");
      await expect(radios.nth(1)).toBeChecked();
      await expect(radios.nth(1)).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(p.getByRole("button",{name:c.check,exact:true})).toBeFocused();
      await page.keyboard.press("Shift+Tab");
      await expect(radios.nth(1)).toBeFocused();
      await p.getByRole("button",{name:c.hint,exact:true}).click();
      await p.getByRole("button",{name:c.solution,exact:true}).click();
      const chosen=await radios.nth(1).inputValue();
      for(const target of [p.getByRole("button",{name:c.next,exact:true}),p.locator("[data-level=medium]"),p.locator("[data-topic=mean]"),p.locator("[data-track=university]")]) {
        const dialog=page.waitForEvent("dialog");
        const click=target.click();
        const confirmation=await dialog;
        expect(confirmation.type()).toBe("confirm");
        await confirmation.dismiss();await click;
        await expect(p.locator(".question")).toHaveAttribute("data-exercise-id","st104-easy-0");
        await expect(selected(p,chosen)).toBeChecked();
        await expect(p.locator(".learning-hint")).toHaveCount(1);
        await expect(p.locator(".solution-calculation")).toHaveCount(4);
      }
      const dialog=page.waitForEvent("dialog"),click=p.getByRole("button",{name:c.next,exact:true}).click();
      await (await dialog).accept();await click;
      await expect(p.locator(".question")).toHaveAttribute("data-exercise-id","st104-easy-1");
      await expect(p.getByRole("radio",{checked:true})).toHaveCount(0);
      await expect(p.locator(".learning-hint,.feedback,.solution-calculation")).toHaveCount(0);
      await expect(radios.first()).toBeFocused();
      // An altered DOM value must not be treated as a valid choice ID.
      await radios.first().evaluate(el=>{(el as HTMLInputElement).value="not-an-option";});
      await radios.first().click();
      await p.getByRole("button",{name:c.check,exact:true}).click();
      await expect(p.locator(".feedback")).toContainText(en?"Choose one of the answers offered for this question.":"Wybierz jedną z odpowiedzi podanych w tym pytaniu.");
      await expect(p.getByRole("radiogroup")).toHaveAttribute("aria-invalid","true");
      await selected(p,"mean-above-median").check();
      const levelDialog=page.waitForEvent("dialog"),levelClick=p.locator("[data-level=hard]").click();
      await (await levelDialog).accept();await levelClick;
      await expect(p.locator(".question")).toHaveAttribute("data-exercise-id","st104-hard-0");
      await expect(p.getByRole("radio",{checked:true})).toHaveCount(0);
      await noOverflow(page);
    });

    test("retains old lessons, shared layout and pointer track scroll policy",async({page})=>{
      const p=await open(page);
      for(const [topic,answer,lesson] of [["mean","2","mean"],["median","2","median"],["dispersion","2/5","variance"]]) {
        await p.locator(`[data-topic=${topic}]`).click();
        await expect(p.locator(".question")).toHaveAttribute("data-lesson",lesson);
        await p.locator("#statistics-answer").fill(answer);
        await p.getByRole("button",{name:c.check,exact:true}).click();
        await expect(p.locator(".feedback")).toHaveClass(/\bcorrect\b/);
      }
      await p.locator("[data-topic=interpretation]").click();
      const card=await p.locator(".statistics-task-panel").boundingBox(),selector=await p.locator(".statistics-catalog").boundingBox();
      expect(card).not.toBeNull();expect(selector).not.toBeNull();
      expect(selector!.y).toBeGreaterThanOrEqual(card!.y+card!.height);
      expect(Math.abs(card!.width-selector!.width)).toBeLessThanOrEqual(2);
      for(const label of await p.locator(".statistics-choice").all()) {
        const box=await label.boundingBox();expect(box).not.toBeNull();expect(box!.height).toBeGreaterThanOrEqual(44);
        const radio=await label.locator("input").boundingBox(),text=await label.locator("span").boundingBox();
        expect(radio).not.toBeNull();expect(text).not.toBeNull();
        expect(text!.x-radio!.x-radio!.width).toBeGreaterThanOrEqual(8);
        expect(Math.abs((radio!.y+radio!.height/2)-(text!.y+text!.height/2))).toBeLessThanOrEqual(2);
        expect(await label.evaluate(el=>parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(16);
      }
      for(const track of ["university","fundamentals"]) {
        const target=p.locator(`[data-track=${track}]`);
        await target.scrollIntoViewIfNeeded();
        const before=await page.evaluate(()=>scrollY),box=await target.boundingBox();
        expect(box).not.toBeNull();await page.mouse.click(box!.x+box!.width/2,box!.y+box!.height/2);
        await expect(target).toHaveAttribute("aria-pressed","true");
        // A shorter document can clamp scroll naturally; an additional focus jump cannot.
        const offsets=await page.evaluate(async old=>{
          const deltas:number[]=[];
          for(let frame=0;frame<6;frame++) {
            await new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));
            deltas.push(Math.abs(scrollY-Math.min(old,Math.max(0,document.documentElement.scrollHeight-innerHeight))));
          }
          return deltas;
        },before);
        expect(Math.max(...offsets)).toBeLessThanOrEqual(2);
      }
      await expect(p.locator(".question")).toHaveAttribute("data-lesson","mean");
      await noOverflow(page);
    });
  });
}
