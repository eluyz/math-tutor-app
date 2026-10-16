/** Stable 1000×600 vector workspace, independent of display size or device pixels. */
export type Point = Readonly<{ x: number; y: number }>;
export type Stroke = Readonly<{ id: number; points: readonly Point[] }>;
export type Notes = Readonly<{ text: string; strokes: readonly Stroke[] }>;
export type ScratchpadState = Readonly<{
  present: Notes; past: readonly Notes[]; future: readonly Notes[];
  mode: "draw" | "write"; autoClear: boolean; run: number;
}>;
export const HISTORY_LIMIT = 80;
export const emptyNotes = (): Notes => ({ text: "", strokes: [] });
export const createScratchpad = (): ScratchpadState => ({ present: emptyNotes(), past: [], future: [], mode: "draw", autoClear: true, run: 0 });
export type ScratchpadAction =
  | { type: "stroke"; stroke: Stroke }
  | { type: "erase"; ids: readonly number[] }
  | { type: "text"; text: string }
  | { type: "mode"; mode: ScratchpadState["mode"] }
  | { type: "autoClear"; value: boolean }
  | { type: "run"; run: number }
  | { type: "clear" | "undo" | "redo" };
function commit(state: ScratchpadState, present: Notes): ScratchpadState {
  if (present.text === state.present.text && present.strokes === state.present.strokes) return state;
  return { ...state, present, past: [...state.past, state.present].slice(-HISTORY_LIMIT), future: [] };
}
export function scratchpadReducer(state: ScratchpadState, action: ScratchpadAction): ScratchpadState {
  switch (action.type) {
    case "stroke": return action.stroke.points.length ? commit(state, { ...state.present, strokes: [...state.present.strokes, action.stroke] }) : state;
    case "erase": return state.present.strokes.some((s) => action.ids.includes(s.id))
      ? commit(state, { ...state.present, strokes: state.present.strokes.filter((s) => !action.ids.includes(s.id)) }) : state;
    case "text": return commit(state, { ...state.present, text: action.text });
    case "mode": return { ...state, mode: action.mode };
    case "autoClear": return { ...state, autoClear: action.value };
    case "run": return action.run === state.run ? state : { ...state, run: action.run,
      ...(state.autoClear ? { present: emptyNotes(), past: [], future: [] } : {}) };
    case "clear": return state.present.text || state.present.strokes.length ? commit(state, emptyNotes()) : state;
    case "undo": return state.past.length ? { ...state, present: state.past.at(-1)!, past: state.past.slice(0, -1), future: [state.present, ...state.future].slice(0, HISTORY_LIMIT) } : state;
    case "redo": return state.future.length ? { ...state, present: state.future[0], past: [...state.past, state.present].slice(-HISTORY_LIMIT), future: state.future.slice(1) } : state;
  }
}
function distanceToSegment(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x, dy = b.y - a.y;
  const t = dx || dy ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy))) : 0;
  return Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy);
}
/** Include the swept eraser segment, so fast movement doesn't skip thin strokes. */
export function intersects(stroke: Stroke, from: Point, to: Point, radius = 15): boolean {
  return stroke.points.some((p, i, points) => {
    const previous = points[Math.max(0, i - 1)];
    const cross = (a: Point, b: Point, c: Point) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
    const crosses = cross(from, to, previous) * cross(from, to, p) < 0 && cross(previous, p, from) * cross(previous, p, to) < 0;
    return crosses || Math.min(distanceToSegment(p, from, to), distanceToSegment(previous, from, to),
      distanceToSegment(from, previous, p), distanceToSegment(to, previous, p)) <= radius;
  });
}
