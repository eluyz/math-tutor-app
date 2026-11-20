import type { Locale } from "../locales/types";
import { formatRational } from "../answers";
import { addRational, multiplyRational, rational, subtractRational } from "../rational";
import { summarizeIntegerDataset } from "./descriptive";
import type { TeachingCopy } from "./st101Copy";

/** Exact original population-variance teaching; never grade using sample variance. */
export function varianceCopy(values: readonly number[], locale: Locale): TeachingCopy {
  if (locale !== "pl" && locale !== "en") throw new RangeError("Unsupported teaching locale");
  const summary=summarizeIntegerDataset(values);
  const mean=formatRational(summary.mean);
  const terms=values.map(x=>x<0?`(${x})`:String(x)).join(" + ");
  const deviations=values.map(x=>subtractRational(rational(x),summary.mean));
  const squares=deviations.map(d=>multiplyRational(d,d));
  const sumSquares=squares.reduce(addRational,rational(0));
  const total=formatRational(sumSquares);
  const answer=formatRational(summary.populationVariance);
  const pl=locale==="pl";
  return {
    prompt:pl?`Oblicz dokładną wariancję populacyjną obserwacji: ${values.join(", ")}. Podane obserwacje stanowią całą populację w tym zadaniu.`
      :`Calculate the exact population variance of these observations: ${values.join(", ")}. The listed observations form the whole population for this exercise.`,
    hints:pl?["Najpierw oblicz dokładną średnią wszystkich obserwacji.","Podnieś do kwadratu każdą różnicę od średniej, dodaj kwadraty i podziel przez liczbę obserwacji n."]
      :["First calculate the exact mean of all observations.","Square each difference from the mean, add the squares, then divide by the observation count n."],
    steps:[
      {title:pl?"Oblicz średnią":"Calculate the mean",calculation:`μ = (${terms})/${summary.count} = ${mean}`,
        explanation:pl?"Dodaj wszystkie obserwacje i podziel sumę przez ich liczbę; nie zaokrąglaj średniej.":"Add all observations and divide by their count; do not round the mean."},
      {title:pl?"Oblicz kwadraty różnic":"Calculate squared differences",calculation:values.map((x,i)=>`(${x} − (${mean}))² = (${formatRational(deviations[i])})² = ${formatRational(squares[i])}`).join("\n"),
        explanation:pl?"Od każdej obserwacji odejmij średnią i podnieś różnicę do kwadratu. Jeśli dane mają jednostkę, kwadraty mają jej kwadrat.":"Subtract the mean from every observation and square each difference. If data have a unit, these squares have that unit squared."},
      {title:pl?"Dodaj kwadraty różnic":"Add squared differences",calculation:`Σ(x − μ)² = ${squares.map(formatRational).join(" + ")} = ${total}`,
        explanation:pl?"Dodaj wszystkie kwadraty różnic, także te pochodzące z powtarzających się obserwacji.":"Add every squared difference, including those from repeated observations."},
      {title:pl?"Podziel przez n":"Divide by n",calculation:`σ² = (${total})/${summary.count} = ${answer}`,
        explanation:pl?"Dla wariancji populacyjnej dzielimy przez n, nie n−1. Wynik jest nieujemny; jednostka wariancji jest kwadratem jednostki danych.":"Population variance divides by n, not n−1. The result is nonnegative; its unit is the square of the data's unit."},
    ],
    conclusion:pl?`Wariancja populacyjna wynosi ${answer}.`:`The population variance is ${answer}.`,
    feedback:pl?{
      correct:"Poprawna odpowiedź. Porównaj wszystkie etapy z rozwiązaniem.",
      incorrect:"Wynik jest inny. Sprawdź średnią, kwadraty różnic, ich sumę i dzielenie przez n; sam wynik nie ujawnia przyczyny błędu.",
      empty:"Wpisz odpowiedź, aby ją sprawdzić.",invalid:"Podaj liczbę całkowitą, skończony zapis dziesiętny lub ułamek z niezerowym mianownikiem.",
    }:{
      correct:"Correct answer. Compare every stage with the solution.",
      incorrect:"The result differs. Check the mean, squared differences, their sum and division by n; the result alone does not reveal the cause.",
      empty:"Enter an answer before checking it.",invalid:"Enter an integer, a finite decimal or a fraction with a nonzero denominator.",
    },
  };
}
