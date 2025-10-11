import React, { useMemo, useState } from "react";
import { Calendar, MapPin, Search, Filter, Banknote, Clock, Users, ChefHat, Share2, X } from "lucide-react";

/**
 * Гастрономический Рай — улучшенная TAILWIND-версия (без shadcn/ui)
 * Один файл React, готов под Next.js (app/page.tsx). Современный, «воздушный» дизайн.
 * — Геро-секция с градиентом
 * — Компактная панель фильтров
 * — Карточки с оверлеем, мягкими тенями и анимацией
 * — Модальное окно без сторонних UI-библиотек
 * — Кнопка «В календарь» (.ics)
 */

// ==== ДАННЫЕ ====
const CATEGORIES = [
  { id: "all", label: "Все" },
  { id: "masterclass", label: "Мастер-класс" },
  { id: "tasting", label: "Дегустация" },
  { id: "festival", label: "Фестиваль" },
  { id: "dinner", label: "Ужин" },
  { id: "talk", label: "Лекция" },
] as const;

const CITY_OPTIONS = ["Все города", "Москва", "Санкт‑Петербург", "Казань", "Новосибирск", "Екатеринбург"] as const;

type EventItem = {
  id: string;
  title: string;
  category: (typeof CATEGORIES)[number]["id"]; 
  city: string;
  venue: string;
  start: string; // ISO
  end: string;   // ISO
  price: string;
  spots: number | null;
  image: string;
  teaser: string;
  description: string;
};

const RAW_EVENTS: EventItem[] = [
  {
    id: "e1",
    title: "Итальянский уикенд с шефом",
    category: "dinner",
    city: "Москва",
    venue: "GastroHub Арбат",
    start: "2025-10-18T18:00:00+03:00",
    end: "2025-10-18T21:00:00+03:00",
    price: "6 500 ₽",
    spots: 24,
    image: "https://images.unsplash.com/photo-1541542684-4a9c4a5a1a2b?q=80&w=1600&auto=format&fit=crop",
    teaser: "Четыре курса от шефа Марко Риччи и винное сопровождение.",
    description:
      "Погружаемся в ароматы Апулии и Лигурии: брускетты, домашняя паста, осьминог на гриле и нежнейший пана-котта. Вина от небольших хозяйств с семейной историей.",
  },
  {
    id: "e2",
    title: "Натуральные вина: дегустация & разговор",
    category: "tasting",
    city: "Санкт‑Петербург",
    venue: "VinoLab Невский, 12",
    start: "2025-11-05T19:30:00+03:00",
    end: "2025-11-05T21:30:00+03:00",
    price: "3 200 ₽",
    spots: 16,
    image: "https://images.unsplash.com/photo-1518481612222-68bbe828ecd1?q=80&w=1600&auto=format&fit=crop",
    teaser: "Шесть образцов петнатов и оранжевых вин.",
    description:
      "Разберём стили, терруары и тренды натурального виноделия. Закуски включены. Ведёт сомелье Алина Орлова.",
  },
  {
    id: "e3",
    title: "Street Food Fest — осень",
    category: "festival",
    city: "Казань",
    venue: "Набережная Кабана",
    start: "2025-09-21T12:00:00+03:00",
    end: "2025-09-21T22:00:00+03:00",
    price: "Вход свободный",
    spots: null,
    image: "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?q=80&w=1600&auto=format&fit=crop",
    teaser: "Десятки корнеров, живая музыка, локальные сыры и фермерские продукты.",
    description:
      "Фуд-траки со всего Поволжья, детская зона, кулинарные баттлы, крафтовые напитки и ярмарка локальных производителей.",
  },
  {
    id: "e4",
    title: "Секреты хрустящего багета",
    category: "masterclass",
    city: "Новосибирск",
    venue: "Пекарня №7, цех",
    start: "2025-10-25T10:00:00+07:00",
    end: "2025-10-25T13:00:00+07:00",
    price: "2 800 ₽",
    spots: 10,
    image: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?q=80&w=1600&auto=format&fit=crop",
    teaser: "Практика с закваской, формовка и выпечка.",
    description:
      "Освоим автолиз, растяжки и складывания, расстойку и правильный пар. Домашний багет, как в Париже.",
  },
  {
    id: "e5",
    title: "История кофе: от зерна до чашки",
    category: "talk",
    city: "Екатеринбург",
    venue: "Коворкинг «Площадь»",
    start: "2025-12-02T18:30:00+05:00",
    end: "2025-12-02T20:00:00+05:00",
    price: "Бесплатно (регистрация)",
    spots: 60,
    image: "https://images.unsplash.com/photo-1509785307050-d4066910ec1e?q=80&w=1600&auto=format&fit=crop",
    teaser: "Лекция и каппинг от обжарщика.",
    description:
      "Разберём сорта арабики/робусты, обработку, обжарку и способы заваривания. Мини-каппинг с 4 профилями.",
  },
];

// ==== УТИЛИТЫ ====
function formatDateRange(startISO: string, endISO: string) {
  const start = new Date(startISO);
  const end = new Date(endISO);
  const sameDay = start.toDateString() === end.toDateString();
  const optsDate: Intl.DateTimeFormatOptions = { day: "2-digit", month: "long", year: "numeric" };
  const optsTime: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" };
  const dateStr = start.toLocaleDateString("ru-RU", optsDate);
  const timeStart = start.toLocaleTimeString("ru-RU", optsTime);
  const timeEnd = end.toLocaleTimeString("ru-RU", optsTime);
  return sameDay
    ? `${dateStr}, ${timeStart} – ${timeEnd}`
    : `${dateStr} ${timeStart} – ${end.toLocaleDateString("ru-RU", optsDate)} ${timeEnd}`;
}

function escapeICS(s = "") {
  return s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}
function toICS(event: EventItem) {
  const dt = (d: string | Date) => new Date(d).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const uid = `${event.id}@gastroparadise.local`;
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//GastroParadise//Events//RU",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dt(new Date())}`,
    `DTSTART:${dt(event.start)}`,
    `DTEND:${dt(event.end)}`,
    `SUMMARY:${escapeICS(event.title)}`,
    `LOCATION:${escapeICS(`${event.venue}, ${event.city}`)}`,
    `DESCRIPTION:${escapeICS(event.teaser + (event.description ? "\n\n" + event.description : ""))}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return new Blob([ics], { type: "text/calendar;charset=utf-8" });
}

function cls(...s: (string|false|undefined)[]) { return s.filter(Boolean).join(" "); }

// ==== КОМПОНЕНТЫ ====
export default function GastroParadiseImproved() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]["id"]>("all");
  const [city, setCity] = useState<(typeof CITY_OPTIONS)[number]("Все города") as any;
  const [month, setMonth] = useState("");
  const [showPast, setShowPast] = useState(false);
  const [openEvent, setOpenEvent] = useState<EventItem | null>(null);

  const events = useMemo(() => RAW_EVENTS.slice().sort((a,b) => +new Date(a.start) - +new Date(b.start)), []);
  const filtered = useMemo(() => {
    const now = new Date();
    return events.filter((e) => {
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
    <div className="min-h-screen">
      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-rose-50 via-white to-amber-50">
        <div className="absolute inset-0 -z-10" aria-hidden>
          <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-rose-100 blur-3xl opacity-60"></div>
          <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-amber-100 blur-3xl opacity-70"></div>
        </div>
        <header className="px-6 md:px-10 pt-8">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-600 text-white grid place-items-center font-bold">GR</div>
              <div>
                <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Гастрономический Рай</h1>
                <p className="text-slate-600">Мероприятия сообщества: вкусы, люди и открытия</p>
              </div>
            </div>
            <a href="#subscribe" className="hidden md:inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-2 text-sm hover:bg-slate-800 transition">Подписаться</a>
          </div>
        </header>

        {/* ФИЛЬТРЫ */}
        <div className="px-6 md:px-10 pb-10 pt-8">
          <div className="max-w-6xl mx-auto rounded-2xl border bg-white/80 backdrop-blur shadow-sm p-4 md:p-5">
            <div className="grid gap-3 md:grid-cols-12">
              <div className="md:col-span-5">
                <label className="block text-xs font-medium text-slate-500 mb-1">Поиск</label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                  <input className="w-full rounded-xl border px-10 py-2 outline-none focus:ring-2 focus:ring-rose-500" placeholder="Название, описание..." value={query} onChange={(e)=>setQuery(e.target.value)} />
                </div>
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-slate-500 mb-1">Категория</label>
                <div className="relative">
                  <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                  <select className="w-full rounded-xl border pl-9 pr-3 py-2 focus:ring-2 focus:ring-rose-500" value={category} onChange={(e)=>setCategory(e.target.value as any)}>
                    {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1">Город</label>
                <select className="w-full rounded-xl border px-3 py-2 focus:ring-2 focus:ring-rose-500" value={city as any} onChange={(e)=>setCity(e.target.value as any)}>
                  {CITY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1">Месяц</label>
                <input type="month" className="w-full rounded-xl border px-3 py-2 focus:ring-2 focus:ring-rose-500" value={month} onChange={(e)=>setMonth(e.target.value)} />
              </div>
              <div className="md:col-span-12 flex items-center gap-3 pt-1">
                <label className="inline-flex items-center gap-2 text-sm text-slate-600">
                  <input type="checkbox" className="w-4 h-4 accent-rose-600" checked={showPast} onChange={(e)=>setShowPast(e.target.checked)} />
                  Показать прошедшие
                </label>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ГРИД СОБЫТИЙ */}
      <main className="px-6 md:px-10 py-10">
        <div className="max-w-6xl mx-auto">
          {filtered.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((ev) => (
                <EventCard key={ev.id} event={ev} onOpen={setOpenEvent} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ФУТЕР */}
      <footer id="subscribe" className="px-6 md:px-10 py-14 border-t bg-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6 items-center">
          <div>
            <p className="text-2xl font-semibold">Присоединяйтесь к «Гастрономическому Раю»</p>
            <p className="text-slate-600">Анонсы, приоритетная запись и закрытые дегустации — в нашей рассылке.</p>
          </div>
          <form className="flex gap-2">
            <input className="w-full md:w-80 rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-rose-500" placeholder="Ваш email" />
            <button className="rounded-xl bg-rose-600 text-white px-4 py-2 text-sm font-medium hover:bg-rose-700">Подписаться</button>
          </form>
        </div>
      </footer>

      {/* МОДАЛКА */}
      {openEvent && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={()=>setOpenEvent(null)}>
          <div className="w-full max-w-3xl grid md:grid-cols-2 overflow-hidden rounded-2xl bg-white shadow-xl" onClick={(e)=>e.stopPropagation()}>
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
                <button className="rounded-xl bg-rose-600 text-white px-4 py-2 text-sm font-medium hover:bg-rose-700"><ChefHat className="w-4 h-4 inline mr-1"/> Зарегистрироваться</button>
                <AddToCalendar event={openEvent} />
                <ShareButton url={typeof window !== 'undefined' ? window.location.href + `#${openEvent.id}` : ''} title={openEvent.title} />
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">#{getCategoryLabel(openEvent.category)}</span>
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">#{openEvent.city}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-2">{children}</div>;
}

function AddToCalendar({ event }: { event: EventItem }) {
  const handleClick = () => {
    const blob = toICS(event);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.title.replace(/\s+/g, "_")}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };
  return (
    <button onClick={handleClick} className="rounded-xl border bg-white px-3 py-2 text-sm hover:bg-slate-50 flex items-center gap-2">
      <Clock className="w-4 h-4"/> В календарь
    </button>
  );
}

function ShareButton({ url, title }: { url: string; title: string }) {
  const share = async () => {
    if (navigator.share) {
      try { await navigator.share({ url, title }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      alert("Ссылка скопирована в буфер обмена");
    }
  };
  return (
    <button onClick={share} className="rounded-xl border bg-white px-3 py-2 text-sm hover:bg-slate-50 flex items-center gap-2">
      <Share2 className="w-4 h-4"/> Поделиться
    </button>
  );
}

function EventCard({ event, onOpen }: { event: EventItem; onOpen: (e: EventItem)=>void }) {
  return (
    <article className="group overflow-hidden rounded-2xl border bg-white shadow-sm hover:shadow-xl transition-shadow">
      <div className="relative aspect-video">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={event.image} alt={event.title} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
        <div className="absolute left-4 bottom-3 flex items-center gap-2 text-white">
          <span className="rounded-full bg-white/20 px-2.5 py-1 text-xs backdrop-blur">{getCategoryLabel(event.category)}</span>
          {event.spots && (
            <span className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-xs backdrop-blur"><Users className="w-3.5 h-3.5"/> {event.spots} мест</span>
          )}
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-semibold">{event.title}</h3>
        <div className="mt-2 grid gap-1 text-sm text-slate-600">
          <Row><Calendar className="w-4 h-4"/> {formatDateRange(event.start, event.end)}</Row>
          <Row><MapPin className="w-4 h-4"/> {event.venue}, {event.city}</Row>
          <Row><Banknote className="w-4 h-4"/> {event.price}</Row>
        </div>
        <p className="mt-2 text-sm text-slate-700 line-clamp-2">{event.teaser}</p>
        <div className="mt-4 flex items-center justify-between">
          <button className="rounded-xl bg-rose-600 text-white px-4 py-2 text-sm font-medium hover:bg-rose-700" onClick={()=>onOpen(event)}>
            <ChefHat className="w-4 h-4 inline mr-1"/> Подробнее
          </button>
          <AddToCalendar event={event} />
        </div>
      </div>
    </article>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border bg-white p-10 text-center">
      <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-rose-100 grid place-items-center">
        <Calendar className="w-6 h-6 text-rose-600"/>
      </div>
      <p className="text-lg font-medium">Нет событий по заданным фильтрам</p>
      <p className="text-slate-600">Снимите часть фильтров или загляните позже — новые мероприятия уже в пути.</p>
    </div>
  );
}

function getCategoryLabel(id: EventItem["category"]) {
  return CATEGORIES.find(c => c.id === id)?.label || "Событие";
}
