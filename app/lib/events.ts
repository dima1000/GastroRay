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
    image: "/images/pelmeni-hero-1600.webp",
    teaser: "Всего 8 мест — уютно и камерно.",
    description:
      "Кулинарная встреча с Александрой Пеле — нутрициологом из Сибири, ценителем вкуса и натуральных продуктов. Это не мастер-класс — это встреча ценителей. Готовим сибирские пельмени с креативом, пьём элитное вино, наслаждаемся атмосферой, вкусом и общением.",
    sessions: [
      { id: "2211", start: "2025-11-22T16:00:00+02:00", end: "2025-11-22T16:00:00+02:00" },
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
