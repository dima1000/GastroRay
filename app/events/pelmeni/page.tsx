import { MapPin, Banknote, Clock } from "lucide-react";
import ClientBookingPelmeni from "./ClientBookingPelmeni";
import { getEventBySlug } from "../../lib/events";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ПЕЛЬМЕНИ & ВИНО — Гастрономический Рай",
  description: "Всего 8 мест — уютно и камерно.",
};

export default function PelmeniPage() {
  const ev = getEventBySlug("pelmeni");
  if (!ev) {
    // Если slug не совпадает — подсказка
    return (
      <div style={{ padding: 24 }}>
        <h1 style={{ fontSize: 24, marginBottom: 8 }}>Событие не найдено</h1>
        <p>Проверьте, что в <code>app/lib/events.ts</code> указан <code>slug: "pelmeni"</code>.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <section className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-6 py-10 md:py-14">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">{ev.title}</h1>
          <p className="mt-1 text-slate-600">{ev.teaser}</p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="relative overflow-hidden rounded-2xl border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ev.image} alt={ev.title} className="w-full h-full object-cover" />
          </div>

          <div>
            <div className="space-y-2 text-slate-700">
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {ev.venue}</div>
              <div className="flex items-center gap-2"><Banknote className="w-4 h-4" /> {ev.price}</div>
              {ev.spots && <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> Всего {ev.spots} мест</div>}
            </div>

            <ClientBookingPelmeni ev={ev} />
          </div>
        </div>
      </section>
    </div>
  );
}
