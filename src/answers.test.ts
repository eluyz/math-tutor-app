import { describe, expect, it } from "vitest";
import { assessAnswer, emptyAnswer, type AnswerSpec, type AnswerInput } from "./answers";
import { rational as r } from "./rational";
import { checkAnswer, type TypedExercise } from "./exercises";
import { exercises, feedback } from "./locales/pl";
import { advanceSession, createSession, recordFirstAttempt, summarizeSession } from "./session";

const cases: { spec: AnswerSpec; right: AnswerInput; wrong: AnswerInput }[] = [
  {spec:{kind:"system",classification:"system-one",variables:["x","y"],values:[r(-2),r(1,3)]},right:{kind:"system",classification:"system-one",values:["-4/2","2/6"]},wrong:{kind:"system",classification:"system-one",values:["1/3","-2"]}},
  {spec:{kind:"system",classification:"system-none",variables:["x","y"],values:[]},right:{kind:"system",classification:"system-none",values:[]},wrong:{kind:"system",classification:"system-many",values:[]}},
  {spec:{kind:"system",classification:"system-many",variables:["x","y"],values:[]},right:{kind:"system",classification:"system-many",values:[]},wrong:{kind:"system",classification:"system-none",values:[]}},
  { spec: { kind: "limit", value: {kind:"finite",value:r(-2,3)} }, right: {kind:"limit",classification:"finite",value:"-4/6"}, wrong: {kind:"limit",classification:"finite",value:"2/3"} },
  { spec: { kind: "limit", value: {kind:"positive-infinity"} }, right: {kind:"limit",classification:"positive-infinity",value:""}, wrong: {kind:"limit",classification:"negative-infinity",value:""} },
  { spec: { kind: "limit", value: {kind:"negative-infinity"} }, right: {kind:"limit",classification:"negative-infinity",value:""}, wrong: {kind:"limit",classification:"does-not-exist",value:""} },
  { spec: { kind: "limit", value: {kind:"does-not-exist"} }, right: {kind:"limit",classification:"does-not-exist",value:""}, wrong: {kind:"limit",classification:"positive-infinity",value:""} },
  { spec: { kind: "scalar", value: r(3, 4) }, right: "0,75", wrong: "3" },
  { spec: { kind: "list", values: [r(-2), r(3, 4)], labels: ["x₁", "x₂"], unordered: true },
    right: { kind: "list", values: ["0.75", "−2"] }, wrong: { kind: "list", values: ["-2", "-2"] } },
  { spec: { kind: "matrix", values: [[r(1, 2), r(-2)], [r(0), r(3)]] },
    right: { kind: "matrix", values: [["0,5", "-2"], ["0", "6/2"]] },
    wrong: { kind: "matrix", values: [["1", "-2"], ["0", "3"]] } },
  { spec: { kind: "choice", value: "none", options: [{ value: "none", label: "Brak pierwiastków rzeczywistych" }, { value: "two", label: "Dwa" }] },
    right: { kind: "choice", value: "none" }, wrong: { kind: "choice", value: "two" } },
];
describe("jawnie typowane odpowiedzi", () => {
  it("klasyfikacja układu oznaczonego wymaga wszystkich niewiadomych, także po błędnym wyborze",()=>{
    const spec:AnswerSpec={kind:"system",classification:"system-one",variables:["x","y"],values:[r(1),r(2)]};
    for(const values of [[],["1"],["1",""],["1","1/0"]])expect(assessAnswer(spec,{kind:"system",classification:"system-one",values}).kind).toBe("invalid");
    expect(assessAnswer(spec,{kind:"system",classification:"system-none",values:[]}).kind).toBe("incorrect");
    expect(assessAnswer(spec,{kind:"system",classification:"injected",values:[]}).kind).toBe("invalid");
    expect(assessAnswer({...spec,classification:"system-none",values:[]},{kind:"system",classification:"system-one",values:["1",""]}).kind).toBe("invalid");
    expect(assessAnswer({...spec,classification:"system-none",values:[]},{kind:"system",classification:"system-one",values:["1","2"]}).kind).toBe("incorrect");
  });
  it("granice: brak wyboru i błędny zapis nie są ważną oceną; oscylacja nie jest nieskończonością", () => {
    const spec:AnswerSpec={kind:"limit",value:{kind:"does-not-exist"}};
    for(const input of ["+∞", {kind:"limit",classification:"injected",value:""}, ...["","1/0","∞","0/0","x","2 + 2"].map(value=>({kind:"limit",classification:"finite",value}))] as AnswerInput[]) expect(assessAnswer(spec,input).kind).toBe("invalid");
    expect(assessAnswer(spec,{kind:"limit",classification:"finite",value:"0"}).kind).toBe("incorrect");
    expect(assessAnswer(spec,{kind:"limit",classification:"positive-infinity",value:""}).kind).toBe("incorrect");
  });
  it("formularz pierwiastków sprawdza wybór, kompletność i wartości bez ujawniania rozwiązania", () => {
    const spec: AnswerSpec = { kind: "roots", values: [r(-1, 2), r(3)] };
    expect(assessAnswer(spec, emptyAnswer(spec)).kind).toBe("invalid");
    expect(assessAnswer(spec, { kind: "roots", classification: "two", values: ["3", ""] }).kind).toBe("invalid");
    expect(assessAnswer(spec, { kind: "roots", classification: "two", values: ["3", "−1/2"] }).kind).toBe("correct");
    expect(assessAnswer(spec, { kind: "roots", classification: "double", values: ["3"] }).kind).toBe("incorrect");
    expect(assessAnswer(spec, { kind: "roots", classification: "none", values: [] }).kind).toBe("incorrect");
    expect(assessAnswer({ kind: "roots", values: [] }, { kind: "roots", classification: "none", values: [] }).kind).toBe("correct");
  });
  it.each(cases)("$spec.kind: wspólne correct / incorrect / invalid", ({ spec, right, wrong }) => {
    expect(assessAnswer(spec, right).kind).toBe("correct");
    expect(assessAnswer(spec, wrong).kind).toBe("incorrect");
    expect(assessAnswer(spec, emptyAnswer(spec)).kind).toBe("invalid");
    const exercise: TypedExercise = { ...exercises[0], answer: spec, startingHint: "Zacznij od danych." };
    expect(checkAnswer(exercise, right, feedback).kind).toBe("correct");
    expect(checkAnswer(exercise, wrong, feedback)).toMatchObject({ kind: "incorrect" });
    expect(checkAnswer(exercise, emptyAnswer(spec), feedback).kind).toBe("invalid");
  });
  it("nie utożsamia uporządkowanych współczynników z nieuporządkowanymi pierwiastkami", () => {
    const spec: AnswerSpec = { kind: "list", values: [r(2), r(3)], labels: ["a", "b"] };
    expect(assessAnswer(spec, { kind: "list", values: ["3", "2"] }).kind).toBe("incorrect");
    expect(assessAnswer({ ...spec, unordered: true }, { kind: "list", values: ["3", "2"] }).kind).toBe("correct");
    expect(assessAnswer({ ...spec, values: [r(2), r(2)], unordered: true }, { kind: "list", values: ["2", "3"] }).kind).toBe("incorrect");
  });
  it("odrzuca niekompletne, źle ukształtowane i nieprawidłowe macierze", () => {
    const spec = cases.find(({spec}) => spec.kind === "matrix")!.spec;
    for (const input of [
      { kind: "matrix", values: [["1", ""], ["0", "3"]] },
      { kind: "matrix", values: [["1", "2"]] },
      { kind: "matrix", values: [["1"], ["2", "3"]] },
      { kind: "matrix", values: [["1/0", "2"], ["0", "3"]] },
      { kind: "matrix", values: [["eval(2)", "2"], ["0", "3"]] },
    ] as AnswerInput[]) expect(assessAnswer(spec, input).kind).toBe("invalid");
    expect(assessAnswer(cases.find(({spec}) => spec.kind === "list")!.spec, { kind: "list", values: ["-2"] }).kind).toBe("invalid");
    expect(assessAnswer(cases.find(({spec}) => spec.kind === "choice")!.spec, { kind: "choice", value: "injected" }).kind).toBe("invalid");
  });
  it.each(cases)("$spec.kind: sesja liczy tylko pierwszą ważną ocenę", ({ spec, right, wrong }) => {
    const exercise: TypedExercise = { ...exercises[0], answer: spec, startingHint: "Wskazówka" };
    let session = createSession("algebra", "easy", exercise.id);
    for (const input of [emptyAnswer(spec), wrong, wrong, right])
      session = recordFirstAttempt(session, exercise.id, checkAnswer(exercise, input, feedback).kind);
    for (let index = 1; index <= 10; index++) {
      session = advanceSession(session, index === 1 ? exercise.id : String(index), String(index + 1));
    }
    expect(summarizeSession(session)).toEqual({ shown: 10, correct: 0, incorrect: 1, solutionViewed: 0, skipped: 9 });
  });
});
