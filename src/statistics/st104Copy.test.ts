import { expect, it } from "vitest";
import { compareCentres, compareReplacement, generateInterpretationTask, type InterpretationTask } from "./interpretationTasks";
import { interpretationCopy } from "./st104Copy";

for(const locale of ["pl","en"] as const) {
  it.each(["easy","medium","hard"] as const)(`builds complete value-driven ${locale} lessons across 256 %s seeds`,difficulty=>{
    for(let seed=0;seed<256;seed++) {
      const task=generateInterpretationTask(difficulty,seed);
      const copy=interpretationCopy(task,locale);
      expect(copy.prompt).toContain(task.original.values.join(", "));
      expect(copy.hints).toHaveLength(2);
      expect(copy.hints.every(hint=>hint.trim().length>20)).toBe(true);
      expect(copy.options.map(option=>option.id)).toEqual(task.options);
      expect(new Set(copy.options.map(option=>option.label)).size).toBe(3);
      expect(copy.steps).toHaveLength(task.kind==="compare-centres"?4:8);
      for(const step of copy.steps) for(const text of Object.values(step)) expect(text.trim().length).toBeGreaterThan(0);
      for(const text of Object.values(copy.feedback)) expect(text.trim().length).toBeGreaterThan(15);
      if(task.kind==="compare-changes") {
        expect(copy.prompt).toContain(String(task.replacement.index+1));
        expect(copy.prompt).toContain(task.modified.values.join(", "));
        expect(copy.prompt).toContain(locale==="pl"?"wartość bezwzględną różnicy":"the absolute value of the difference");
        expect(copy.conclusion).toContain(locale==="pl"?"tej konkretnej zamiany":"this particular replacement");
      }
      if(locale==="en") expect(JSON.stringify(copy)).not.toMatch(/\b(średnia|mediana|Zamień|obserwacji|Wybierz|Podpowiedź)\b/iu);
    }
  });

  it(`shows independently fixed mean/median and change calculations ${locale}`,()=>{
    const original=compareReplacement([0,0,0,5,5],0,15);
    const task={...original,id:"manual",difficulty:"easy",seed:0} satisfies InterpretationTask;
    const copy=interpretationCopy(task,locale);
    expect(copy.steps[1].calculation).toBe("μ = (10)/5 = 2");
    expect(copy.steps[2].calculation).toContain("Me = x[3] = 0");
    expect(copy.steps[4].calculation).toBe("μ = (25)/5 = 5");
    expect(copy.steps[5].calculation).toContain("Me = x[3] = 5");
    expect(copy.steps[6].calculation).toBe("|Δμ| = |(5) − (2)| = 3; |ΔMe| = |(5) − (0)| = 5");
    expect(copy.steps[7].calculation).toBe("3 < 5");
    expect(copy.conclusion).toContain(locale==="pl"?"Średnia":"The mean");
    expect(copy.prompt).toContain(locale==="pl"?"pozycji 1":"position 1");
  });

  it(`explains even medians, repeated values and nonzero equal changes ${locale}`,()=>{
    const task={...compareReplacement([0,0,0,2,2,2],0,6),id:"manual",difficulty:"medium",seed:0} satisfies InterpretationTask;
    const copy=interpretationCopy(task,locale);
    expect(copy.steps[2].calculation).toContain("k₁ = 3; k₂ = 4");
    expect(copy.steps[2].calculation).toContain("Me = ((0) + (2))/2 = 1");
    expect(copy.steps[5].calculation).toContain("Me = ((2) + (2))/2 = 2");
    expect(copy.steps[7].calculation).toBe("1 = 1");
    expect(copy.conclusion).toContain(locale==="pl"?"Obie miary":"Both measures");
  });

  it(`does not turn cached answer metadata into teaching truth ${locale}`,()=>{
    const task={...compareCentres([1,1,1,1,16]),id:"manual",difficulty:"easy",seed:0,answer:"mean-below-median"} satisfies InterpretationTask;
    const copy=interpretationCopy(task,locale);
    expect(copy.steps[3].calculation).toContain(" > ");
    expect(copy.conclusion).toContain(locale==="pl"?"większa":"greater");
  });

  it(`does not label a no-op as a detected outlier ${locale}`,()=>{
    const task={...compareReplacement([1,1,1],0,1),id:"manual",difficulty:"easy",seed:0} satisfies InterpretationTask;
    const copy=interpretationCopy(task,locale);
    expect(copy.steps[7].calculation).toBe("0 = 0");
    expect(copy.prompt).not.toMatch(/outlier|odstając/iu);
  });

  it(`uses an exact negative half-integer in the comparison ${locale}`,()=>{
    const task={...compareCentres([-4,-1]),id:"manual",difficulty:"hard",seed:0} satisfies InterpretationTask;
    const copy=interpretationCopy(task,locale);
    expect(copy.steps[1].calculation).toBe("μ = (−5)/2 = −5/2");
    expect(copy.steps[3].calculation).toBe("−5/2 = −5/2");
  });

  it(`defines absolute difference before asking about a sign-changing replacement ${locale}`,()=>{
    const task=generateInterpretationTask("hard",275);
    expect(task.kind).toBe("compare-changes");
    if(task.kind!=="compare-changes") throw new Error("Missing replacement witness");
    expect(task.original.mean).toEqual({numerator:-43n,denominator:9n});
    expect(task.modified.mean).toEqual({numerator:2n,denominator:9n});
    expect(task.original.median).toEqual({numerator:-7n,denominator:1n});
    expect(task.modified.median).toEqual({numerator:-2n,denominator:1n});
    expect(task.answer).toBe("equal-change");
    const copy=interpretationCopy(task,locale);
    expect(copy.steps[7].calculation).toBe("5 = 5");
    // |after-before| is 5 for both measures. Using ||after|-|before||
    // instead would give 41/9 for the mean and falsely select it as smaller.
    expect(copy.prompt).toContain(locale==="pl"
      ? "wartość bezwzględną różnicy między jej wartością po zamianie i przed zamianą"
      : "the absolute value of the difference between its value after and before the replacement");
  });
}
it("rejects unsupported teaching locales",()=>{
  expect(()=>interpretationCopy(generateInterpretationTask("easy",0),"de" as "en")).toThrow(RangeError);
});
