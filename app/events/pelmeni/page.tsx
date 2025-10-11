// app/events/pelmeni/page.tsx
export const dynamic = "force-dynamic"; // чтобы Netlify отдал SSR и не пытался искать статический файл

export const metadata = {
  title: "Пельмени — тест страницы",
};

export default function PelmeniTestPage() {
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Пельмени — тест</h1>
      <p>Если вы видите эту страницу, маршрут <code>/events/pelmeni</code> работает.</p>
      <p><a href="/">← На главную</a></p>
    </div>
  );
}
