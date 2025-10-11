import Link from "next/link";
import { Calendar, MapPin, Banknote, Users } from "lucide-react";
import { getAllEvents } from "./lib/events";
import { WHATSAPP_BASE_URL } from "./lib/config";

// Короткий формат для бейджей: "24.10"
function formatShortDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
}

// Собираем wa.me-ссылку с сообщением
function withMessage(baseUrl: string, message: string) {
  const joiner = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${joiner}text=${encodeURIComponent(message)}`;
}

export default function HomePage() {
  const events = getAllEvents(); // сейчас одно мероприятие
  const waGeneral = withMessage(
    WHATSAPP_BASE_URL,
    "Здравствуйте! У меня вопрос к сообществу Гастрономический Рай"
  );

  return (
    <div className="min-h-screen">
      {/* HERO */}
      <section className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* логотип */}
              <img src="/logo.png" alt="Гастрономический Рай" className="w-14 h-14 rounded-full border" />
              <div>
                <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Гастрономический Рай</h1>
                <p className="text-slate-600">Мероприятия сообщества: вкусы, люди и открытия</p>
              </div>
            </div>

            {/* Кнопка общей связи в WhatsApp */}
            <a
              href={waGeneral}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm font-medium hover:bg-slate-50"
            >
              Связаться с нами в WhatsApp
            </a>
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
              Сезонные ингредиенты, локальные фермеры, натуральные вина и тёплая атмосфера небольших групп.
            </p>
          </div>
          <div className="rounded-2xl border bg-amber-50 p-4">
            <h3 className="font-medium mb-2">Как присоединиться</h3>
            <ul className="list-disc pl-5 text-slate-700 space-y-1">
              <li>Выберите удобную дату ниже</li>
              <li>Оставьте заявку — пришлём подтверждение</li>
              <li>Приходите голодными и в хорошем настроении :)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* СПИСОК МЕРОПРИЯТИЙ (одна карточка с тремя датами) */}
      <main className="px-6 md:px-10 py-10">
        <div className="max-w-6xl mx:auto">
          <div className="max-w-6xl mx-auto">
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {events.map((ev) => (
                <article key={ev.slug} className="group overflow-hidden rounded-2xl border bg-white shadow-sm hover:shadow-xl transition-shadow">
                  <div className="relative aspect-video">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={ev.image} alt={ev.title} className="absolute inset-0 h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold">{ev.title}</h3>
                    <div className="mt-2 grid gap-1 text-sm text-slate-600">
                      <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {ev.venue}</div>
                      <div className="flex items-center gap-2"><Banknote className="w-4 h-4" /> {ev.price}</div>
                      {ev.spots && <div className="flex items-center gap-2"><Users className="w-4 h-4" /> Всего {ev.spots} мест</div>}
                    </div>

                    {/* компактные бейджи дат: 24.10 • 14.11 • 28.11 */}
                    <div className="mt-4">
                      <div className="text-sm font-medium mb-1">Ближайшие даты</div>
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        {ev.sessions.map((s, i) => (
                          <span key={s.id} className="inline-flex items-center">
                            <span className="rounded-full border px-2.5 py-1 text-xs text-slate-700">
                              {formatShortDate(s.start)}
                            </span>
                            {i < ev.sessions.length - 1 && (
                              <span className="px-2 text-slate-400">•</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4">
                      <Link
                        href={`/events/${ev.slug}`}
                        className="inline-flex items-center justify-center rounded-xl bg-rose-600 text-white px-4 py-2 text-sm font-medium hover:bg-rose-700"
                      >
                        Подробнее
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
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
    </div>
  );
}
