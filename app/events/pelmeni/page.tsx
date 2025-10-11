// app/events/pelmeni/page.tsx
import { MapPin, Banknote, Clock } from "lucide-react";
import ClientBookingPelmeni from "./ClientBookingPelmeni";
import { getEventBySlug } from "../../lib/events";
import VimeoEmbed from "../../components/VimeoEmbed";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ПЕЛЬМЕНИ & ВИНО — Гастрономический Рай",
  description: "Всего 8 мест — уютно и камерно.",
};

export default function PelmeniPage() {
  const ev = getEventBySlug("pelmeni");
  if (!ev) {
    return (
      <div style={{ padding: 24 }}>
        <h1 style={{ fontSize: 24, marginBottom: 8 }}>Событие не найдено</h1>
        <p>
          Проверьте, что в <code>app/lib/events.ts</code> указан <code>slug: "pelmeni"</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* HERO */}
      <section className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-6 py-10 md:py-14">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">{ev.title}</h1>
          <p className="mt-1 text-slate-600">{ev.teaser}</p>
        </div>
      </section>

      {/* CONTENT */}
      <section className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          {/* ГОРИЗОНТАЛЬНЫЙ БЛОК 16:9 */}
          <div className="relative overflow-hidden rounded-2xl border aspect-video">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/pelmeni-hero-1600.webp"
              srcSet="/images/pelmeni-hero-800.webp 800w,
                      /images/pelmeni-hero-1280.webp 1280w,
                      /images/pelmeni-hero-1600.webp 1600w,
                      /images/pelmeni-hero-1920.webp 1920w"
              sizes="(min-width: 1024px) 700px, 100vw"
              alt={ev.title}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>

          {/* ИНФО + БРОНЬ */}
          <div>
            <div className="space-y-2 text-slate-700">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" /> {ev.venue}
              </div>
              <div className="flex items-center gap-2">
                <Banknote className="w-4 h-4" /> {ev.price}
              </div>
              {ev.spots && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Всего {ev.spots} мест
                </div>
              )}
            </div>

            <ClientBookingPelmeni ev={ev} />
          </div>
        </div>
      </section>

      {/* ВИДЕО: Как это было */}
      <section className="max-w-5xl mx-auto px-6 py-8 border-t">
        <h2 className="text-2xl font-semibold mb-4">Как это было</h2>
        <p className="text-slate-600 mb-4">Короткие фрагменты с прошлых встреч.</p>
        <div className="grid gap-6 md:grid-cols-2">
          <VimeoEmbed id="1126462702" title="Пельмени & Вино — фрагмент 1" />
          <VimeoEmbed id="1126462677" title="Пельмени & Вино — фрагмент 2" />
        </div>
      </section>
    </div>
  );
}
