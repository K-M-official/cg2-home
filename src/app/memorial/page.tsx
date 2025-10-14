"use client";

import Link from "next/link";
import { useTexts } from "../../hooks/useTexts";
import Image from "next/image";
import { Button } from "@/components/tremor/Button";

import GridMotion from '@/components/reactbits/GridMotion';

// note: you'll need to make sure the parent container of this component is sized properly
const items = [
  'Item 1',
  <div key='jsx-item-1'>Custom JSX Content</div>,
  'https://images.unsplash.com/photo-1723403804231-f4e9b515fe9d?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'Item 2',
  <div key='jsx-item-2'>Custom JSX Content</div>,
  'Item 4',
  <div key='jsx-item-2'>Custom JSX Content</div>,
  'https://images.unsplash.com/photo-1723403804231-f4e9b515fe9d?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'Item 5',
  <div key='jsx-item-2'>Custom JSX Content</div>,
  'Item 7',
  <div key='jsx-item-2'>Custom JSX Content</div>,
  'https://images.unsplash.com/photo-1723403804231-f4e9b515fe9d?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'Item 8',
  <div key='jsx-item-2'>Custom JSX Content</div>,
  'Item 10',
  <div key='jsx-item-3'>Custom JSX Content</div>,
  'https://images.unsplash.com/photo-1723403804231-f4e9b515fe9d?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'Item 11',
  <div key='jsx-item-2'>Custom JSX Content</div>,
  'Item 13',
  <div key='jsx-item-4'>Custom JSX Content</div>,
  'https://images.unsplash.com/photo-1723403804231-f4e9b515fe9d?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'Item 14',
  // Add more items as needed
];


export default function MemorialPage() {
  const { t } = useTexts();
  return (
    <main className="max-w-5xl mx-auto px-6 py-12 min-h-screen">
      {/* 统一视图：根据媒体查询切换布局与样式，复用同一套 DOM */}
      <div 
        className="fixed inset-0 w-full h-full overflow-hidden"
        style={{ zIndex: -1 }}
      >
        <GridMotion items={items as never[]} />
      </div>
      
      <section
        className="grid md:grid-cols-2 sm:grid-cols-1 
        bg-background/70 backdrop-blur p-8 rounded-xl
        gap-8 items-center"
      >
        {/* 文案容器：移动端在下，桌面端在左 */}
        <div className="order-1 p-4">
          <h1 className="text-3xl font-bold mb-4">{t.memorialTitle}</h1>
          <p className="mb-3">{t.memorialP1}</p>
          <p className="mb-3">{t.memorialP2}</p>
          <p className="mb-6">{t.memorialP3}</p>
          <div className="flex gap-3">
            <Button variant="ghost" className="bg-white/20 dark:bg-black/20" asChild>
              <Link href="https://memorial.permane.world" target="_blank" rel="noopener noreferrer">{t.memorialName}</Link>
            </Button>
          </div>
        </div>

        {/* 图像容器：移动端在上，桌面端在右 */}
        <div className="md:order-1 overflow-hidden rounded-xl border border-black/10 dark:border-white/10">
          <Image
            src="/yunjidian.webp"
            alt={t.imgDiseaseAlt}
            width={1400}
            height={1000}
            className="w-full h-auto object-cover grayscale"
          />
        </div>
      </section>
    </main>
  );
}


