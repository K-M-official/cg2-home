"use client";

import Link from "next/link";
import { useTexts } from "../hooks/useTexts";
import Image from "next/image";
import { Card } from "@/components/Card";
import { Button } from "@/components/tremor/Button";
import Threads from "@/components/reactbits/Threads";

export default function Home() {
  const { t } = useTexts();
  return (
    <Overlay>
      <section className="relative min-h-screen 
      flex flex-col items-center justify-center text-center 
      p-6 pb-24" 
      style={{ zIndex: 10 }}>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4 max-w-3xl">
          {t.heroTitle}
        </h1>
        <p className="text-base sm:text-lg md:text-xl mb-8 max-w-2xl">
          {t.heroSubtitle}
        </p>
        <Button asChild className="bg-white/10 px-4 py-2" variant="ghost">
          <Link href="/memorial"> {t.heroApply} </Link>
        </Button>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-12 relative" style={{ zIndex: 10 }}>
        <h2 className="text-2xl font-semibold mb-2">{t.sectionProducts}</h2>
        <p className="text-sm mb-6">{t.sectionIntro}</p>
        <div className="grid gap-6 sm:grid-cols-2">
          <Card
            title={t.memorialName}
            href="/memorial"
            action={
              <Link href="/memorial"> {t.viewDetails} </Link>
            }
          >
            {t.memorialDesc}
          </Card>

          <Card
            title={t.cloudName}
            href="/cloud"
            action={
              <Link href="/cloud"> {t.viewDetails} </Link>
            }
          >
            {t.cloudDesc}
          </Card>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-24 relative" style={{ zIndex: 10 }}>
        <h2 className="text-2xl font-semibold mb-2">{t.galleryTitle}</h2>
        <p className="text-sm mb-6">
          <span className="italic">{t.galleryQuoteEn}</span> —— {t.galleryQuoteZh}
        </p>
        <p className="text-sm mb-10">{t.galleryDesc}</p>

        {/* 左右左 - 1 */}
        <div className="grid gap-6 sm:grid-cols-2 items-center mb-10">
          <div className="order-1 overflow-hidden rounded-lg border border-black/10 dark:border-white/10">
            <Image src="/disease.webp" alt={t.imgDiseaseAlt} width={1200} height={900} className="w-full h-auto grayscale" />
          </div>
          <div className="order-2">
            <h3 className="text-lg font-semibold mb-2">{t.imgDiseaseTitle}</h3>
            <p className="text-sm">{t.imgDiseaseText}</p>
          </div>
        </div>

        {/* 左右左 - 2（翻转） */}
        <div className="grid gap-6 sm:grid-cols-2 items-center mb-10">
          <div className="sm:order-2 order-1 overflow-hidden rounded-lg border border-black/10 dark:border-white/10">
            <Image src="/warfare.webp" alt={t.imgWarfareAlt} width={1200} height={900} className="w-full h-auto grayscale" />
          </div>
          <div className="sm:order-1 order-2">
            <h3 className="text-lg font-semibold mb-2">{t.imgWarfareTitle}</h3>
            <p className="text-sm">{t.imgWarfareText}</p>
          </div>
        </div>

        {/* 左右左 - 3 */}
        <div className="grid gap-6 sm:grid-cols-2 items-center">
          <div className="order-1 overflow-hidden rounded-lg border border-black/10 dark:border-white/10">
            <Image src="/warfare2.webp" alt={t.imgWarfare2Alt} width={1200} height={900} className="w-full h-auto grayscale" />
          </div>
          <div className="order-2">
            <h3 className="text-lg font-semibold mb-2">{t.imgWarfare2Title}</h3>
            <p className="text-sm">{t.imgWarfare2Text}</p>
          </div>
        </div>
      </section>
    </Overlay>
  );
}


function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative w-full h-full overflow-hidden">
      {/* 背景Threads - 限制高度为100vh */}
      <div 
        className="fixed inset-0 w-full h-full overflow-hidden"
        style={{ zIndex: -1 }}
      >
        <Threads
          amplitude={1}
          distance={0}
          color={[1, 1, 1]}
          enableMouseInteraction={true}
        />
      </div>

      {/* 内容容器 - 允许滚动 */}
      <div 
        className="relative min-h-screen"
        style={{ zIndex: 10 }}
      >
        {children}
      </div>
    </main>
  );
}