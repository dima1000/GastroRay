"use client";

import { Calendar } from "lucide-react";
import { type EventItem } from "../../lib/events";
import { WHATSAPP_BASE_URL } from "../../lib/config";

function withMessage(baseUrl: string, message: string) {
  const joiner = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${joiner}text=${encodeURIComponent(message)}`;
}

// "24.10"
function formatShortDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
}

// "10:00–14:00"
function formatTimeRange(startISO: string, endISO: string) {
  const s = new Date(startISO);
  const e = new Date(endISO);
  const opts: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jerusalem", // <-- фиксируем TZ
  };
  return `${s.toLocaleTimeString("ru-RU", opts)}–${e.toLocaleTimeString("ru-RU", opts)}`;
}

export default function ClientBookingPelmeni({ ev }: { ev: EventItem }) {
  // Сформируем текст со всеми доступными слотами
  const optionsText = ev.sessions
    .map((s) => `${formatShortDate(s.start)} ${formatTimeRange(s.start, s.end)}`)
    .join(" / ");

  const wa = withMessage(
    WHATSAPP_BASE_URL,
    "Здравствуйте! Хочу записаться на «ПЕЛЬМЕНИ & ВИНО — Гастрономическая пятница». "
  );

  return (
    <>
      <h2 className="mt-6 font-semibold">Доступные даты и время</h2>
      <ul className="mt-2 space-y-2">
        {ev.sessions.map((s) => (
          <li key={s.id} className="flex items-center gap-2 rounded-xl border p-3 text-sm">
            <Calendar className="w-4 h-4 text-slate-600" />
            <span className="tabular-nums">
              {formatShortDate(s.start)} — {formatTimeRange(s.start, s.end)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-4">
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-xl bg-rose-600 text-white px-4 py-2 text-sm font-medium hover:bg-rose-700"
        >
          Записаться
        </a>
      </div>

      {/* Описание мероприятия */}
      {ev.description && (
        <div className="mt-6 leading-relaxed text-slate-800">
          {ev.description}
        </div>
      )}
    </>
  );
}
