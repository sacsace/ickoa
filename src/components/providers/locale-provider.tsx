"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { translations, type Locale } from "@/lib/i18n";

type Translations = (typeof translations)[Locale];

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("ko");

  const t = useMemo(() => translations[locale], [locale]);

  const handleSetLocale = useCallback((next: Locale) => {
    setLocale(next);
  }, []);

  const value = useMemo(
    () => ({ locale, setLocale: handleSetLocale, t }),
    [locale, handleSetLocale, t],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return context;
}
