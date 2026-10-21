import { useLocale } from "../locales/LocaleProvider";
import {
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
  type PointerEvent,
} from "react";
import {
  createScratchpad,
  scratchpadReducer,
  intersects,
  type Point,
} from "./model";
import "./scratchpad.css";

const symbols = ["x²", "√", "Δ", "×", "÷", "±", "→", "≠"];
type Gesture = {
  pointerId: number;
  points: Point[];
  erased: Set<number>;
  erasing: boolean;
};
export function Scratchpad({ run, active, idPrefix = "" }: { run: number; active: boolean; idPrefix?: string }) {
  const { copy } = useLocale();
  const fieldId = (name: string) => `${idPrefix}${name}`;
  const s = copy.scratchpad;
  const [state, dispatch] = useReducer(
    scratchpadReducer,
    undefined,
    createScratchpad,
  );
  const [editorGeneration, setEditorGeneration] = useState(0);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [expanded, setExpanded] = useState(false);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<readonly Point[]>([]);
  const [erased, setErased] = useState<ReadonlySet<number>>(new Set());
  const gesture = useRef<Gesture | null>(null);
  const nextId = useRef(0);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const expandButton = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const toggleButton = useRef<HTMLButtonElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const selection = useRef({ start: 0, end: 0 });
  const programmaticHistory = useRef(false);

  function cancelGesture() {
    const current = gesture.current;
    gesture.current = null;
    if (current && svg.current?.hasPointerCapture(current.pointerId))
      svg.current.releasePointerCapture(current.pointerId);
    setDraft([]);
    setErased(new Set());
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
      selection.current = {
        start: state.present.text.length,
        end: state.present.text.length,
      };
      programmaticHistory.current = true;
    }
  }, [state.present.text]);
  useEffect(() => {
    if (!active) {
      cancelGesture();
      setExpanded(false);
    }
  }, [active]);
  useEffect(() => {
    if (!expanded) return;
    const opener = expandButton.current;
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    return () => {
      document.body.style.overflow = before;
      if (opener?.getClientRects().length) opener.focus();
      else if (toggleButton.current?.getClientRects().length)
        toggleButton.current.focus();
    };
  }, [expanded]);

  function point(event: PointerEvent<SVGSVGElement>): Point {
    const box = event.currentTarget.getBoundingClientRect();
    return {
      x: ((event.clientX - box.left) * 1000) / box.width,
      y: ((event.clientY - box.top) * 600) / box.height,
    };
  }
  function updateGesture(p: Point) {
    const current = gesture.current;
    if (!current) return;
    if (current.erasing) {
      const previous = current.points.at(-1)!;
      for (const stroke of state.present.strokes)
        if (intersects(stroke, previous, p)) current.erased.add(stroke.id);
      setErased(new Set(current.erased));
    }
    current.points.push(p);
    if (!current.erasing) setDraft([...current.points]);
  }
  function finishGesture() {
    const current = gesture.current;
    if (!current) return;
    if (current.erasing) dispatch({ type: "erase", ids: [...current.erased] });
    else
      dispatch({
        type: "stroke",
        stroke: { id: nextId.current++, points: current.points },
      });
    cancelGesture();
  }
  function insertSymbol(symbol: string) {
    const input = textarea.current!;
    input.focus();
    input.setSelectionRange(selection.current.start, selection.current.end);
    // insertText joins the browser's native editing history (also on mobile Safari).
    if (!document.execCommand("insertText", false, symbol)) {
      input.setRangeText(
        symbol,
        input.selectionStart,
        input.selectionEnd,
        "end",
      );
      dispatch({ type: "text", text: input.value });
      programmaticHistory.current = true;
    }
    selection.current = {
      start: input.selectionStart,
      end: input.selectionEnd,
    };
  }
  const controls = (
    <>
      <div className="scratchpad-toolbar" role="group" aria-label={s.mode}>
        <button
          type="button"
          aria-pressed={state.mode === "draw"}
          onClick={() => dispatch({ type: "mode", mode: "draw" })}
        >
          {s.draw}
        </button>
        <button
          type="button"
          aria-pressed={state.mode === "write"}
          onClick={() => dispatch({ type: "mode", mode: "write" })}
        >
          {s.write}
        </button>
      </div>
      <div className="scratchpad-toolbar" role="group" aria-label={s.tools}>
        <button
          type="button"
          disabled={state.mode !== "draw"}
          aria-pressed={tool === "pen"}
          onClick={() => setTool("pen")}
        >
          {s.pen}
        </button>
        <button
          type="button"
          disabled={state.mode !== "draw"}
          aria-pressed={tool === "eraser"}
          onClick={() => setTool("eraser")}
        >
          {s.eraser}
        </button>
        <button
          type="button"
          disabled={!state.past.length}
          onClick={() => {
            cancelGesture();
            dispatch({ type: "undo" });
          }}
        >
          {s.undo}
        </button>
        <button
          type="button"
          disabled={!state.future.length}
          onClick={() => {
            cancelGesture();
            dispatch({ type: "redo" });
          }}
        >
          {s.redo}
        </button>
        <button
          type="button"
          disabled={!state.present.text && !state.present.strokes.length}
          aria-label={s.clearAll}
          onClick={() => {
            cancelGesture();
            dispatch({ type: "clear" });
          }}
        >
          {s.clear}
        </button>
      </div>
    </>
  );
  return (
    <div hidden={!active}>
      <div
        ref={panel}
        className={`scratchpad${expanded ? " scratchpad-expanded" : ""}${!open ? " scratchpad-collapsed" : ""}`}
        role={expanded ? "dialog" : "region"}
        aria-modal={expanded ? true : undefined}
        aria-label={s.name}
        onKeyDown={(event) => {
          if (event.key === "Escape" && expanded) {
            event.preventDefault();
            cancelGesture();
            setExpanded(false);
          }
          if (event.key === "Tab" && expanded) {
            const focusable = [
              ...panel.current!.querySelectorAll<HTMLElement>(
                "button:not(:disabled), textarea, input",
              ),
            ].filter((el) => el.getClientRects().length);
            const first = focusable[0],
              last = focusable.at(-1);
            if (event.shiftKey && document.activeElement === first) {
              event.preventDefault();
              last?.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
              event.preventDefault();
              first?.focus();
            }
          }
        }}
      >
        <div className="scratchpad-heading">
          <h4>{s.name}</h4>
          <button
            ref={expandButton}
            hidden={expanded || !open}
            type="button"
            onClick={() => {
              cancelGesture();
              setExpanded(true);
            }}
          >
            {s.expand}
          </button>
          <button
            ref={toggleButton}
            type="button"
            aria-expanded={open}
            aria-controls={fieldId("scratchpad-content")}
            onClick={() => {
              cancelGesture();
              if (open) {
                if (textarea.current) selection.current = {
                  start: textarea.current.selectionStart,
                  end: textarea.current.selectionEnd,
                };
                setExpanded(false);
              } else if (textarea.current) {
                textarea.current.setSelectionRange(
                  selection.current.start, selection.current.end,
                );
              }
              setOpen(!open);
              toggleButton.current?.focus();
            }}
          >
            {open ? s.hide : s.show}
          </button>
          <button
            ref={closeButton}
            hidden={!expanded}
            type="button"
            onClick={() => {
              cancelGesture();
              setExpanded(false);
            }}
          >
            {s.close}
          </button>
        </div>
        <div id={fieldId("scratchpad-content")} hidden={!open}>
        {controls}
        <div hidden={state.mode !== "draw"}>
          <p className="input-help" id={fieldId("drawing-help")}>
            {s.help}
          </p>
          <svg
            ref={svg}
            className="scratchpad-drawing"
            viewBox="0 0 1000 600"
            aria-label={s.drawing}
            aria-describedby={fieldId("drawing-help")}
            role="img"
            onPointerDown={(event) => {
              if (!event.isPrimary || event.button !== 0 || gesture.current)
                return;
              event.preventDefault();
              const p = point(event);
              gesture.current = {
                pointerId: event.pointerId,
                points: [p],
                erased: new Set(),
                erasing: tool === "eraser",
              };
              event.currentTarget.setPointerCapture(event.pointerId);
              updateGesture(p);
            }}
            onPointerMove={(event) => {
              if (gesture.current?.pointerId !== event.pointerId) return;
              const p = point(event);
              if (p.x < 0 || p.x > 1000 || p.y < 0 || p.y > 600)
                finishGesture();
              else updateGesture(p);
            }}
            onPointerUp={(event) => {
              if (gesture.current?.pointerId === event.pointerId) {
                const p = point(event);
                if (p.x >= 0 && p.x <= 1000 && p.y >= 0 && p.y <= 600)
                  updateGesture(p);
                finishGesture();
              }
            }}
            onPointerCancel={(event) => {
              if (gesture.current?.pointerId === event.pointerId)
                cancelGesture();
            }}
            onLostPointerCapture={(event) => {
              if (gesture.current?.pointerId === event.pointerId)
                cancelGesture();
            }}
          >
            {state.present.strokes
              .filter((s) => !erased.has(s.id))
              .map((s) => (
                <polyline
                  data-stroke={s.id}
                  key={s.id}
                  points={s.points.map((p) => `${p.x},${p.y}`).join(" ")}
                />
              ))}
            {!!draft.length && (
              <polyline points={draft.map((p) => `${p.x},${p.y}`).join(" ")} />
            )}
          </svg>
        </div>
        <div hidden={state.mode !== "write"}>
          <div
            className="scratchpad-toolbar"
            role="group"
            aria-label={s.symbols}
          >
            {symbols.map((symbol) => (
              <button
                key={symbol}
                type="button"
                aria-label={s.insert(symbol)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => insertSymbol(symbol)}
              >
                {symbol}
              </button>
            ))}
          </div>
          <label htmlFor={fieldId("scratchpad-text")}>{s.notes}</label>
          <textarea
            key={editorGeneration}
            ref={textarea}
            id={fieldId("scratchpad-text")}
            rows={7}
            spellCheck={false}
            onSelect={(event) => {
              selection.current = {
                start: event.currentTarget.selectionStart,
                end: event.currentTarget.selectionEnd,
              };
            }}
            onInput={(event) => {
              dispatch({ type: "text", text: event.currentTarget.value });
              programmaticHistory.current = false;
            }}
            onKeyDown={(event) => {
              if (
                (event.ctrlKey || event.metaKey) &&
                (event.key.toLowerCase() === "z" ||
                  event.key.toLowerCase() === "y") &&
                programmaticHistory.current
              ) {
                event.preventDefault();
                dispatch({
                  type:
                    event.shiftKey || event.key.toLowerCase() === "y"
                      ? "redo"
                      : "undo",
                });
              }
            }}
          />
        </div>
        <label className="scratchpad-auto">
          <input
            type="checkbox"
            checked={state.autoClear}
            onChange={(event) =>
              dispatch({ type: "autoClear", value: event.target.checked })
            }
          />
          {s.auto}
        </label>
        <p className="input-help">{s.privacy}</p>
        </div>
      </div>
    </div>
  );
}
