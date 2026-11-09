import {test,expect} from "@playwright/test";
import {shownFraction} from "./helpers/functions";
import {fractionText} from "./helpers/systems";
import {divideRational as div} from "../src/rational";
import {polishLearningText} from "./helpers/localization";

for(const width of [375,1280])for(const en of [false,true])
 test(`C02 quartic radical selectable in catalog: ${width}px ${en?"EN":"PL"}`,async({page})=>{
  test.setTimeout(90_000);
  const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
  await page.setViewportSize({width,height:950});await page.goto("/");
  await page.getByRole("button",{name:en?"English":"Matematyka na studia",exact:true}).click();
  if(en)await page.getByRole("button",{name:"University mathematics",exact:true}).click();
  await page.getByRole("button",{name:en?"Limits of sequences":"Granice ciągów",exact:true}).click();
  await page.getByRole("button",{name:en?"Medium":"Średni",exact:true}).click();
  const familyTitle=en?"Limits: square root of a quartic polynomial":"Granice: pierwiastek z wielomianu czwartego stopnia";
  const familyButton=page.locator(".exercise-list-items button").filter({
    has:page.locator("strong").getByText(familyTitle,{exact:true}),
  });
  await expect(familyButton).toHaveCount(1);
  await expect(familyButton).toBeEnabled();
  await familyButton.click();
  const question=page.locator(".question");
  await expect(question).toHaveAttribute("data-template-id","sequence-root-quartic");
  const rendered=await question.innerText();
  const parts=/aₙ\s*=\s*\(\(([^()]+)\)·n² \+ \(([^()]+)\)·n \+ \(([^()]+)\)\)\/√\(\(([^()]+)\)²·n⁴/.exec(rendered);
  if(!parts)throw Error("Cannot independently parse displayed numerator and root-leading coefficient: "+rendered);
  const expected=div(shownFraction(parts[1]),shownFraction(parts[4]));
  await page.getByRole("button",{name:en?"Check":"Sprawdź",exact:true}).click();
  await expect(page.locator(".feedback")).toHaveClass("feedback invalid");
  await page.locator("#answer").selectOption("positive-infinity");
  await page.getByRole("button",{name:en?"Check":"Sprawdź",exact:true}).click();
  await expect(page.locator(".feedback")).toHaveClass("feedback incorrect");
  await page.locator("#answer").selectOption("finite");
  await page.locator("#limit-value").fill(fractionText(expected));
  await page.getByRole("button",{name:en?"Check":"Sprawdź",exact:true}).click();
  await expect(page.locator(".feedback")).toHaveClass("feedback correct");
  await page.getByRole("button",{name:en?"Show solution":"Pokaż rozwiązanie",exact:true}).click();
  await page.getByRole("button",{name:en?"Show all steps":"Pokaż wszystkie kroki",exact:true}).click();
  await expect(page.locator(".solution-panel")).toContainText("n⁴");
  if(en)expect(await page.locator("main").innerText()).not.toMatch(polishLearningText);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
  expect(errors).toEqual([]);
 });
