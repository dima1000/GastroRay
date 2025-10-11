import Link from "next/link";
import { MapPin, Banknote, Users } from "lucide-react";
import { getAllEvents } from "./lib/events";
import { WHATSAPP_BASE_URL } from "./lib/config";

// Короткий формат для бейджей: "24.10"
function formatShortDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
}

// wa.me + автотекст (общая связь)
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

            {/* Кнопка общей связи в WhatsApp (вверху, справа) */}
            <a
              href={waGeneral}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium text-white hover:brightness-95"
              style={{ backgroundColor: "#25D366" }}
            >
              Связаться с нами в WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ОПИСАНИЕ СООБЩЕСТВА — фиолетовый фон */}
      <section id="about" className="bg-violet-600 text-white">
		  <div className="max-w-6xl mx-auto px-6 md:px-10 py-10">
			<div className="grid gap-6 md:grid-cols-3 items-start">
			  <div className="md:col-span-2">
				<h2 className="text-2xl font-semibold mb-3">О сообществе «Гастрономический Рай»</h2>
				<p className="leading-relaxed opacity-95">
				  Мы объединяем людей, которым нравится пробовать новое, готовить, дегустировать и узнавать кухню изнутри.
				  Делаем камерные ужины, дегустации и мастер-классы с акцентом на качество продуктов и атмосферу.
				</p>
				<p className="mt-3 leading-relaxed opacity-95">
				  Сезонные мероприятия, локальные фермеры и винодельни, лучшие вина и тёплая атмосфера небольших групп.
				</p>
			  </div>
			  <div className="relative rounded-2xl overflow-hidden border border-white/20 bg-white/10 aspect-video">
				  <picture>
					<source
					  srcSet="/images/about-wide-800.webp 800w,
							  /images/about-wide-1200.webp 1200w,
							  /images/about-wide-1600.webp 1600w"
					  type="image/webp"
					/>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
					  src="/images/about-wide-1200.jpg"   // JPG фоллбек (не обязателен)
					  alt="Наши встречи — атмосфера и вкус"
					  className="absolute inset-0 h-full w-full object-cover"
					  sizes="(min-width: 768px) 33vw, 100vw"
					/>
				  </picture>
				</div>
			</div>
		  </div>
		</section>


      {/* МЕРОПРИЯТИЯ — по центру */}
      {/* МЕРОПРИЯТИЯ — фиксированные карточки по центру */}
<main className="px-6 md:px-10 py-10">
  <div className="mx-auto max-w-6xl">
    {/* Фиксированная ширина колонки: 320–360px; центрируем сетку */}
    <div className="grid justify-center gap-6 [grid-template-columns:repeat(auto-fill,minmax(320px,360px))]">
      {events.map((ev) => (
        <article
          key={ev.slug}
          className="overflow-hidden rounded-2xl border bg-white shadow-sm hover:shadow-xl transition-shadow"
        >
          <div className="relative aspect-video">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ev.image}
              alt={ev.title}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
          </div>

          <div className="p-4">
            <h3 className="text-base font-semibold leading-tight">{ev.title}</h3>

            <div className="mt-2 grid gap-1 text-sm text-slate-600">
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {ev.venue}</div>
              <div className="flex items-center gap-2"><Banknote className="w-4 h-4" /> {ev.price}</div>
              {ev.spots && <div className="flex items-center gap-2">Всего {ev.spots} мест</div>}
            </div>

            {/* компактные бейджи дат */}
            <div className="mt-3">
              <div className="text-xs font-medium mb-1">Ближайшие даты</div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {ev.sessions.map((s, i) => (
                  <span key={s.id} className="inline-flex items-center">
                    <span className="rounded-full border px-2 py-0.5 text-slate-700">
                      {new Date(s.start).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" })}
                    </span>
                    {i < ev.sessions.length - 1 && <span className="px-1 text-slate-400">•</span>}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <Link
                href={`/events/${ev.slug}`}
                className="inline-flex items-center justify-center rounded-xl bg-rose-600 text-white px-4 py-2 text-sm font-medium hover:bg-rose-700 w-full"
              >
                Подробнее
              </Link>
            </div>
          </div>
        </article>
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
    </div>
  );
}
