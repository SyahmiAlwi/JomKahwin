"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import {
  TRANSLATIONS,
  DEFAULT_LANG,
  isValidLang,
  type LangCode,
} from "./translations";

const LS_LANGUAGE = "jomkahwin_language";

type LanguageCtx = {
  lang: LangCode;
  setLang: (l: LangCode) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageCtx | null>(null);

function interpolate(template: string, vars?: Record<string, string | number>) {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, name) => {
    const value = vars[name];
    return value === undefined || value === null ? `{${name}}` : String(value);
  });
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Start with default to avoid hydration mismatch; update from localStorage after mount.
  const [lang, setLangState] = useState<LangCode>(DEFAULT_LANG);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LS_LANGUAGE);
      if (isValidLang(stored)) {
        setLangState(stored);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const setLang = useCallback((next: LangCode) => {
    setLangState(next);
    try {
      localStorage.setItem(LS_LANGUAGE, next);
    } catch {
      // ignore
    }
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const dict = TRANSLATIONS[lang] || TRANSLATIONS[DEFAULT_LANG];
      const fallback = TRANSLATIONS[DEFAULT_LANG];
      const raw = dict[key] ?? fallback[key] ?? key;
      return interpolate(raw, vars);
    },
    [lang]
  );

  const value = useMemo<LanguageCtx>(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Safe fallback so components outside the provider can still render.
    // In practice LanguageProvider wraps the whole app, so this rarely hits.
    return {
      lang: DEFAULT_LANG,
      setLang: () => {},
      t: (key: string, vars?: Record<string, string | number>) =>
        interpolate(TRANSLATIONS[DEFAULT_LANG][key] ?? key, vars),
    } satisfies LanguageCtx;
  }
  return ctx;
}

export function useT() {
  return useLanguage().t;
}

export { LS_LANGUAGE };
