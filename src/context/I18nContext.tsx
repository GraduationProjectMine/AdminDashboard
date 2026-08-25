"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Locale, translations, TranslationsType } from "@/lib/translations";

interface I18nContextType {
  locale: Locale;
  toggleLocale: () => void;
  setLocale: (locale: Locale) => void;
  t: TranslationsType;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const STORAGE_KEY = "admin_dashboard_locale";

function getInitialLocale(): Locale {
  try {
    if (typeof window === "undefined") return "vi";
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored === "vi" || stored === "en") return stored;
  } catch {
    // fallback
  }
  return "vi";
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("vi");

  useEffect(() => {
    setLocaleState(getInitialLocale());
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
    } catch {
      // ignore
    }
  }, []);

  const toggleLocale = useCallback(() => {
    setLocaleState((prev) => {
      const next = prev === "vi" ? "en" : "vi";
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const currentTranslations = translations[locale] || translations.vi;

  return (
    <I18nContext.Provider
      value={{
        locale,
        toggleLocale,
        setLocale,
        t: currentTranslations,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}
