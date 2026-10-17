// Known Polish learning copy, including text written without diacritics.
// Avoid short words such as "a", "i" and "do", also used in English or maths.
export const polishLearningText =
  /[ąćęłńóśźż]|\b(oblicz|rozwiaz|podaj|wybierz|pomnoz|podziel|przy|wiersz|kolumna|pierwiastek|poprawna|wyznacznik|macierz|iloczyn|wynik|wspolczynnik|wyraz|brudnopis|pokaz|sprawdz|zadanie|odpowiedz|doroslych|bez\s+presji|krok\s+po\s+kroku)\b/iu;
