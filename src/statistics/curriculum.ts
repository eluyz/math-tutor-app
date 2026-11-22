/** Proposed course taxonomy, not a declaration of a complete Statistics syllabus. */
export const statisticsCurriculum = [
  { id: "fundamentals", topics: [
    {id:"data-tables",lesson:"frequency-tables"}, {id:"mean",lesson:"mean"}, {id:"median",lesson:"median"},
    {id:"mode",lesson:"mode"}, {id:"dispersion",lesson:"variance"}, {id:"charts",lesson:"charts"}, {id:"interpretation",lesson:"interpretation"},
  ] },
  { id: "university", topics: [
    {id:"descriptive"}, {id:"combinatorics"}, {id:"probability"}, {id:"conditional"},
    {id:"random-variables"}, {id:"distributions"}, {id:"estimation"},
    {id:"hypothesis-tests"}, {id:"correlation"},
  ] },
] as const;
export type StatisticsTrack = (typeof statisticsCurriculum)[number]["id"];
export type StatisticsTopic = (typeof statisticsCurriculum)[number]["topics"][number]["id"];
type PlayableTopic = Extract<(typeof statisticsCurriculum)[number]["topics"][number], { lesson: string }>;
export type StatisticsLesson = PlayableTopic["lesson"];
