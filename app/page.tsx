"use client";

import { useMemo, useState } from "react";
import { Calendar, MapPin, Search, Filter, Banknote, Clock, Users, ChefHat, Share2, X } from "lucide-react";

type EventItem = {
  id: string;
  title: string;
  category: "masterclass" | "tasting" | "festival" | "dinner" | "talk";
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

const CATEGORIES = [
  { id: "all", label: "Все" },
  { id: "masterclass", label: "Мастер-класс" },
  { id: "tasting", label: "Дегустация" },
  { id: "festival", label: "Фестиваль" },
  { id: "dinner", label: "Ужин" },
  { id: "talk", label: "Лекция" },
] as const;

const CITY_OPTIONS = ["Все города", "Москва", "Санкт‑Петербург", "Казань", "Новосибирск", "Екатеринбург"];

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

export default function Page() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [city, setCity] = useState("Все города");
  const [month, setMonth] = useState("");
  const [showPast, setShowPast] = useState(false);
  const [openEvent, setOpenEvent] = useState<EventItem | null>(null);

  const events = useMemo(() => RAW_EVENTS.slice().sort((a,b) => +new Date(a.start) - +new Date(b.start)), []);

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
    <div className="min-h-screen">
      <header className="px-6 md:px-10 py-10 border-b bg-white/70 backdrop-blur">
        <div className="container">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 grid place-items-center">
              <span className="text-rose-600 font-bold">GR</span>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Гастрономический Рай</h1>
              <p className="text-slate-500">Мероприятия сообщества: вкусы, люди и новые открытия</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-12">
            <div className="md:col-span-5">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                <input className="input pl-9" placeholder="Поиск по мероприятиям" value={query} onChange={e=>setQuery(e.target.value)} />
              </div>
            </div>

            <div className="md:col-span-3">
              <label className="label">Категория</label>
              <select className="input" value={category} onChange={e=>setCategory(e.target.value)}>
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="label">Город</label>
              <select className="input" value={city} onChange={e=>setCity(e.target.value)}>
                {CITY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="label">Месяц</label>
              <input type="month" className="input" value={month} onChange={e=>setMonth(e.target.value)} />
            </div>

            <div className="md:col-span-12 flex items-center gap-3 pt-1">
              <label className="inline-flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" className="w-4 h-4 accent-rose-600" checked={showPast} onChange={e=>setShowPast(e.target.checked)} />
                Показать прошедшие
              </label>
            </div>
          </div>
        </div>
      </header>

      <main className="px-6 md:px-10 py-10">
        <div className="container">
          {filtered.length === 0 ? (
            <div className="card p-10 text-center">
              <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-rose-100 grid place-items-center">
                <Calendar className="w-6 h-6 text-rose-600"/>
              </div>
              <p className="text-lg font-medium">Нет событий по заданным фильтрам</p>
              <p className="text-slate-500">Снимите часть фильтров или проверьте позже — скоро появятся новые мероприятия.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map(ev => <EventCard key={ev.id} event={ev} onOpen={setOpenEvent} />)}
            </div>
          )}
        </div>
      </main>

      <footer className="px-6 md:px-10 py-12 border-t bg-white">
        <div className="container flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <p className="font-medium">Присоединяйтесь к сообществу «Гастрономический Рай»</p>
            <p className="text-sm text-slate-500">Анонсы, приоритетная запись и закрытые дегустации — в нашей рассылке.</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <input className="input md:w-80" placeholder="Ваш email"/>
            <button className="btn btn-primary">Подписаться</button>
          </div>
        </div>
      </footer>

      {openEvent && <EventDialog event={openEvent} onClose={()=>setOpenEvent(null)} />}
    </div>
  );
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
  return <button className="btn btn-outline" onClick={handleClick}><Clock className="w-4 h-4"/> В календарь</button>;
}

function ShareButton({ url, title }: { url: string; title: string }) {
  const share = async () => {
    if (navigator.share) {
      try { await navigator.share({ url, title }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      alert("Ссылка скопирована");
    }
  };
  return <button className="btn btn-outline" onClick={share}><Share2 className="w-4 h-4"/> Поделиться</button>;
}

function EventCard({ event, onOpen }: { event: EventItem; onOpen: (e: EventItem)=>void }) {
  return (
    <div className="card overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video w-full overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between">
          <span className="badge">{getCategoryLabel(event.category)}</span>
          {event.spots && <div className="text-xs text-slate-500 flex items-center gap-1"><Users className="w-3.5 h-3.5"/> {event.spots} мест</div>}
        </div>
        <h3 className="text-xl font-semibold mt-2">{event.title}</h3>
        <div className="mt-2 grid gap-1 text-sm text-slate-600">
          <div className="flex items-center gap-2"><Calendar className="w-4 h-4"/> {formatDateRange(event.start, event.end)}</div>
          <div className="flex items-center gap-2"><MapPin className="w-4 h-4"/> {event.venue}, {event.city}</div>
          <div className="flex items-center gap-2"><Banknote className="w-4 h-4"/> {event.price}</div>
        </div>
        <p className="mt-2 text-sm">{event.teaser}</p>
        <div className="mt-4 flex items-center justify-between">
          <button className="btn btn-primary" onClick={()=>onOpen(event)}><ChefHat className="w-4 h-4"/> Подробнее</button>
          <AddToCalendar event={event}/>
        </div>
      </div>
    </div>
  );
}

function EventDialog({ event, onClose }: { event: EventItem; onClose: ()=>void }) {
  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="dialog-panel grid md:grid-cols-2" onClick={(e)=>e.stopPropagation()}>
        <div className="relative">
          <button className="absolute right-3 top-3 z-10 rounded-full bg-white/80 p-1" onClick={onClose} aria-label="Закрыть">
            <X className="w-4 h-4"/>
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={event.image} alt={event.title} className="h-full w-full object-cover"/>
        </div>
        <div className="p-6">
          <h2 className="text-2xl font-semibold">{event.title}</h2>
          <div className="mt-2 space-y-2 text-sm text-slate-600">
            <div className="flex items-center gap-2"><Calendar className="w-4 h-4"/> {formatDateRange(event.start, event.end)}</div>
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4"/> {event.venue}, {event.city}</div>
            <div className="flex items-center gap-2"><Banknote className="w-4 h-4"/> {event.price}</div>
          </div>
          <p className="mt-4 leading-relaxed">{event.description}</p>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <button className="btn btn-primary"><ChefHat className="w-4 h-4"/> Зарегистрироваться</button>
            <AddToCalendar event={event} />
            <ShareButton url={typeof window !== "undefined" ? window.location.href + `#${event.id}` : ""} title={event.title} />
            <span className="badge">#{getCategoryLabel(event.category)}</span>
            <span className="badge">#{event.city}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function getCategoryLabel(id: string) {
  return CATEGORIES.find(c => c.id === id)?.label ?? "Событие";
}
