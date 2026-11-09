/**
 * Correct only the *visible* Polish M01 addition hint.
 *
 * Historical education task payloads are snapshot-frozen (including hint text).
 * Do not mutate matrixTemplates, their answers, steps, or content keys here.
 */
export function displayedMatrixNextHint(
  task: Readonly<{ templateId: string; nextHint: string }>,
  locale: "pl" | "en",
): string {
  return locale === "pl" && task.templateId === "matrix-add"
    ? "Przy dodawaniu liczby ujemnej uwzględnij jej znak: a + (−b) = a − b. Dodawaj elementy w tych samych pozycjach."
    : task.nextHint;
}
