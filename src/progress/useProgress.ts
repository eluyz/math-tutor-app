import { useRef, useState } from "react";
import { type CompletedSession } from "./model";
import { deleteProgress, loadProgress, saveCompletion } from "./storage";

const browserStorage = () => window.localStorage;
export function useProgress() {
  const [state, setState] = useState(() => loadProgress(browserStorage));
  const current = useRef(state);
  function record(session: CompletedSession) {
    const next = saveCompletion(current.current, session, browserStorage);
    current.current = next;
    setState(next);
  }
  function clear() {
    const next = deleteProgress(current.current, browserStorage);
    current.current = next;
    setState(next);
    return next.issue === null;
  }
  return { ...state, record, clear };
}
