import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect } from "vitest";
import { makeSingleHoleRecovery, singleHoleGeometry } from "./graphSingleHoleRecovery";
import { SingleHoleRecoveryDisplay } from "./graphSingleHoleRecoveryDisplay";

/** Server-rendered structural accessibility check, not a browser visual screenshot. */
describe("F05/e-like isolated bilingual SVG",()=>{
  for(const difficulty of ["hard","advanced","expert"] as const)
    for(const locale of ["pl","en"] as const)
      for(const variant of [0,2,13,23]){
        it(difficulty+"/"+locale+"/"+variant+" has one excluded x with 2 hollow and 2 filled distinct endpoints",()=>{
          const problem=makeSingleHoleRecovery(variant,difficulty),g=singleHoleGeometry(problem);
          const html=renderToStaticMarkup(createElement(SingleHoleRecoveryDisplay,{problem,locale}));
          expect(html).toContain('role="img"');
          expect(html).toContain('aria-labelledby=');
          expect(html).toContain('data-graph-kind="function-single-hole-recovery"');
          expect(html).toContain('viewBox="0 0 400 275"');
          expect(html.match(/data-testid="single-hole-hollow"/g)).toHaveLength(2);
          expect(html.match(/data-testid="single-hole-filled"/g)).toHaveLength(2);
          expect(html.match(/data-testid="single-hole-tail-arrow"/g)).toHaveLength(1);
          expect(html.match(/data-testid="single-hole-left-tail"/g)).toHaveLength(1);
          expect(html.match(/data-testid="single-hole-rise"/g)).toHaveLength(1);
          expect(html.match(/data-testid="single-hole-fall"/g)).toHaveLength(1);
          expect(html.match(/data-testid="single-hole-x-tick"/g)).toHaveLength(3);
          expect(html).toContain('data-branch="left"');
          expect(html).toContain('data-branch="right"');
          expect(html).toContain('data-role="maximum"');
          expect(html).toContain('data-role="endpoint"');
          expect(html).toContain('data-x="'+g.c+'"');
          expect(html).toContain('data-y="'+g.A+'"');
          expect(html).toContain('data-y="'+g.B+'"');
          expect(html).toContain('data-x="'+g.R+'"');
          expect(html).toContain('fill="var(--color-bg, white)"');
          expect(html).toContain('class="function-graph-text"');
          if(locale==="pl"){
            expect(html).toContain("Opis wykresu w tekście");
            expect(html).toContain("Obie puste wysokości");
          }else{
            expect(html).toContain("Graph described in text");
            expect(html).toContain("hollow");
          }
        });
      }
});


/** Independent pixel-space spacing gate across the whole 72-profile pack.
 * This is a structural clearance check, not a substitute for human screenshots.
 */
describe("F05/e: all 72 SVG profiles keep required axis labels readable",()=>{
  for(const level of ["hard","advanced","expert"] as const)
    for(let variant=0;variant<24;variant++)
      it(level+":"+variant+" labels both hollow limits and the maximum without overlap",()=>{
        const problem=makeSingleHoleRecovery(variant,level);
        const g=singleHoleGeometry(problem);
        const html=renderToStaticMarkup(createElement(SingleHoleRecoveryDisplay,{
          problem,locale:"pl",
        }));
        const shown=[...html.matchAll(
          /<text data-testid="single-hole-y-label" data-y="([^"]+)" x="18" y="([^"]+)"/g,
        )].map(m=>({value:Number(m[1]),pixel:Number(m[2])}));
        expect(shown.length).toBeGreaterThanOrEqual(3);
        expect(shown.length).toBeLessThanOrEqual(4);
        for(const essential of [g.B,g.A,g.H])
          expect(shown.map(t=>t.value)).toContain(essential);
        for(let a=0;a<shown.length;a++)
          for(let b=a+1;b<shown.length;b++)
            expect(Math.abs(shown[a].pixel-shown[b].pixel),
              "Axis labels collide at "+level+":"+variant).toBeGreaterThanOrEqual(16);
        expect(html).toContain('data-role="endpoint"');
        expect(html).toContain('data-y="'+g.E+'"');
      });
});
