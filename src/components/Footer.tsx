"use client";

import { useState } from "react";
import { useTexts } from "../hooks/useTexts";
import { Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "./tremor/Drawer";

import { misc } from "../lib/i18n/misc";
import Link from "next/link";
import { RiGithubFill, RiYoutubeFill, RiBilibiliFill, RiTwitterXFill } from "@remixicon/react";

function FooterItem({ title, body }: { title: string; body: ReadonlyArray<string> }) {
  const [open, setOpen] = useState(false);
  return (
    <Drawer open={open} onOpenChange={setOpen} >
      <DrawerTrigger asChild>
        <button className="w-full text-left text-sm hover:cursor-pointer">{title}</button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
        </DrawerHeader>
        <DrawerBody>
          <div className="space-y-3 text-sm">
            {body.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}

export default function Footer() {
  const t = useTexts();
  return (
    <footer className="w-full border-t 
    bg-background/30 backdrop-blur 
      border-b border-black/10 dark:border-white/10
       mt-16 px-10">
      <div className="mx-auto max-w-6xl px-4 py-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* 第一列：版权、公司名与社交链接 */}
        <div className="space-y-3">
          <div className="text-sm">{t.footerCopyright}</div>
          <div className="text-base font-semibold">{t.appName}</div>
          <div className="flex items-center gap-3">
            <Link href="#" aria-label="X" className="hover:opacity-90"><RiTwitterXFill className="size-5" /></Link>
            <Link href="#" aria-label="GitHub" className="hover:opacity-90"><RiGithubFill className="size-5" /></Link>
            <Link href="#" aria-label="YouTube" className="hover:opacity-90"><RiYoutubeFill className="size-5" /></Link>
            <Link href="#" aria-label="bilibili" className="hover:opacity-90"><RiBilibiliFill className="size-5" /></Link>
          </div>
        </div>

        {/* 第二列：服务内容链接 */}
        <div className="space-y-3">
          <div className="text-base font-semibold">服务</div>
          <div className="flex flex-col gap-2">
            <Link href="/memorial">{t.memorialName}</Link>
            <Link href="/cloud">{t.cloudName}</Link>
            <Link href="/apply">联系我们</Link>
            <Link href="/about">我们是谁</Link>
          </div>
        </div>

        {/* 第三列：抽屉项 */}
        <div className="space-y-3">
          <div className="text-base font-semibold">了解更多</div>
          <div className="flex flex-col gap-2">
            <FooterItem title={misc.termsTitle} body={misc.termsBody} />
            <FooterItem title={misc.privacyTitle} body={misc.privacyBody} />
            <FooterItem title={misc.howItWorksTitle} body={misc.howItWorksBody} />
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 h-12 flex items-center justify-center text-sm" />
    </footer>
  );
}


