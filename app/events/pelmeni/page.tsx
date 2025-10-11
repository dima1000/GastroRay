// app/events/pelmeni/page.tsx
import { MapPin, Banknote, Clock } from "lucide-react";
import ClientBookingPelmeni from "./ClientBookingPelmeni";
import { getEventBySlug } from "../../lib/events";
import VimeoEmbed from "../../components/VimeoEmbed";
import { WHATSAPP_BASE_URL } from "../../lib/config";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ПЕЛЬМЕНИ & ВИНО — Гастрономический Рай",
  description: "Всего 8 мест — уютно и камерно.",
};

// Собираем wa.me-ссылку с сообщением (как на главной)
function withMessage(baseUrl: string, message: string) {
  const joiner = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${joiner}text=${encodeURIComponent(message)}`;
}

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

  const waGeneral = withMessage(
    WHATSAPP_BASE_URL,
    "Здравствуйте! У меня вопрос к сообществу Гастрономический Рай"
  );

  return (
    <div className="min-h-screen">
      {/* HERO */}
      <section className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-6 py-10 md:py-14">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">{ev.title}</h1>
              <p className="mt-1 text-slate-600">{ev.teaser}</p>
            </div>

            {/* Кнопка общей связи в WhatsApp (зеленая) */}
