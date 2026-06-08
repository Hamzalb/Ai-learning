'use client';
import { useEffect } from 'react';
import { useLanguageStore, applyLang } from '@/store/languageStore';

/** Applies the persisted language preference on first client render */
export default function LanguageBootstrap() {
  const { lang } = useLanguageStore();
  useEffect(() => { applyLang(lang); }, [lang]);
  return null;
}
