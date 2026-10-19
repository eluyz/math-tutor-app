import type { GeneratedTask } from "../generators";
import type { Locale } from "./types";
import { englishTask, familyEnglish } from "./lessons-en";
import { isUniversityTask, localizeUniversity, universityFamilies } from "../university/catalog";
/** Locale selects authored presentation only; generation and mathematical identity are external. */
const presenters: Record<Locale, (task: GeneratedTask) => GeneratedTask> = {
  pl: (task) => task,
  en: englishTask,
};
export function localizeTask(
  task: GeneratedTask,
  locale: Locale,
): GeneratedTask {
  if (isUniversityTask(task)) return localizeUniversity(task, locale);
  return presenters[locale](task);
}
export function familyTitle(
  template: { id: string; title: string },
  locale: Locale,
): string {
  const university = universityFamilies.find((family) => family.id === template.id);
  if (university) return university.titles[locale];
  return locale === "pl" ? template.title : familyEnglish[template.id][0];
}
