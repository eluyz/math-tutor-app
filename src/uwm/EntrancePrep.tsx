import { allTemplates } from "../generators";
import { familyTitle } from "../locales/catalog";
import type { Locale } from "../locales/types";
import "./EntrancePrep.css";

export type PrepGroup = {
  key: string;
  title: Record<Locale, string>;
  note: Record<Locale, string>;
  ids: readonly string[];
};

/** Curated practice shortcuts, not a claim that every UWM worksheet variant is covered. */
export const UWM_PREP_GROUPS: readonly PrepGroup[] = [
  {
    key: "determinants",
    title: { pl: "Wyznaczniki 2×2–5×5", en: "Determinants 2×2–5×5" },
    note: { pl: "Wzór 2×2, Sarrus, Laplace, zera i własności.", en: "2×2 formula, Sarrus, Laplace, zero entries and properties." },
    ids: ["determinant-two", "determinant-sarrus", "determinant-laplace-four", "determinant-row-operations", "determinant-laplace-five", "determinant-properties"],
  },
  {
    key: "inverses",
    title: { pl: "Macierz odwrotna i równania", en: "Inverse matrices and equations" },
    note: { pl: "Istnienie odwrotności, 2×2/3×3, AX = B i XA = B. Układ dwóch równań macierzowych nie jest jeszcze obsługiwany.", en: "Invertibility, 2×2/3×3, AX = B and XA = B. Systems of two matrix equations are not yet supported." },
    ids: ["inverse-two", "inverse-three", "inverse-existence", "inverse-applications", "inverse-right-applications"],
  },
  {
    key: "cramer",
    title: { pl: "Układy Cramera", en: "Cramer's rule" },
    note: { pl: "Wyznacznik główny, podmiana kolumn i warunek D ≠ 0.", en: "Main determinant, column replacement and the D ≠ 0 condition." },
    ids: ["system-cramer-two", "system-cramer-three", "cramer-four"],
  },
  {
    key: "basics",
    title: { pl: "Powtórka podstaw", en: "Foundation review" },
    note: { pl: "Wymiary, mnożenie macierzy, znaki i nawiasy.", en: "Dimensions, matrix multiplication, signs and brackets." },
    ids: ["matrix-dimensions", "matrix-product", "signed-product", "algebra-distribute"],
  },
];

const copy = {
  pl: {
    title: "Przygotowanie do wejściówki UWM",
    intro: "Szybki wybór rodzin zadań zgodnych z tematami dzisiejszej powtórki. Zadania są autorskie; zakres nie zastępuje materiałów prowadzącej.",
    guide: "Karta metod + autorska próbna wejściówka (7 pkt)",
    locked: "Zakończ aktualną sesję 10 zadań, żeby wybrać inną rodzinę.",
    open: "Ćwicz",
  },
  en: {
    title: "UWM entrance quiz practice",
    intro: "Shortcuts to exercises matching the current revision topics. Exercises are original and do not replace the lecturer's materials.",
    guide: "Method sheet + original 7-point mock quiz (in Polish)",
    locked: "Finish the current 10-question session before selecting another family.",
    open: "Practice",
  },
};

export function EntrancePrep({ locale, disabled, onSelect }: {
  locale: Locale;
  disabled: boolean;
  onSelect: (templateId: string) => void;
}) {
  const t = copy[locale];
  return (
    <section className="uwm-prep" aria-labelledby="uwm-prep-title">
      <div className="uwm-prep-top">
        <div>
          <h3 id="uwm-prep-title">{t.title}</h3>
          <p>{t.intro}</p>
        </div>
        <a href={`${import.meta.env.BASE_URL}uwm-wejsciowka.html`} target="_blank" rel="noopener noreferrer">
          {t.guide} ↗
        </a>
      </div>
      {disabled && <p className="uwm-prep-locked" role="status">{t.locked}</p>}
      <div className="uwm-prep-grid">
        {UWM_PREP_GROUPS.map((group) => (
          <div key={group.key} className="uwm-prep-group">
            <h4>{group.title[locale]}</h4>
            <p>{group.note[locale]}</p>
            <ul>
              {group.ids.map((id) => {
                const template = allTemplates.find((item) => item.id === id);
                if (!template) return null;
                return (
                  <li key={id}>
                    <button type="button" disabled={disabled} onClick={() => onSelect(id)}
                      aria-label={`${t.open}: ${familyTitle(template, locale)}`}>
                      {familyTitle(template, locale)} <span aria-hidden="true">→</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
