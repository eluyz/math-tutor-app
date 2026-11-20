import type { Locale } from "../locales/types";
import { formatRational } from "../answers";
import { rational } from "../rational";
import type { TeachingCopy } from "./st101Copy";
import { compareCentres, compareReplacement, type InterpretationAnswer, type InterpretationDataset, type InterpretationTask } from "./interpretationTasks";

export type InterpretationTeachingCopy = TeachingCopy & Readonly<{
  options: readonly Readonly<{ id: InterpretationAnswer; label: string }>[];
}>;

function snapshotSteps(data: InterpretationDataset, pl: boolean, prefix: string) {
  const sum = data.values.reduce((total, value) => total + BigInt(value), 0n);
  const total = formatRational(rational(sum));
  const terms = data.values.map(value => value < 0 ? `(${formatRational(rational(value))})` : String(value)).join(" + ");
  const ordered = [...data.values].sort((a,b) => a < b ? -1 : a > b ? 1 : 0);
  const n = ordered.length, odd = n % 2 === 1;
  const left = Math.floor((n+1)/2), right = Math.floor(n/2)+1;
  const first = formatRational(rational(ordered[left-1])), second = formatRational(rational(ordered[right-1]));
  const label = (text: string) => prefix ? `${prefix} — ${text}` : text;
  return [
    { title: label(pl ? "Liczba i suma obserwacji" : "Observation count and sum"),
      calculation: `n = ${n}; Σx = ${terms} = ${total}`,
      explanation: pl ? "Liczymy wszystkie obserwacje, również powtórzenia. Zachowujemy znaki liczb ujemnych." : "Count every observation, including repetitions. Retain the signs of negative values." },
    { title: label(pl ? "Oblicz średnią" : "Calculate the mean"),
      calculation: `μ = (${total})/${n} = ${formatRational(data.mean)}`,
      explanation: pl ? "Średnia to suma podzielona przez liczbę obserwacji. Nie zaokrąglamy wyniku." : "The mean is the sum divided by the observation count. Do not round the result." },
    { title: label(pl ? "Uporządkuj dane i oblicz medianę" : "Order the data and calculate the median"),
      calculation: `x↑ = [${ordered.join(", ")}]; ` + (odd
        ? `k = ${left}; Me = x[${left}] = ${formatRational(data.median)}`
        : `k₁ = ${left}; k₂ = ${right}; Me = ((${first}) + (${second}))/2 = ${formatRational(data.median)}`),
      explanation: pl ? (odd ? "Pozycje liczymy od 1. Dla nieparzystego n wybieramy pozycję (n+1)/2; nie usuwamy powtórzeń." : "Pozycje liczymy od 1. Dla parzystego n uśredniamy wartości na pozycjach n/2 i n/2+1, zachowując powtórzenia.")
        : (odd ? "Positions start at 1. For odd n, select position (n+1)/2 without removing repeated values." : "Positions start at 1. For even n, average the values at positions n/2 and n/2+1, retaining repetitions.") },
  ];
}

/** Bilingual, value-driven lessons. No UI/curriculum/answer-field integration. */
export function interpretationCopy(task: InterpretationTask, locale: Locale): InterpretationTeachingCopy {
  if (locale !== "pl" && locale !== "en") throw new RangeError("Unsupported interpretation locale");
  const pl = locale === "pl";
  const comparison = task.kind === "compare-centres" ? compareCentres(task.original.values)
    : compareReplacement(task.original.values, task.replacement.index, task.replacement.to);
  const labels: Record<InterpretationAnswer,string> = pl ? {
    "mean-below-median":"Średnia < mediana", "mean-equals-median":"Średnia = mediana", "mean-above-median":"Średnia > mediana",
    "mean-changes-less":"Mniejsza zmiana średniej", "median-changes-less":"Mniejsza zmiana mediany", "equal-change":"Obie miary zmieniają się o tyle samo",
  } : {
    "mean-below-median":"Mean < median", "mean-equals-median":"Mean = median", "mean-above-median":"Mean > median",
    "mean-changes-less":"The mean changes less", "median-changes-less":"The median changes less", "equal-change":"Both measures change by the same amount",
  };
  let prompt: string, conclusion: string;
  let hints: readonly [string,string];
  let steps: TeachingCopy["steps"];
  if (comparison.kind === "compare-centres") {
    const mean = formatRational(comparison.original.mean), median = formatRational(comparison.original.median);
    const sign = comparison.answer === "mean-below-median" ? "<" : comparison.answer === "mean-above-median" ? ">" : "=";
    prompt = pl ? `Dane: [${comparison.original.values.join(", ")}]. Która relacja między średnią arytmetyczną μ i medianą Me jest prawdziwa? Uwzględnij wszystkie powtórzenia.`
      : `Data: [${comparison.original.values.join(", ")}]. Which relation between the arithmetic mean μ and median Me is true? Include every repeated observation.`;
    hints = pl ? ["Oblicz średnią ze wszystkich obserwacji, a medianę wyznacz po ich uporządkowaniu.","Porównaj dokładne wartości obu miar; ułamki porównuj bez zaokrąglania."]
      : ["Calculate the mean from every observation, then obtain the median from the ordered data.","Compare the exact values of the two measures; do not round fractions before comparing them."];
    const relation = pl ? (sign === "<" ? "mniejsza od mediany" : sign === ">" ? "większa od mediany" : "równa medianie")
      : (sign === "<" ? "less than the median" : sign === ">" ? "greater than the median" : "equal to the median");
    conclusion = pl ? `Średnia arytmetyczna jest ${relation} (${mean} ${sign} ${median}).` : `The arithmetic mean is ${relation} (${mean} ${sign} ${median}).`;
    steps = [...snapshotSteps(comparison.original,pl,""),
      {title:pl?"Porównaj obie miary":"Compare the two measures",calculation:`${mean} ${sign} ${median}`,
        explanation:pl?"To porównanie liczb dla tych danych. Samo w sobie nie dowodzi kształtu całego rozkładu.":"This compares the numbers for these observations. It does not by itself establish the shape of a distribution."}];
  } else {
    const mean = formatRational(comparison.absoluteChange.mean), median = formatRational(comparison.absoluteChange.median);
    const sign = comparison.answer === "mean-changes-less" ? "<" : comparison.answer === "median-changes-less" ? ">" : "=";
    const index = comparison.replacement.index + 1;
    prompt = pl ? `Dane początkowe: [${comparison.original.values.join(", ")}]. Zamień tylko obserwację na pozycji ${index} (wartość ${comparison.replacement.from}) na ${comparison.replacement.to}. Dane po zamianie: [${comparison.modified.values.join(", ")}]. Która miara zmienia się mniej co do wartości bezwzględnej: średnia μ czy mediana Me? Możliwa jest równość zmian. Liczba obserwacji pozostaje taka sama; pozycje liczymy od 1.`
      : `Original data: [${comparison.original.values.join(", ")}]. Replace only the observation at position ${index} (value ${comparison.replacement.from}) with ${comparison.replacement.to}. Modified data: [${comparison.modified.values.join(", ")}]. Which measure changes less in absolute value: the mean μ or median Me? Equal changes are possible. The observation count stays the same; positions start at 1.`;
    hints = pl ? ["Oblicz średnią i medianę przed zamianą oraz po niej. To zastąpienie jednej obserwacji, a nie dopisanie nowej.","Dla każdej miary oblicz wartość bezwzględną różnicy po minus przed. Porównaj wielkości zmian, nie ich kierunki."]
      : ["Calculate the mean and median before and after the replacement. One observation is replaced; none is appended.","For each measure, take the absolute difference between its after and before values. Compare change magnitudes, not directions."];
    const result = comparison.answer === "equal-change" ? (pl ? "Obie miary zmieniły się o tyle samo." : "Both measures changed by the same amount.")
      : comparison.answer === "mean-changes-less" ? (pl ? "Średnia zmieniła się mniej." : "The mean changed less.") : (pl ? "Mediana zmieniła się mniej." : "The median changed less.");
    conclusion = result + (pl ? " Wniosek dotyczy tej konkretnej zamiany. Mediana nie musi pozostawać niezmienna przy każdej zamianie obserwacji."
      : " This conclusion concerns this particular replacement. The median need not stay unchanged under every replacement.");
    steps = [...snapshotSteps(comparison.original,pl,pl?"Dane początkowe":"Original data"),
      ...snapshotSteps(comparison.modified,pl,pl?"Dane po zamianie":"Modified data"),
      {title:pl?"Oblicz bezwzględne zmiany":"Calculate the absolute changes",
        calculation:`|Δμ| = |(${formatRational(comparison.modified.mean)}) − (${formatRational(comparison.original.mean)})| = ${mean}; |ΔMe| = |(${formatRational(comparison.modified.median)}) − (${formatRational(comparison.original.median)})| = ${median}`,
        explanation:pl?"Wartość bezwzględna opisuje wielkość zmiany, niezależnie od tego, czy miara wzrosła, czy zmalała.":"The absolute value describes the size of the change, whether the measure increased or decreased."},
      {title:pl?"Porównaj wielkości zmian":"Compare the change magnitudes",calculation:`${mean} ${sign} ${median}`,
        explanation:pl?"Porównujemy wyłącznie tę wskazaną zamianę. Odporność mediany nie oznacza jej niezmienności w każdym skończonym przykładzie.":"Compare only the specified replacement. Robustness of the median does not mean it is unchanged in every finite example."}];
  }
  return Object.freeze({prompt, hints:Object.freeze(hints), steps:Object.freeze(steps.map(step=>Object.freeze(step))), conclusion,
    options:Object.freeze(task.options.map(id=>Object.freeze({id,label:labels[id]}))),
    feedback:Object.freeze(pl ? {correct:"Poprawna odpowiedź. Porównaj ją z dokładnymi obliczeniami w rozwiązaniu.",
      incorrect:"Odpowiedź jest inna. Sprawdź obliczenia obu miar i treść pytania; sam wybór nie wskazuje przyczyny pomyłki.",
      empty:"Wybierz odpowiedź, aby ją sprawdzić.",invalid:"Wybierz jedną z odpowiedzi podanych w tym pytaniu."}
      : {correct:"Correct answer. Compare it with the exact calculations in the solution.",
        incorrect:"The answer differs. Review both measures and the question; the choice alone does not identify the cause of an error.",
        empty:"Choose an answer before checking it.",invalid:"Choose one of the answers offered for this question."})});
}
