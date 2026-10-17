import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Locale } from "./types";
import { uiCopy } from "./ui";
import { difficultyConfig, type Difficulty } from "../difficulty";
const Context = createContext<{
  locale: Locale;
  setLocale: (locale: Locale) => void;
} | null>(null);
export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("pl");
  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = uiCopy[locale].app.pageTitle;
  }, [locale]);
  const value = useMemo(() => ({ locale, setLocale }), [locale]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useLocale() {
  const value = useContext(Context);
  if (!value) throw new Error("Missing LocaleProvider");
  return {
    ...value,
    copy: uiCopy[value.locale],
    difficultyLabels: Object.fromEntries(
      difficultyConfig.map((d) => [d.id, d.labels[value.locale]]),
    ) as Record<Difficulty, string>,
  };
}
export function LanguagePicker() {
  const { locale, setLocale, copy } = useLocale();
  return (
    <div
      className="language-picker"
      role="group"
      aria-label={copy.app.language}
    >
      <button
        type="button"
        aria-label="Polski"
        aria-pressed={locale === "pl"}
        onClick={() => setLocale("pl")}
      >
        🇵🇱 <span className="language-full">Polski</span>
        <span className="language-short">PL</span>
      </button>
      <button
        type="button"
        aria-label="English"
        aria-pressed={locale === "en"}
        onClick={() => setLocale("en")}
      >
        🇬🇧 <span className="language-full">English</span>
        <span className="language-short">EN</span>
      </button>
    </div>
  );
}
