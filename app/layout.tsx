export const metadata = {
  title: "Гастрономический Рай — Мероприятия",
  description: "Страница мероприятий сообщества «Гастрономический Рай».",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
