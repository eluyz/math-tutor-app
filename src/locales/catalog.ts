import type { GeneratedTask } from "../generators";
import type { Locale } from "./types";
import { englishTask, familyEnglish } from "./lessons-en";
/** Locale selects authored presentation only; generation and mathematical identity are external. */
const presenters: Record<Locale, (task: GeneratedTask) => GeneratedTask> = {
  pl: (task) => task,
  en: englishTask,
};
export function localizeTask(
  task: GeneratedTask,
  locale: Locale,
): GeneratedTask {
  return presenters[locale](task);
}
export function familyTitle(
  template: { id: string; title: string },
  locale: Locale,
): string {
  return locale === "pl" ? template.title : familyEnglish[template.id][0];
}
