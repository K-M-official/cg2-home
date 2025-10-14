"use client";

import { Button } from "../../components/tremor/Button";
import { Input } from "../../components/tremor/Input";
import { Label } from "../../components/tremor/Label";
import { Textarea } from "../../components/tremor/TextArea";
import { useTexts } from "../../hooks/useTexts";

export default function ApplyPage() {
  const t = useTexts();
  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-6">{t.heroApply}</h1>
      <p className="text-sm mb-4">{t.applyCustomNote}</p>
      <div className="rounded-xl border border-black/10 dark:border-white/10 p-6 bg-white/5 dark:bg-white/5">
        <form className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email">{t.applyEmailLabel}</Label>
            <Input id="email" name="email" type="email" required placeholder="you@example.com" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="phone">{t.applyPhoneLabel}</Label>
            <Input id="phone" name="phone" type="tel" placeholder="可留空" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="needs">{t.applyNeedsLabel}</Label>
            <Textarea id="needs" name="needs" placeholder="请简要描述您的需求" />
          </div>
          <div className="pt-2">
            <Button type="submit" className="w-full">{t.applySubmit}</Button>
          </div>
        </form>
      </div>
    </main>
  );
}


