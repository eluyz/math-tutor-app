import { expect, test } from "@playwright/test";

for(const width of [320,375,1280]) for(const en of [false,true]) {
 test(`Statistics hierarchy and shared gutters ${width}px ${en?"EN":"PL"}`,async({page})=>{
  await page.setViewportSize({width,height:width===1280?800:812});
  const errors:string[]=[];
  page.on("pageerror",e=>errors.push(e.message));
  page.on("console",m=>{if(m.type()==="error") errors.push(m.text());});
  await page.goto("/");if(en)await page.getByRole("button",{name:"English",exact:true}).click();
  const subject=page.locator(".subject-navigation");
  const top=await subject.getByRole("button").first().boundingBox();
  const bottom=await page.locator(".view-navigation").getByRole("button").first().boundingBox();
  expect(top).not.toBeNull();expect(bottom).not.toBeNull();
  expect(Math.abs(top!.x-bottom!.x)).toBeLessThanOrEqual(2);
  for(const b of await page.locator(".subject-navigation button,.view-navigation button").all()) {
   const box=await b.boundingBox();expect(box).not.toBeNull();
   expect(box!.x).toBeGreaterThanOrEqual(0);expect(box!.x+box!.width).toBeLessThanOrEqual(width+1);
   expect(box!.height).toBeGreaterThanOrEqual(40);
  }
  await subject.getByRole("button").first().focus();await page.keyboard.press("Tab");
  await expect(subject.getByRole("button").nth(1)).toBeFocused();await page.keyboard.press("Enter");
  const p=page.locator(".statistics-practice");
  const tracks=p.getByRole("group",{name:en?"Learning track":"Ścieżka nauki",exact:true});
  const topics=p.getByRole("group",{name:en?"Topic":"Temat",exact:true});
  const levels=p.getByRole("group",{name:en?"Difficulty":"Poziom trudności",exact:true});
  await expect(tracks.getByRole("button")).toHaveText(en?["Statistics fundamentals","University statistics"]:["Podstawy statystyki","Statystyka na studia"]);
  await expect(p.locator("[data-track=fundamentals]")).toHaveAttribute("aria-pressed","true");
  await expect(topics.getByRole("button")).toHaveCount(7);
  await expect(topics.locator("button:enabled")).toHaveCount(5);
  expect(await topics.locator("button:enabled").evaluateAll(buttons=>buttons.map(button=>button.getAttribute("data-topic")))).toEqual(["mean","median","mode","dispersion","interpretation"]);
  expect(await topics.locator("button:disabled").evaluateAll(buttons=>buttons.map(button=>button.getAttribute("data-topic")))).toEqual(["data-tables","charts"]);
  await expect(p.locator("[data-topic=mean]")).toHaveAttribute("aria-pressed","true");
  await expect(p.locator("[data-topic=median]")).toBeEnabled();
  await expect(p.locator("[data-topic=dispersion]")).toBeEnabled();
  await p.locator("[data-topic=dispersion]").click();
  await expect(p.locator(".question")).toHaveAttribute("data-lesson","variance");
  await expect(p.getByRole("heading",{name:en?"ST-103 — Population variance":"ST-103 — Wariancja populacyjna"})).toBeVisible();
  await expect(levels.getByRole("button")).toHaveText(en?["Easy","Medium","Hard","Advanced","Expert"]:["Łatwy","Średni","Trudny","Zaawansowany","Ekspert"]);
  await expect(levels.locator("button:enabled")).toHaveCount(3);
  await expect(levels.locator("[data-level=easy]")).toHaveAttribute("aria-pressed","true");
  for(const id of ["medium","hard","advanced","expert"]) await expect(levels.locator(`[data-level=${id}]`)).toHaveAttribute("aria-pressed","false");
  for(const id of ["advanced","expert"]) {
   await expect(levels.locator(`[data-level=${id}]`)).toBeDisabled();
   await expect(levels.locator(`[data-level=${id}]`)).toHaveAccessibleDescription(en?/not available/i:/niedostępne/i);
  }
  for(const row of [tracks,topics,levels]) {
   const box=await row.getByRole("button").first().boundingBox();
   expect(box).not.toBeNull();expect(Math.abs(box!.x-top!.x)).toBeLessThanOrEqual(2);
  }
  await p.locator("[data-track=university]").click();
  await expect(p.locator("[data-track=university]")).toHaveAttribute("aria-pressed","true");
  await expect(topics.getByRole("button")).toHaveCount(9);
  await expect(topics.locator("button:enabled")).toHaveCount(0);
  expect(await topics.locator("button:disabled").evaluateAll(buttons=>buttons.map(button=>button.getAttribute("data-topic"))))
   .toEqual(["descriptive","combinatorics","probability","conditional","random-variables","distributions","estimation","hypothesis-tests","correlation"]);
  await expect(levels.locator("button:enabled")).toHaveCount(0);
  for(const level of await levels.getByRole("button").all()) await expect(level).toHaveAttribute("aria-pressed","false");
  await expect(p.locator(".question,form,.solution-calculation")).toHaveCount(0);
  await expect(p.getByText(en?"University topics are planned; no exercises are available in this track yet.":"Zagadnienia na studia są planowane; w tej ścieżce nie ma jeszcze dostępnych zadań.",{exact:true})).toBeVisible();
  await page.getByRole("button",{name:en?"Polski":"English",exact:true}).click();
  await expect(p.locator("[data-track=university]")).toHaveAttribute("aria-pressed","true");
  const translatedTopics=p.getByRole("group",{name:en?"Temat":"Topic",exact:true});
  const translatedLevels=p.getByRole("group",{name:en?"Poziom trudności":"Difficulty",exact:true});
  await expect(translatedTopics.getByRole("button").first()).toHaveText(en?"Statystyka opisowa":"Descriptive statistics");
  await expect(translatedLevels.locator("button:enabled")).toHaveCount(0);
  await p.locator("[data-track=fundamentals]").click();
  await expect(p.locator(".question")).toHaveAttribute("data-lesson","mean");
  await expect(p.locator("[data-track=fundamentals]")).toBeFocused();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
  expect(errors).toEqual([]);
 });
}
