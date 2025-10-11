"use client";
import { useMemo, useState } from "react";
import { Calendar, MapPin, Banknote, Clock, Users, ChefHat, Share2, X, MessageCircle } from "lucide-react";

const palette = { primary: "#0f766e", text: "#0f172a", muted: "#475569", section: "#f8fafc" };

type CategoryId = "all" | "masterclass" | "tasting" | "festival" | "dinner" | "talk";
const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "masterclass", label: "Мастер-класс" },
  { id: "tasting", label: "Дегустация" },
  { id: "festival", label: "Фестиваль" },
  { id: "dinner", label: "Ужин" },
  { id: "talk", label: "Лекция" },
];
const CITY_OPTIONS = ["Все города", "Москва", "Санкт-Петербург", "Казань", "Новосибирск", "Екатеринбург"] as const;

type EventItem = {
  id: string; title: string; category: Exclude<CategoryId,"all">; city: string; venue: string;
  start: string; end: string; price: string; spots: number | null; image: string; teaser: string; description: string;
};

const RAW_EVENTS: EventItem[] = [
  { id: "e1", title: "Итальянский уикенд с шефом", category: "dinner", city: "Москва", venue: "GastroHub Арбат",
    start: "2025-10-18T18:00:00+03:00", end: "2025-10-18T21:00:00+03:00", price: "6 500 ₽", spots: 24,
    image: "https://images.unsplash.com/photo-1541542684-4a9c4a5a1a2b?q=80&w=1600&auto=format&fit=crop",
    teaser: "Четыре курса от шефа Марко Риччи и винное сопровождение.",
    description: "Погружаемся в ароматы Апулии и Лигурии: брускетты, домашняя паста, осьминог на гриле и пана-котта."
  },
  { id: "e2", title: "Натуральные вина: дегустация & разговор", category: "tasting", city: "Санкт-Петербург", venue: "VinoLab Невский, 12",
    start: "2025-11-05T19:30:00+03:00", end: "2025-11-05T21:30:00+03:00", price: "3 200 ₽", spots: 16,
    image: "https://images.unsplash.com/photo-1518481612222-68bbe828ecd1?q=80&w=1600&auto=format&fit=crop",
    teaser: "Шесть образцов петнатов и оранжевых вин.",
    description: "Разберём стили, терруары и тренды натурального виноделия. Закуски включены."
  },
  { id: "e3", title: "Street Food Fest — осень", category: "festival", city: "Казань", venue: "Набережная Кабана",
    start: "2025-09-21T12:00:00+03:00", end: "2025-09-21T22:00:00+03:00", price: "Вход свободный", spots: null,
    image: "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?q=80&w=1600&auto=format&fit=crop",
    teaser: "Десятки корнеров, живая музыка, локальные сыры и фермерские продукты.",
    description: "Фуд-траки, детская зона, кулинарные баттлы, крафтовые напитки и ярмарка производителей."
  }
];

function formatDateRange(startISO: string, endISO: string) {
  const start = new Date(startISO), end = new Date(endISO);
  const sameDay = start.toDateString() === end.toDateString();
  const d = start.toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" });
  const ts = start.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  const te = end.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  return sameDay ? `${d}, ${ts} – ${te}` : `${d} ${ts} – ${end.toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" })} ${te}`;
}
function escapeICS(s = "") { return s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;"); }
function toICS(event: EventItem) {
  const dt = (d: string | Date) => new Date(d).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const uid = `${event.id}@gastroparadise.local`;
  const ics = [
    "BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//GastroParadise//Events//RU","CALSCALE:GREGORIAN","METHOD:PUBLISH","BEGIN:VEVENT",
    `UID:${uid}`,`DTSTAMP:${dt(new Date())}`,`DTSTART:${dt(event.start)}`,`DTEND:${dt(event.end)}`,
    `SUMMARY:${escapeICS(event.title)}`,
    `LOCATION:${escapeICS(`${event.venue}, ${event.city}`)}`,
    `DESCRIPTION:${escapeICS(event.teaser + (event.description ? "\n\n" + event.description : ""))}`,
    "END:VEVENT","END:VCALENDAR",
  ].join("\r\n");
  return new Blob([ics], { type: "text/calendar;charset=utf-8" });
}

export default function Page() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryId>("all");
  const [city, setCity] = useState<(typeof CITY_OPTIONS)[number]>("Все города");
  const [month, setMonth] = useState("");
  const [showPast, setShowPast] = useState(false);
  const [openEvent, setOpenEvent] = useState<EventItem | null>(null);

  const events = useMemo(() => RAW_EVENTS.slice().sort((a,b)=>+new Date(a.start)-+new Date(b.start)), []);
  const filtered = useMemo(() => {
    const now = new Date();
    return events.filter(e => {
      const inCategory = category === "all" || e.category === category;
      const inCity = city === "Все города" || e.city === city;
      const inQuery = (e.title + " " + e.teaser + " " + e.description).toLowerCase().includes(query.toLowerCase());
      const isPast = new Date(e.end) < now;
      if (!showPast && isPast) return false;
      if (month) {
        const [y, m] = month.split("-").map(Number);
        const d = new Date(e.start);
        const matchMonth = d.getFullYear() === y && d.getMonth() + 1 === m;
        if (!matchMonth) return false;
      }
      return inCategory && inCity && inQuery;
    });
  }, [events, category, city, query, month, showPast]);

  return (
    <div className="min-h-screen text-slate-800" style={{fontFamily:"Inter, ui-sans-serif, system-ui"}}>
      {/* HERO */}
      <section className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl" style={{background: palette.primary}}>
                <div className="w-full h-full grid place-items-center text-white font-bold">GR</div>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-semibold tracking-tight" style={{color: palette.text}}>Гастрономический Рай 2025–2026</h1>
                <p className="mt-1 text-base md:text-lg" style={{color: palette.muted}}>Кулинарные события, ужины, дегустации и фестивали. Малые группы и тёплая атмосфера.</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <a href="#programs" className="rounded-lg px-4 py-2 text-sm text-white" style={{background: palette.primary}}>Смотреть события</a>
              <a href="#contact" className="rounded-lg px-4 py-2 text-sm border" style={{borderColor: palette.primary, color: palette.primary}}>WhatsApp</a>
            </div>
          </div>
        </div>
      </section>

      {/* UPCOMING */}
      <section id="programs" className="bg-[color:var(--section)]" style={{['--section' as any]: palette.section}}>
        <div className="max-w-6xl mx-auto px-6 py-10">
          <h2 className="text-2xl font-semibold mb-6">Ближайшие мероприятия</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {filtered.map(ev => <EventCard key={ev.id} event={ev} onOpen={setOpenEvent} />)}
          </div>
        </div>
      </section>

      {/* INCLUDED */}
      <InfoSection title="Что включено">
        <ul className="list-disc pl-5 space-y-2 text-slate-700">
          <li>Анонсированные блюда/форматы дегустаций и программа на площадке</li>
          <li>Организационное сопровождение и коммуникация с участниками</li>
          <li>Часть угощений и напитков в зависимости от события</li>
          <li>Партнёрские активности и мини‑лекции</li>
        </ul>
      </InfoSection>

      {/* WHO */}
      <InfoSection title="Кому подойдёт">
        <p className="text-slate-700">Новичкам и опытным гастро‑энтузиастам: шефы делят группы по интересам и уровню — мастер‑классы, дегустации, лекции.</p>
      </InfoSection>

      {/* FORMAT */}
      <InfoSection title="Формат">
        <p className="text-slate-700">Небольшие группы, насыщенная программа и время для общения. Регистрация обязательна, места ограничены.</p>
      </InfoSection>

      {/* QUICK FORM */}
      <section className="bg-white border-y" id="form">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <h3 className="text-xl font-semibold mb-4">Быстрая заявка</h3>
          <form className="grid gap-3 md:grid-cols-4">
            <select className="rounded-lg border px-3 py-2 md:col-span-2">
              {events.map(e=> <option key={e.id} value={e.id}>{e.title} — {new Date(e.start).toLocaleDateString("ru-RU")}</option>)}
            </select>
            <input className="rounded-lg border px-3 py-2" placeholder="Имя и фамилия"/>
            <button className="rounded-lg px-4 py-2 text-white" style={{background: palette.primary}}>Отправить</button>
          </form>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="bg-[color:var(--section)]" style={{['--section' as any]: palette.section}}>
        <div className="max-w-6xl mx-auto px-6 py-10">
          <h3 className="text-xl font-semibold mb-2">Связаться и записаться</h3>
          <p className="text-slate-700">Организатор: команда «Гастрономический Рай». Напишите нам в WhatsApp — ответим на вопросы и пришлём ссылку на оплату.</p>
          <a href="#" className="mt-3 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-white" style={{background: palette.primary}}>
            <MessageCircle className="w-4 h-4"/> WhatsApp
          </a>
        </div>
      </section>

      {/* TERMS */}
      <InfoSection title="Условия оплаты">
        <ul className="list-disc pl-5 space-y-1 text-slate-700">
          <li>Предоплата 50% — бронирует место. Остаток — за 14–21 день до события.</li>
          <li>Минимум участников зависит от формата; при недоборе — перенос или полный возврат.</li>
        </ul>
      </InfoSection>

      {/* FAQ */}
      <InfoSection title="FAQ">
        <details className="rounded-lg border bg-white p-4">
          <summary className="cursor-pointer font-medium">Как выбрать событие по уровню?</summary>
          <p className="mt-2 text-slate-700">Смотрите описание и формат; если сомневаетесь — напишите нам, поможем подобрать.</p>
        </details>
      </InfoSection>

      {/* CANCEL */}
      <InfoSection title="Политика отмены">
        <ul className="list-disc pl-5 space-y-1 text-slate-700">
          <li>За 30+ дней — полный возврат предоплаты.</li>
          <li>21–29 дней — 50% предоплаты.</li>
          <li>Менее 21 дня — предоплата не возвращается.</li>
        </ul>
      </InfoSection>

      {/* MODAL */}
      {openEvent && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={()=>setOpenEvent(null)}>
          <div className="w-full max-w-3xl grid md:grid-cols-2 overflow-hidden rounded-xl bg-white shadow-xl" onClick={(e)=>e.stopPropagation()}>
            <div className="relative">
              <button className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-1 shadow" onClick={()=>setOpenEvent(null)} aria-label="Закрыть">
                <X className="w-4 h-4"/>
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={openEvent.image} alt={openEvent.title} className="h-full w-full object-cover"/>
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-semibold">{openEvent.title}</h2>
              <div className="mt-2 space-y-2 text-sm text-slate-700">
                <Row><Calendar className="w-4 h-4"/> {formatDateRange(openEvent.start, openEvent.end)}</Row>
                <Row><MapPin className="w-4 h-4"/> {openEvent.venue}, {openEvent.city}</Row>
                <Row><Banknote className="w-4 h-4"/> {openEvent.price}</Row>
              </div>
              <p className="mt-4 leading-relaxed text-slate-800">{openEvent.description}</p>
              <div className="mt-6 flex flex-wrap items-center gap-2">
                <button className="rounded-lg px-4 py-2 text-white" style={{background: palette.primary}}><ChefHat className="w-4 h-4 inline mr-1"/> Зарегистрироваться</button>
                <AddToCalendar event={openEvent} />
                <ShareButton url={typeof window !== 'undefined' ? window.location.href + `#${openEvent.id}` : ''} title={openEvent.title} />
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">#{getCategoryLabel(openEvent.category)}</span>
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">#{openEvent.city}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="border-t bg-white">
        <div className="max-w-6xl mx-auto px-6 py-8 text-sm text-slate-600">© Гастрономический Рай 2025 — все права защищены</div>
      </footer>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) { return <div className="flex items-center gap-2">{children}</div>; }
function AddToCalendar({ event }: { event: EventItem }) {
  const handleClick = () => {
    const blob = toICS(event);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${event.title.replace(/\s+/g, "_")}.ics`;
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  };
  return <button onClick={handleClick} className="rounded-lg border bg-white px-3 py-2 text-sm hover:bg-slate-50 flex items-center gap-2"><Clock className="w-4 h-4"/> В календарь</button>;
}
function ShareButton({ url, title }: { url: string; title: string }) {
  const share = async () => { if (navigator.share) { try { await navigator.share({ url, title }); } catch {} } else { await navigator.clipboard.writeText(url); alert("Ссылка скопирована"); } };
  return <button onClick={share} className="rounded-lg border bg-white px-3 py-2 text-sm hover:bg-slate-50 flex items-center gap-2"><Share2 className="w-4 h-4"/> Поделиться</button>;
}
function getCategoryLabel(id: Exclude<CategoryId,"all">) { return CATEGORIES.find(c => c.id === id)?.label || "Событие"; }

function InfoSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-[color:var(--bg)] border-b" style={{['--bg' as any]: palette.section}}>
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h3 className="text-xl font-semibold mb-3">{title}</h3>
        <div className="bg-white rounded-xl border p-5">{children}</div>
      </div>
    </section>
  );
}
