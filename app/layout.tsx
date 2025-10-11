// app/layout.tsx
import "./globals.css";

export const metadata = {
  title: "Гастрономический Рай — события",
  description: "Сообщество и мероприятия",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
