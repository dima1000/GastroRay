"use client";
import React, { useMemo, useState } from "react";
import { Calendar, MapPin, Banknote, Clock, Users, ChefHat, Share2, X } from "lucide-react";

/**
 * Гастрономический Рай — простая лэндинговая страница
 * - Без поиска и фильтров
 * - Без городов
 * - Логотип в шапке
 * - Блок «О сообществе» ПЕРЕД списком мероприятий
 * - Карточки, модалка и выгрузка .ics
 */

// ===== ДАННЫЕ =====
const CATEGORIES = [
  { id: "masterclass", label: "Мастер-класс" },
  { id: "tasting", label: "Дегустация" },
  { id: "festival", label: "Фестиваль" },
  { id: "dinner", label: "Ужин" },
  { id: "talk", label: "Лекция" },
] as const;

type EventItem = {
  id: string;
  title: string;
  category: (typeof CATEGORIES)[number]["id"];
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
    venue: "GastroHub Арбат",
    start: "2025-10-18T18:00:00+03:00",
    end: "2025-10-18T21:00:00+03:00",
    price: "6 500 ₽",
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
    venue: "VinoLab Невский, 12",
    start: "2025-11-05T19:30:00+03:00",
    end: "2025-11-05T21:30:00+03:00",
    price: "3 200 ₽",
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
    venue: "Пекарня №7, цех",
    start: "2025-10-25T10:00:00+07:00",
    end: "2025-10-25T13:00:00+07:00",
    price: "2 800 ₽",
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

// ===== УТИЛИТЫ =====
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
    `LOCATION:${escapeICS(`${event.venue}`)}`,
    `DESCRIPTION:${escapeICS(event.teaser + (event.description ? "\n\n" + event.description : ""))}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return new Blob([ics], { type: "text/calendar;charset=utf-8" });
}

// ===== КОМПОНЕНТ =====
export default function GastroParadiseSimple() {
  const [openEvent, setOpenEvent] = useState<EventItem | null>(null);
  const events = useMemo(
    () => RAW_EVENTS.slice().sort((a, b) => +new Date(a.start) - +new Date(b.start)),
    []
  );

  return (
    <div className="min-h-screen">
      {/* HERO */}
      <section className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
          <div className="flex items-center gap-3">
            {/* ЛОГОТИП */}
            <img src="/logo.png" alt="Гастрономический Рай" className="w-14 h-14 rounded-full border" />
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Гастрономический Рай</h1>
              <p className="text-slate-600">Мероприятия сообщества: вкусы, люди и открытия</p>
            </div>
          </div>
        </div>
      </section>

      {/* ОПИСАНИЕ СООБЩЕСТВА */}
      <section id="about" className="px-6 md:px-10 py-10 bg-white border-t">
        <div className="max-w-6xl mx-auto grid gap-6 md:grid-cols-3 items-start">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-semibold mb-3">О сообществе «Гастрономический Рай»</h2>
            <p className="text-slate-700 leading-relaxed">
              Мы объединяем людей, которым нравится пробовать новое, общаться со шефами и узнавать кухню изнутри.
              Делаем камерные ужины, дегустации и мастер-классы с акцентом на качество продуктов и атмосферу.
            </p>
            <p className="mt-3 text-slate-700 leading-relaxed">
              В программе — сезонные ингредиенты, локальные фермеры, натуральные вина и простая, честная подача.
              Никакой суеты: небольшие группы, тёплый сервис и внимание к деталям.
            </p>
          </div>
          <div className="rounded-2xl border bg-amber-50 p-4">
            <h3 className="font-medium mb-2">Как присоединиться</h3>
            <ul className="list-disc pl-5 text-slate-700 space-y-1">
              <li>Выберите событие ниже и оставьте заявку</li>
              <li>Получите подтверждение и детали в мессенджере</li>
              <li>Приходите голодными и в хорошем настроении :)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* СПИСОК МЕРОПРИЯТИЙ */}
      <main className="px-6 md:px-10 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((ev) => (
              <EventCard key={ev.id} event={ev} onOpen={setOpenEvent} />
            ))}
          </div>
        </div>
      </main>

      {/* ФУТЕР */}
      <footer className="px-6 md:px-10 py-14 border-t bg-white">
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
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={() => setOpenEvent(null)}>
          <div className="w-full max-w-3xl grid md:grid-cols-2 overflow-hidden rounded-2xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="relative">
              <button className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-1 shadow" onClick={() => setOpenEvent(null)} aria-label="Закрыть">
                <X className="w-4 h-4" />
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={openEvent.image} alt={openEvent.title} className="h-full w-full object-cover" />
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-semibold">{openEvent.title}</h2>
              <div className="mt-2 space-y-2 text-sm text-slate-700">
                <Row><Calendar className="w-4 h-4" /> {formatDateRange(openEvent.start, openEvent.end)}</Row>
                <Row><MapPin className="w-4 h-4" /> {openEvent.venue}</Row>
                <Row><Banknote className="w-4 h-4" /> {openEvent.price}</Row>
              </div>
              <p className="mt-4 leading-relaxed text-slate-800">{openEvent.description}</p>
              <div className="mt-6 flex flex-wrap items-center gap-2">
                <button className="rounded-xl bg-rose-600 text-white px-4 py-2 text-sm font-medium hover:bg-rose-700">
                  <ChefHat className="w-4 h-4 inline mr-1" /> Зарегистрироваться
                </button>
                <AddToCalendar event={openEvent} />
                <ShareButton url={typeof window !== "undefined" ? window.location.href + `#${openEvent.id}` : ""} title={openEvent.title} />
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">
                  #{getCategoryLabel(openEvent.category)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== МЕЛКИЕ КОМПОНЕНТЫ =====
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
      <Clock className="w-4 h-4" /> В календарь
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
      <Share2 className="w-4 h-4" /> Поделиться
    </button>
  );
}

function EventCard({ event, onOpen }: { event: EventItem; onOpen: (e: EventItem) => void }) {
  return (
    <article className="group overflow-hidden rounded-2xl border bg-white shadow-sm hover:shadow-xl transition-shadow">
      <div className="relative aspect-video">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={event.image} alt={event.title} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
        <div className="absolute left-4 bottom-3 flex items-center gap-2 text-white">
          <span className="rounded-full bg-white/20 px-2.5 py-1 text-xs backdrop-blur">{getCategoryLabel(event.category)}</span>
          {event.spots && (
            <span className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-xs backdrop-blur">
              <Users className="w-3.5 h-3.5" /> {event.spots} мест
            </span>
          )}
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-semibold">{event.title}</h3>
        <div className="mt-2 grid gap-1 text-sm text-slate-600">
          <Row><Calendar className="w-4 h-4" /> {formatDateRange(event.start, event.end)}</Row>
          <Row><MapPin className="w-4 h-4" /> {event.venue}</Row>
          <Row><Banknote className="w-4 h-4" /> {event.price}</Row>
        </div>
        <p className="mt-2 text-sm text-slate-700 line-clamp-2">{event.teaser}</p>
        <div className="mt-4 flex items-center justify-between">
          <button className="rounded-xl bg-rose-600 text-white px-4 py-2 text-sm font-medium hover:bg-rose-700" onClick={() => onOpen(event)}>
            <ChefHat className="w-4 h-4 inline mr-1" /> Подробнее
          </button>
          <AddToCalendar event={event} />
        </div>
      </div>
    </article>
  );
}

function getCategoryLabel(id: EventItem["category"]) {
  return CATEGORIES.find((c) => c.id === id)?.label || "Событие";
}
