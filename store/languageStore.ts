import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Lang = 'en' | 'ar';

interface LanguageState {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      lang: 'en',
      setLang: (lang) => {
        set({ lang });
        applyLang(lang);
      },
      toggle: () => {
        const next: Lang = get().lang === 'en' ? 'ar' : 'en';
        set({ lang: next });
        applyLang(next);
      },
    }),
    { name: 'lang-pref' }
  )
);

/** Apply dir + lang + font-family to the document root */
export function applyLang(lang: Lang) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (lang === 'ar') {
    root.setAttribute('lang', 'ar');
    root.setAttribute('dir', 'rtl');
    document.body.style.fontFamily = "'Cairo', 'Inter', sans-serif";
  } else {
    root.setAttribute('lang', 'en');
    root.setAttribute('dir', 'ltr');
    document.body.style.fontFamily = "'Inter', 'Cairo', sans-serif";
  }
}
