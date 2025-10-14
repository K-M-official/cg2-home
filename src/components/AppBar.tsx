"use client";

import Link from "next/link";
import { useTexts } from "../hooks/useTexts";
import { useEffect, useState } from "react";
import { RiMoonFill, RiSunFill } from "@remixicon/react";

export default function AppBar() {
  const t = useTexts();
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
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-base font-semibold hover:opacity-90">{t.appName}</Link>
        <div className="flex items-center gap-6">
          <Link href="/memorial" className="hover:opacity-90"> {t.navMemorial} </Link>
          <Link href="/cloud" className="hover:opacity-90"> {t.navCloud} </Link>
          {/* <Link href="/apply" className="hover:opacity-90"> {t.navApply} </Link> */}
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
    </header>
  );
}


