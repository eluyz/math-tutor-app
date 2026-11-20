import { useEffect, useRef, type FocusEvent, type ReactNode } from "react";

/**
 * Single task-selector panel for all learning subjects.
 * Keep keyboard focus visibly in the viewport even if a subject's exercise
 * shifts the selector below the fold. This does not change pointer navigation
 * or the existing explicit track-switch scroll preservation.
 */
function keepKeyboardFocusVisible(event: FocusEvent<HTMLElement>) {
  const target = event.target;
  if (!(target instanceof HTMLElement) || !target.matches(":focus-visible")) return;
  const { top, bottom } = target.getBoundingClientRect();
  // Native browser focus usually does this itself. The explicit fallback is
  // needed for nested selector panels rendered after an active task.
  if (top < 0 || bottom > window.innerHeight) {
    target.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "instant" });
  }
}

export function PracticeSelectorPanel({
  title, context, children, className = "", expandOn = false,
}: {
  title: string;
  context: string;
  children: ReactNode;
  className?: string;
  /** When a practice session completes, expose selectors and difficulty controls. */
  expandOn?: boolean;
}) {
  const details = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    if (expandOn && details.current) details.current.open = true;
  }, [expandOn]);
  return (
    <details ref={details} className={`catalog-config ${className}`.trim()} open onFocusCapture={keepKeyboardFocusVisible}>
      <summary>{title}<span>{context}</span></summary>
      <div className="catalog-config-body">{children}</div>
    </details>
  );
}
