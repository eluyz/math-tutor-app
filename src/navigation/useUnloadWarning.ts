import { useEffect } from "react";

/** Browser-provided wording also covers reload, tab close and cross-document Back. */
export function useUnloadWarning(unsaved: boolean) {
  useEffect(() => {
    if (!unsaved) return;
    function warn(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [unsaved]);
}
