import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { makeAsymptoticJump } from "./graphAsymptoticJump";
import { AsymptoticJumpDisplay } from "./graphAsymptoticJumpDisplay";

describe("F05/f curved synthetic graph with two horizontal asymptotes",()=>{
  for(const level of ["hard","advanced","expert"] as const)
    for(const locale of ["pl","en"] as const)
      for(const v of [0,2,12,23])
        it(level+"/"+v+"/"+locale+" has a curved plot, correct hollow/filled and alt text",()=>{
          const p=makeAsymptoticJump(v,level);
          const html=renderToStaticMarkup(createElement(AsymptoticJumpDisplay,{problem:p,locale}));
          expect(html).toContain('role="img"');
          expect(html).toContain('aria-labelledby=');
          expect(html).toContain('viewBox="0 0 400 280"');
          expect(html).toContain('data-graph-kind="function-asymptotic-jump-injective"');
          expect(html).toContain('data-testid="asymptotic-jump-left"');
          expect(html).toContain('data-testid="asymptotic-jump-right"');
          expect(html).toContain('data-testid="asymptotic-jump-left-arrow"');
          expect(html).toContain('data-testid="asymptotic-jump-right-arrow"');
          expect(html.match(/data-testid="asymptotic-jump-asymptote"/g)).toHaveLength(2);
          expect(html).toContain('stroke-dasharray="5 5"');
          expect(html).toContain('data-testid="asymptotic-jump-hollow" data-x="0" data-y="'+(p.A-p.k)+'"');
          expect(html).toContain('data-testid="asymptotic-jump-filled" data-x="0" data-y="'+p.B+'"');
          expect(html).toContain('fill="var(--color-bg, white)"');
          expect(html).toContain('class="function-graph-text"');
          expect(html).toContain(locale==="pl"?"Opis wykresu w tekście":"Graph described in text");
          expect(html).toContain(locale==="pl"?"nie mają części wspólnej":"disjoint");
          expect(html).not.toContain("NaN");
        });
  it("72 profiles draw numerically monotonic curved path vertices within the viewport",()=>{
    for(const level of ["hard","advanced","expert"] as const)
      for(let v=0;v<24;v++){
        const p=makeAsymptoticJump(v,level);
        const html=renderToStaticMarkup(createElement(AsymptoticJumpDisplay,{problem:p,locale:"pl"}));
        const paths=[...html.matchAll(/<path data-testid="asymptotic-jump-(left|right)" d="([^"]+)"/g)];
        expect(paths).toHaveLength(2);
        for(const [_,side,d] of paths){
          const coordinates=[...d.matchAll(/[ML] (-?[\d.]+) (-?[\d.]+)/g)]
            .map(match=>[Number(match[1]),Number(match[2])] as const);
          expect(coordinates.length).toBeGreaterThan(50);
          for(let i=0;i<coordinates.length;i++){
            const [x,y]=coordinates[i];
            expect(Number.isFinite(x)&&Number.isFinite(y)).toBe(true);
            expect(x).toBeGreaterThan(15);
            expect(x).toBeLessThan(385);
            expect(y).toBeGreaterThan(10);
            expect(y).toBeLessThan(250);
            if(i>0){
              expect(x).toBeGreaterThan(coordinates[i-1][0]);
              if(side==="left")expect(y).toBeGreaterThan(coordinates[i-1][1]);
              else expect(y).toBeLessThan(coordinates[i-1][1]);
            }
          }
        }
      }
  });
});
