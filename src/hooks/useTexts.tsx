"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { EnTexts, ZhTexts } from "../lib/i18n/texts";
import { ZhMisc, EnMisc } from "@/lib/i18n/misc";

export interface i18nTexts {
  navApply: string;
  navMemorial: string;
  navCloud: string;

  heroTitle: string;
  heroSubtitle: string;
  heroApply: string;
  // 产品与跳转
  goHaveATry: string; 
  
  // 产品与跳转
  memorialName: string;
  memorialDesc: string;
  cloudName: string;
  cloudDesc:  string;
  viewDetails: string;
  visitSite: string;
  // 主题切换
  toggleTheme: string;
  // 追忆廊说明
  memorialTitle: string;
      memorialP1: string;
  memorialP2: string;
  memorialP3: string;
  // 云祭奠说明
  cloudTitle: string;
  cloudP1: string;
      cloudP2: string;
  cloudP3: string;
  backHome: string;
  sectionProducts: string;
  sectionMore: string;
  sectionIntro: string;
  applyHint: string;
  // 申请表单
  applyEmailLabel: string;
  applyPhoneLabel: string;
  applyNeedsLabel: string;
  applySubmit: string;
  applyCustomNote: string;
  // 图片与引言
      galleryTitle: string;
  galleryQuoteEn: string;
  galleryQuoteZh: string;
  galleryDesc: string;
  imgDiseaseAlt: string;
  imgWarfareAlt: string;
  imgWarfare2Alt: string;
  // 单图文案
  imgDiseaseTitle: string;
  imgDiseaseText: string;
  imgWarfareTitle: string;
  imgWarfareText: string;
  imgWarfare2Title: string;
  imgWarfare2Text: string;
  
  // 关于我们
  aboutTitle: string;
  aboutMission: string;
  aboutWhatWeDo: string;
  aboutTeamTitle: string;
  teamMembers: { name: string; role: string; desc: string; }[];
}

export interface i18nPolicies {
  termsTitle: string;
  termsBody: string[];
  privacyTitle: string;
  privacyBody: string[];
  howItWorksTitle: string;
  howItWorksBody: string[];
}

type typeT = i18nTexts & i18nPolicies;
export type i18nTypes = "zh-CN" | "en-US";

interface I18nContextType {
  tt: i18nTypes;
  t: typeT;
  setTexts: (i18n: i18nTypes) => void;
}

const I18nContext = createContext<I18nContextType | null>(null);

const i18nMap = {
  "zh-CN": { ...ZhTexts, ...ZhMisc },
  "en-US": { ...EnTexts, ...EnMisc },
} as const satisfies Record<i18nTypes, typeT>;

const DEFAULT_I18N = "en-US";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [texts, setTexts] = useState<typeT>(i18nMap[DEFAULT_I18N]);
  const [tt, setTt] = useState<i18nTypes>(DEFAULT_I18N);

  const setI18n = (i18n: i18nTypes) => {
    const _i18n = i18n in i18nMap ? i18n : DEFAULT_I18N;
    setTexts(i18nMap[_i18n]);
    setTt(_i18n);
    localStorage.setItem("i18n", _i18n);
    document.documentElement.setAttribute("lang", _i18n);
  }

  useEffect(() => {
    const stored = (typeof window !== "undefined" && localStorage.getItem("i18n")) as
      | i18nTypes
      | null;
    const initial = stored ?? DEFAULT_I18N;
    setI18n(initial);
  }, []);


  return (
    <I18nContext.Provider value={{ t: texts, tt: tt, setTexts: setI18n }}>
      {children}
    </I18nContext.Provider>
  );
}


export function useTexts() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useTexts must be used within an I18nProvider");
  }
  return ctx;
}


