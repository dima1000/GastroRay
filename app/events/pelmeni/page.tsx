"use client";

import { notFound } from "next/navigation";
import { Calendar, MapPin, Banknote, Clock, Share2 } from "lucide-react";
import { getEventBySlug, EVENTS, formatDateRange } from "@/app/lib/events";
import { WHATSAPP_BASE_URL } from "@/app/lib/config";

// Чтобы SSG знал какие страницы собрать
export function generateStaticParams() {
  return EVENTS.map(e => ({ slug: e.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const ev = getEventBySlug(params.slug);
  return {
    title: ev ? `${ev.title} — Гастрономический Рай` : "Мероприятие — Гастрономический Рай",
    description: ev?.teaser ?? "Событие сообщества",
  };
}

function withMessage(baseUrl: string, message: string) {
  const joiner = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${joiner}text=${encodeURIComponent(message)}`;
}

function toICS(title: string, venue: string, start: string, end: string) {
  const escape = (s = "") => s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
  const dt = (d: string | Date) => new Date(d).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const uid = `${title}-${start}@gastroparadise.local`;
  const ics = [
    "BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//GastroParadise//Events//RU","CALSCALE:GREGORIAN","METHOD:PUBLISH","BEGIN:VEVENT",
    `UID:${uid}`,`DTSTAMP:${dt(new Date())}`,`DTSTART:${dt(start)}`,`DTEND:${dt(end)}`,
    `SUMMARY:${escape(title)}`,`LOCATION:${escape(venue)}`,
    "END:VEVENT","END:VCALENDAR",
  ].join("\r\n");
  return new Blob([ics], { type: "text/calendar;charset=utf-8" });
}

export default function EventPage({ params }: { params: { slug: string } }) {
  const ev = getEventBySlug(params.slug);
  if (!ev) return notFound();

  const addToCalendar = (start: string, end: string) => {
    const blob = toICS(ev.title, ev.venue, start, end);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${ev.title.replace(/\s+/g, "_")}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

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

            <h2 className="mt-6 font-semibold">Выберите дату</h2>
            <ul className="mt-2 space-y-2">
              {ev.sessions.map(s => {
                const msg = `Здравствуйте! Хочу записаться на «${ev.title}» (${formatDateRange(s.start, s.end)}).`;
                const wa = withMessage(WHATSAPP_BASE_URL, msg);
                return (
                  <li key={s.id} className="flex flex-wrap items-center gap-2 rounded-xl border p-3">
                    <div className="inline-flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4" /> {formatDateRange(s.start, s.end)}
                    </div>
                    <button
                      className="ml-auto rounded-xl border bg-white px-3 py-2 text-sm hover:bg-slate-50"
                      onClick={() => addToCalendar(s.start, s.end)}
                    >
                      Добавить в календарь
                    </button>
                    <a
                      href={wa}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl bg-rose-600 text-white px-3 py-2 text-sm font-medium hover:bg-rose-700 inline-flex items-center gap-2"
                    >
                      Записаться <Share2 className="w-4 h-4" />
                    </a>
                  </li>
                );
              })}
            </ul>

            <div className="mt-6 leading-relaxed text-slate-800">
              {ev.description}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
