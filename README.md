# Гастрономический Рай — страница мероприятий

Готовый минимальный проект **Next.js 14 + Tailwind**, без внешних UI-фреймворков.
Карточки событий, поиск, фильтры, модальное окно, выгрузка в календарь (.ics).

## Локальный запуск
```bash
npm i
npm run dev
```
Откройте http://localhost:3000

## Деплой на Netlify (из GitHub)
- Создайте репозиторий и запушьте проект.
- На Netlify: **Add new site** → **Import from Git** → выберите репозиторий.
- Build command: `npm run build`
- Publish directory: `.next`

## Где править мероприятия?
Откройте `app/page.tsx`, массив `RAW_EVENTS`.
