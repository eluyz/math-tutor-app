import type { ReactNode } from "react";

/**
 * Canonical selector panel for every playable learning subject.
 * Subject-specific controls stay inside the same accessible, full-width location.
 */
export function PracticeSelectorPanel({
  title, context, children, className = "",
}: {
  title: string;
  context: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <details className={`catalog-config ${className}`.trim()} open>
      <summary>{title}<span>{context}</span></summary>
      <div className="catalog-config-body">{children}</div>
    </details>
  );
}
