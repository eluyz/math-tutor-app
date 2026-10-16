import { useEffect, useLayoutEffect, useReducer, useRef, useState, type PointerEvent } from "react";
import { createScratchpad, scratchpadReducer, intersects, type Point } from "./model";
import "./scratchpad.css";

const symbols = ["x²", "√", "Δ", "×", "÷", "±", "→", "≠"];
type Gesture = { pointerId: number; points: Point[]; erased: Set<number>; erasing: boolean };
export function Scratchpad({ run, active }: { run: number; active: boolean }) {
  const [state, dispatch] = useReducer(scratchpadReducer, undefined, createScratchpad);
  const [editorGeneration, setEditorGeneration] = useState(0);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [expanded, setExpanded] = useState(false);
  const [draft, setDraft] = useState<readonly Point[]>([]);
  const [erased, setErased] = useState<ReadonlySet<number>>(new Set());
  const gesture = useRef<Gesture | null>(null);
  const nextId = useRef(0);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const expandButton = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const selection = useRef({ start: 0, end: 0 });
  const programmaticHistory = useRef(false);

  function cancelGesture() {
    const current = gesture.current;
    gesture.current = null;
    if (current && svg.current?.hasPointerCapture(current.pointerId)) svg.current.releasePointerCapture(current.pointerId);
    setDraft([]); setErased(new Set());
  }
  useLayoutEffect(() => {
    cancelGesture();
    if (run !== state.run && state.autoClear) {
      // A blank value can still have native Undo history after Backspace.
      // Replace only the editor at this boundary, even when its text is unchanged.
      setEditorGeneration((generation) => generation + 1);
      selection.current = { start: 0, end: 0 };
      programmaticHistory.current = false;
    }
    dispatch({ type: "run", run });
  }, [run]);
  // Other changes keep this uncontrolled textarea mounted and preserve native Undo.
  useLayoutEffect(() => {
    if (textarea.current && textarea.current.value !== state.present.text) {
      textarea.current.value = state.present.text;
      selection.current = { start: state.present.text.length, end: state.present.text.length };
      programmaticHistory.current = true;
    }
  }, [state.present.text]);
  useEffect(() => { if (!active) setExpanded(false); }, [active]);
  useEffect(() => {
    if (!expanded) return;
    const opener = expandButton.current;
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    return () => { document.body.style.overflow = before; opener?.focus(); };
  }, [expanded]);

  function point(event: PointerEvent<SVGSVGElement>): Point {
    const box = event.currentTarget.getBoundingClientRect();
    return { x: (event.clientX - box.left) * 1000 / box.width, y: (event.clientY - box.top) * 600 / box.height };
  }
  function updateGesture(p: Point) {
    const current = gesture.current;
    if (!current) return;
    if (current.erasing) {
      const previous = current.points.at(-1)!;
      for (const stroke of state.present.strokes) if (intersects(stroke, previous, p)) current.erased.add(stroke.id);
      setErased(new Set(current.erased));
    }
    current.points.push(p);
    if (!current.erasing) setDraft([...current.points]);
  }
  function finishGesture() {
    const current = gesture.current;
    if (!current) return;
    if (current.erasing) dispatch({ type: "erase", ids: [...current.erased] });
    else dispatch({ type: "stroke", stroke: { id: nextId.current++, points: current.points } });
    cancelGesture();
  }
  function insertSymbol(symbol: string) {
    const input = textarea.current!;
    input.focus();
    input.setSelectionRange(selection.current.start, selection.current.end);
    // insertText joins the browser's native editing history (also on mobile Safari).
    if (!document.execCommand("insertText", false, symbol)) {
      input.setRangeText(symbol, input.selectionStart, input.selectionEnd, "end");
      dispatch({ type: "text", text: input.value });
      programmaticHistory.current = true;
    }
    selection.current = { start: input.selectionStart, end: input.selectionEnd };
  }
  const controls = <>
    <div className="scratchpad-toolbar" role="group" aria-label="Tryb brudnopisu">
      <button type="button" aria-pressed={state.mode === "draw"} onClick={() => dispatch({ type: "mode", mode: "draw" })}>Rysuj</button>
      <button type="button" aria-pressed={state.mode === "write"} onClick={() => dispatch({ type: "mode", mode: "write" })}>Pisz</button>
    </div>
    <div className="scratchpad-toolbar" role="group" aria-label="Narzędzia brudnopisu">
      <button type="button" disabled={state.mode !== "draw"} aria-pressed={tool === "pen"} onClick={() => setTool("pen")}>Pióro</button>
      <button type="button" disabled={state.mode !== "draw"} aria-pressed={tool === "eraser"} onClick={() => setTool("eraser")}>Gumka</button>
      <button type="button" disabled={!state.past.length} onClick={() => { cancelGesture(); dispatch({ type: "undo" }); }}>Cofnij</button>
      <button type="button" disabled={!state.future.length} onClick={() => { cancelGesture(); dispatch({ type: "redo" }); }}>Ponów</button>
      <button type="button" disabled={!state.present.text && !state.present.strokes.length} aria-label="Wyczyść wszystko" onClick={() => { cancelGesture(); dispatch({ type: "clear" }); }}>Wyczyść</button>
    </div>
  </>;
  return <div hidden={!active}>
    <div ref={panel} className={`scratchpad${expanded ? " scratchpad-expanded" : ""}`}
      role={expanded ? "dialog" : "region"} aria-modal={expanded ? true : undefined} aria-label="Brudnopis"
      onKeyDown={(event) => {
        if (event.key === "Escape" && expanded) { event.preventDefault(); cancelGesture(); setExpanded(false); }
        if (event.key === "Tab" && expanded) {
          const focusable = [...panel.current!.querySelectorAll<HTMLElement>('button:not(:disabled), textarea, input')].filter((el) => el.getClientRects().length);
          const first = focusable[0], last = focusable.at(-1);
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
          else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
        }
      }}>
      <div className="scratchpad-heading"><h4>Brudnopis</h4>
        <button ref={expandButton} hidden={expanded} type="button" onClick={() => { cancelGesture(); setExpanded(true); }}>Powiększ</button>
        <button ref={closeButton} hidden={!expanded} type="button" onClick={() => { cancelGesture(); setExpanded(false); }}>Zamknij</button>
      </div>
      {controls}
      <div hidden={state.mode !== "draw"}>
        <p className="input-help" id="drawing-help">Rysuj myszą, palcem lub piórkiem. Gumka usuwa cały dotknięty ślad.</p>
        <svg ref={svg} className="scratchpad-drawing" viewBox="0 0 1000 600" aria-label="Pole rysowania" aria-describedby="drawing-help" role="img"
          onPointerDown={(event) => {
            if (!event.isPrimary || event.button !== 0 || gesture.current) return;
            event.preventDefault();
            const p = point(event);
            gesture.current = { pointerId: event.pointerId, points: [p], erased: new Set(), erasing: tool === "eraser" };
            event.currentTarget.setPointerCapture(event.pointerId);
            updateGesture(p);
          }}
          onPointerMove={(event) => {
            if (gesture.current?.pointerId !== event.pointerId) return;
            const p = point(event);
            if (p.x < 0 || p.x > 1000 || p.y < 0 || p.y > 600) finishGesture();
            else updateGesture(p);
          }}
          onPointerUp={(event) => { if (gesture.current?.pointerId === event.pointerId) { const p = point(event); if (p.x >= 0 && p.x <= 1000 && p.y >= 0 && p.y <= 600) updateGesture(p); finishGesture(); } }}
          onPointerCancel={(event) => { if (gesture.current?.pointerId === event.pointerId) cancelGesture(); }} onLostPointerCapture={(event) => { if (gesture.current?.pointerId === event.pointerId) cancelGesture(); }}>
          {state.present.strokes.filter((s) => !erased.has(s.id)).map((s) => <polyline data-stroke={s.id} key={s.id} points={s.points.map((p) => `${p.x},${p.y}`).join(" ")} />)}
          {!!draft.length && <polyline points={draft.map((p) => `${p.x},${p.y}`).join(" ")} />}
        </svg>
      </div>
      <div hidden={state.mode !== "write"}>
        <div className="scratchpad-toolbar" role="group" aria-label="Symbole matematyczne">
          {symbols.map((symbol) => <button key={symbol} type="button" aria-label={`Wstaw ${symbol}`}
            onMouseDown={(event) => event.preventDefault()} onClick={() => insertSymbol(symbol)}>{symbol}</button>)}
        </div>
        <label htmlFor="scratchpad-text">Notatki tekstowe</label>
        <textarea key={editorGeneration} ref={textarea} id="scratchpad-text" rows={7} spellCheck={false}
          onSelect={(event) => { selection.current = { start: event.currentTarget.selectionStart, end: event.currentTarget.selectionEnd }; }}
          onInput={(event) => { dispatch({ type: "text", text: event.currentTarget.value }); programmaticHistory.current = false; }}
          onKeyDown={(event) => {
            if ((event.ctrlKey || event.metaKey) && (event.key.toLowerCase() === "z" || event.key.toLowerCase() === "y") && programmaticHistory.current) {
              event.preventDefault(); dispatch({ type: event.shiftKey || event.key.toLowerCase() === "y" ? "redo" : "undo" });
            }
          }} />
      </div>
      <label className="scratchpad-auto"><input type="checkbox" checked={state.autoClear} onChange={(event) => dispatch({ type: "autoClear", value: event.target.checked })} />Czyść brudnopis przy nowym zadaniu</label>
      <p className="input-help">Notatki pozostają wyłącznie w tej karcie do odświeżenia strony.</p>
    </div>
  </div>;
}
