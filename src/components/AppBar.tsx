"use client";

import Link from "next/link";
import { useTexts } from "@/hooks/useTexts";
import { useEffect, useState } from "react";
import { RiMoonFill, RiSunFill } from "@remixicon/react";
import type { i18nTypes } from "@/hooks/useTexts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tremor/Select"
import { APPNAME } from "@/lib/i18n/texts";
import { KMMemorialLogo } from "./LOGO";

export default function AppBar() {
  const { t } = useTexts();
  const [theme, setTheme] = useState<"light" | "dark">();

  useEffect(() => {
    const stored = (typeof window !== "undefined" && localStorage.getItem("theme")) as
      | "light"
      | "dark"
      | null;
    const initial = stored ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", initial);
    setTheme(initial);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    setTheme(next);
  };
  return (
    <header className="w-full sticky top-0 z-50 
      bg-background/30 backdrop-blur 
      border-b border-black/10 dark:border-white/10"
    >
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="text-base font-semibold hover:opacity-90">
          <KMMemorialLogo className="size-8" />
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/memorial" className="hover:opacity-90 whitespace-nowrap min-w-fit"> {t.navMemorial} </Link>
          <Link href="/cloud" className="hover:opacity-90 whitespace-nowrap min-w-fit"> {t.navCloud} </Link>
          {/* <Link href="/apply" className="hover:opacity-90"> {t.navApply} </Link> */}
          <LanguageSwitcher />
          <button
            aria-label={t.toggleTheme}
            onClick={toggleTheme}
            className="rounded-md px-2 py-1 text-sm hover:opacity-90 hover:cursor-pointer"
          >
            {theme === "dark" ? (
              <RiSunFill className="size-4" aria-hidden="true" />
            ) : (
              <RiMoonFill className="size-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </header >
  );
}



export function LanguageSwitcher() {
  const { t, tt, setTexts } = useTexts();
  const data = [
    {
      value: "zh-CN",
      label: "中文",
    },
    {
      value: "en-US",
      label: "English",
    },
    // {
    //   value: "ja",
    //   label: "日本語",
    // },
  ] satisfies { value: i18nTypes; label: string }[]

  return (
    <>
      <Select defaultValue={tt}
        onValueChange={(value) => {
          console.log(value)
          setTexts(value as i18nTypes)
        }}>
        <SelectTrigger>
          <SelectValue placeholder={t.toggleTheme} />
        </SelectTrigger>
        <SelectContent>
          {data.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  )
}

