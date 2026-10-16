import { describe, it, expect } from "vitest";
import { createScratchpad, scratchpadReducer as reduce, intersects, HISTORY_LIMIT, type Stroke } from "./model";
const stroke: Stroke = { id: 1, points: [{ x: 10, y: 10 }, { x: 80, y: 80 }] };
describe("wektorowy brudnopis", () => {
  it("zachowuje oba tryby, cofa całe ślady, gumkę oraz wspólne czyszczenie", () => {
    let s = reduce(createScratchpad(), { type: "stroke", stroke });
    s = reduce(s, { type: "text", text: "Δ = 4" });
    for (const mode of ["write", "draw"] as const) s = reduce(s, { type: "mode", mode });
    expect(s.present).toEqual({ text: "Δ = 4", strokes: [stroke] });
    s = reduce(s, { type: "erase", ids: [1] });
    expect(s.present.strokes).toEqual([]);
    s = reduce(s, { type: "undo" });
    expect(s.present.strokes).toEqual([stroke]);
    s = reduce(s, { type: "clear" });
    expect(s.present).toEqual({ text: "", strokes: [] });
    s = reduce(s, { type: "undo" });
    expect(s.present).toEqual({ text: "Δ = 4", strokes: [stroke] });
    expect(reduce(s, { type: "redo" }).present).toEqual({ text: "", strokes: [] });
  });
  it("automatyczny reset jest nieodwracalną granicą nawet przy tej samej treści", () => {
    let s = reduce(createScratchpad(), { type: "stroke", stroke });
    expect(reduce(s, { type: "run", run: 0 })).toBe(s);
    s = reduce(s, { type: "run", run: 1 });
    expect(reduce(s, { type: "undo" })).toBe(s);
    expect(s.present.strokes).toEqual([]);
    s = reduce(s, { type: "autoClear", value: false });
    s = reduce(s, { type: "text", text: "zachowaj" });
    s = reduce(s, { type: "run", run: 2 });
    expect(s.present.text).toBe("zachowaj");
  });
  it("ogranicza historię i odrzuca przyszłość po nowej operacji", () => {
    let s = createScratchpad();
    for (let i = 0; i < 200; i++) s = reduce(s, { type: "text", text: String(i) });
    expect(s.past).toHaveLength(HISTORY_LIMIT);
    s = reduce(s, { type: "undo" });
    s = reduce(s, { type: "text", text: "nowy kierunek" });
    expect(s.future).toHaveLength(0);
    expect(reduce(s, { type: "erase", ids: [999] })).toBe(s);
  });
  it("gumka przecina segmenty, w tym długie i jednoelementowe ślady", () => {
    expect(intersects(stroke, { x: 0, y: 80 }, { x: 80, y: 0 })).toBe(true);
    expect(intersects(stroke, { x: 500, y: 0 }, { x: 500, y: 80 })).toBe(false);
    expect(intersects({ id: 2, points: [{ x: 40, y: 40 }] }, { x: 0, y: 40 }, { x: 80, y: 40 })).toBe(true);
  });
});
