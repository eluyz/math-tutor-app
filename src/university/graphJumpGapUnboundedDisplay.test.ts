import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { makeJumpGapUnbounded, jumpGapGeometry } from "./graphJumpGapUnbounded";
import { JumpGapUnboundedDisplay } from "./graphJumpGapUnboundedDisplay";

describe("F05/c source-inspired synthetic graph accessible SVG",()=>{
  for(const level of ["hard","advanced","expert"] as const)
    for(const locale of ["pl","en"] as const)
      for(const variant of [0,2,13,23])
        it(level+"/"+locale+"/"+variant+" draws jump, separate gap, two infinite arrows",()=>{
          const p=makeJumpGapUnbounded(variant,level);
          jumpGapGeometry(p);
          const html=renderToStaticMarkup(createElement(JumpGapUnboundedDisplay,{problem:p,locale}));
          expect(html).toContain('data-graph-kind="function-jump-gap-unbounded"');
          expect(html).toContain('viewBox="0 0 400 280"');
          expect(html).toContain('role="img"');
          expect(html).toContain("aria-labelledby");
          expect(html.match(/data-testid="jump-gap-hollow"/g)).toHaveLength(3);
          expect(html.match(/data-testid="jump-gap-filled"/g)).toHaveLength(2);
          expect(html.match(/data-testid="jump-gap-x-label"/g)).toHaveLength(4);
          for(const role of ["left","middle","down","right"])
            expect(html).toContain('data-testid="jump-gap-segment-'+role+'"');
          for(const side of ["left","right"])
            expect(html).toContain('data-testid="jump-gap-'+side+'-arrow"');
          for(const role of ["jump","gap-left","gap-right"])
            expect(html).toContain('data-role="'+role+'"');
          expect(html).toContain('data-role="minimum"');
          expect(html).toContain('data-x="'+p.a+'"');
          expect(html).toContain('data-x="'+p.b+'"');
          expect(html).toContain('data-x="'+p.c+'"');
          expect(html).toContain('data-x="'+p.t+'"');
          expect(html).toContain('data-y="'+p.upper+'"');
          expect(html).toContain('data-y="'+p.lower+'"');
          expect(html).toContain('data-y="'+p.rightMin+'"');
          expect(html).toContain('fill="var(--color-bg, white)"');
          expect(html).toContain('class="function-graph-text"');
          expect(html).toContain("figcaption");
          expect(html).toContain(locale==="pl"?"Opis wykresu w tekście":"Graph described in text");
        });
  it("all 72 SVG profiles keep the two hollow jump/gap marks apart",()=>{
    for(const level of ["hard","advanced","expert"] as const)
      for(let variant=0;variant<24;variant++){
        const p=makeJumpGapUnbounded(variant,level);
        const html=renderToStaticMarkup(createElement(JumpGapUnboundedDisplay,{problem:p,locale:"pl"}));
        const circles=[...html.matchAll(/<circle [^>]*data-testid="jump-gap-hollow"[^>]*>/g)].map(x=>x[0]);
        expect(circles).toHaveLength(3);
        const jump=circles.find(x=>x.includes('data-role="jump"'));
        const x0=Number(jump?.match(/cx="([^"]+)"/)?.[1]);
        const y0=Number(jump?.match(/cy="([^"]+)"/)?.[1]);
        const filled=[...html.matchAll(/<circle [^>]*data-testid="jump-gap-filled"[^>]*>/g)].map(x=>x[0]);
        const lower=filled.find(x=>x.includes('data-role="jump"'));
        expect(Number(lower?.match(/cx="([^"]+)"/)?.[1])).toBeCloseTo(x0,9);
        expect(Math.abs(Number(lower?.match(/cy="([^"]+)"/)?.[1])-y0))
          .toBeGreaterThan(5);
        expect(html).not.toContain("NaN");
      }
  });
});
