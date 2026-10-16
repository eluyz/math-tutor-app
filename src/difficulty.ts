/** Canonical order, labels and teaching intent. Locale never affects an ID. */
export const difficultyConfig = [
  { id: "easy", labels: { pl: "Łatwy", en: "Easy" }, description: { pl: "Jedna technika, małe kroki.", en: "One technique, small steps." } },
  { id: "medium", labels: { pl: "Średni", en: "Medium" }, description: { pl: "Standardowe rachunki i przekształcenia.", en: "Standard calculations and transformations." } },
  { id: "hard", labels: { pl: "Trudny", en: "Hard" }, description: { pl: "Znaki, ułamki i trudniejsze przypadki.", en: "Signs, fractions and more demanding cases." } },
  { id: "advanced", labels: { pl: "Zaawansowany", en: "Advanced" }, description: { pl: "Połącz zależne działania i wybierz ich kolejność.", en: "Connect dependent operations and choose their order." } },
  { id: "expert", labels: { pl: "Ekspert", en: "Expert" }, description: { pl: "Zaplanuj rozwiązanie łączące kilka umiejętności.", en: "Plan a solution combining several skills." } },
] as const;
export type Difficulty = typeof difficultyConfig[number]["id"];
export type LegacyDifficulty = Extract<Difficulty, "easy" | "medium" | "hard">;
export type HigherDifficulty = Exclude<Difficulty, LegacyDifficulty>;
export const difficulties: readonly Difficulty[] = difficultyConfig.map((level) => level.id);
export const legacyDifficulties = difficulties.filter((level): level is LegacyDifficulty => !["advanced", "expert"].includes(level));
export const higherDifficulties = difficulties.filter((level): level is HigherDifficulty => !legacyDifficulties.includes(level as LegacyDifficulty));
export const isLegacyDifficulty = (level: Difficulty): level is LegacyDifficulty => legacyDifficulties.includes(level as LegacyDifficulty);
export const difficultyLabels = Object.fromEntries(difficultyConfig.map((level) => [level.id, level.labels.pl])) as Record<Difficulty, string>;
