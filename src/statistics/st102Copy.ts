import type { Locale } from "../locales/types";
import { formatRational } from "../answers";
import { rational } from "../rational";
import { summarizeIntegerDataset } from "./descriptive";
import type { TeachingCopy } from "./st101Copy";

/** Original unintegrated median lesson. Positions are one-based after sorting. */
export function medianCopy(values: readonly number[], locale: Locale): TeachingCopy {
  if (locale !== "pl" && locale !== "en") throw new RangeError("Unsupported teaching locale");
  const summary=summarizeIntegerDataset(values);
  const ordered=[...values].sort((a,b)=>a<b?-1:a>b?1:0);
  const n=summary.count;
  const odd=n%2===1;
  const left=odd?(n+1)/2:n/2;
  const right=odd?left:left+1;
  const first=formatRational(rational(ordered[left-1]));
  const second=formatRational(rational(ordered[right-1]));
  const answer=formatRational(summary.median);
  const pl=locale==="pl";
  return {
    prompt:pl?`Oblicz dokładną medianę obserwacji: ${values.join(", ")}.`:`Calculate the exact median of these observations: ${values.join(", ")}.`,
    hints:pl?["Uporządkuj obserwacje rosnąco; zachowaj wszystkie powtórzenia.","Sprawdź parzystość liczby obserwacji. Wybierz środkową wartość lub średnią dwóch środkowych."]
      :["Sort the observations in increasing order, retaining all repetitions.","Check whether the observation count is odd or even. Use the middle value or the mean of the two middle values."],
    steps:[
      {title:pl?"Uporządkuj dane":"Order the data",calculation:`x↑ = [${ordered.join(", ")}]`,
        explanation:pl?"Sortujemy wszystkie obserwacje, nie usuwając powtórzeń.":"Sort every observation without removing repeated values."},
      {title:pl?"Znajdź środkowe pozycje":"Find the central positions",calculation:odd?`n = ${n}; k = ${left}`:`n = ${n}; k₁ = ${left}; k₂ = ${right}`,
        explanation:pl?(odd?"Dla nieparzystego n środkowa pozycja to (n+1)/2. Liczymy od 1.":"Dla parzystego n środkowe pozycje to n/2 oraz n/2+1. Liczymy od 1.")
          :(odd?"For odd n, the middle position is (n+1)/2. Positions start at 1.":"For even n, the middle positions are n/2 and n/2+1. Positions start at 1.")},
      {title:pl?"Oblicz medianę":"Calculate the median",calculation:odd?`Me = x[${left}] = ${answer}`:`Me = (x[${left}] + x[${right}])/2 = ((${first}) + (${second}))/2 = ${answer}`,
        explanation:pl?(odd?"Mediana jest wartością obserwacji na środkowej pozycji.":"Mediana jest średnią dwóch środkowych wartości; wynik może być ułamkiem.")
          :(odd?"The median is the observation at the middle position.":"The median is the mean of the two middle values; it may be a fraction.")},
    ],
    conclusion:pl?`Mediana wynosi ${answer}.`:`The median is ${answer}.`,
    feedback:pl?{
      correct:"Poprawna odpowiedź. Porównaj ją z uporządkowanymi danymi w rozwiązaniu.",
      incorrect:"Wynik jest inny. Sprawdź kolejność danych, ich liczbę i środkowe pozycje; sam wynik nie wskazuje przyczyny błędu.",
      empty:"Wpisz odpowiedź, aby ją sprawdzić.",invalid:"Podaj liczbę całkowitą, skończony zapis dziesiętny lub ułamek z niezerowym mianownikiem.",
    }:{
      correct:"Correct answer. Compare it with the ordered data in the solution.",
      incorrect:"The result differs. Check the order, observation count and central positions; the result alone does not identify the error's cause.",
      empty:"Enter an answer before checking it.",invalid:"Enter an integer, a finite decimal or a fraction with a nonzero denominator.",
    },
  };
}
