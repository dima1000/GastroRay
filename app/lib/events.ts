// app/lib/events.ts
export type EventSession = {
  id: string;           // уникальный id слота
  start: string;        // ISO
  end: string;          // ISO
};

export type EventItem = {
  slug: string;
  title: string;
  category: "masterclass" | "tasting" | "festival" | "dinner" | "talk";
  venue: string;
  price: string;
  spots: number | null;
  image: string;
  teaser: string;
  description: string;
  sessions: EventSession[];
};

export const EVENTS: EventItem[] = [
  {
    slug: "pelmeni",
    title: "ПЕЛЬМЕНИ & ВИНО — Гастрономическая пятница",
    category: "masterclass",
    venue: "Тель-Авив, ул. Вашингтон 20",
    price: "300 ₪ / 550 ₪ за пару",
    spots: 8,
    image: "https://images.unsplash.com/photo-1604908176997-43162b3a5c7d?q=80&w=1600&auto=format&fit=crop",
    teaser: "Всего 8 мест — уютно и камерно.",
    description:
      "Александрой Пеле — нутрициолог из Сибири, ценитель вкуса и натуральных продуктов. Это не мастер-класс — это встреча ценителей. Готовим сибирские пельмени с креативом, пьём элитное вино, наслаждаемся атмосферой, вкусом и общением.",
    sessions: [
      { id: "2410", start: "2025-10-24T10:00:00+02:00", end: "2025-10-24T14:00:00+02:00" },
      { id: "1411", start: "2025-11-14T10:00:00+02:00", end: "2025-11-14T14:00:00+02:00" },
      { id: "2811", start: "2025-11-28T10:00:00+02:00", end: "2025-11-28T14:00:00+02:00" },
    ],
  },
];

export function getAllEvents() {
  return EVENTS;
}

export function getEventBySlug(slug: string) {
  return EVENTS.find(e => e.slug === slug) || null;
}

export function formatDateRange(startISO: string, endISO: string) {
  const start = new Date(startISO);
  const end = new Date(endISO);
  const sameDay = start.toDateString() === end.toDateString();
  const d = start.toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" });
  const ts = start.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  const te = end.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  return sameDay ? `${d}, ${ts} – ${te}` : `${d} ${ts} – ${end.toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" })} ${te}`;
}
