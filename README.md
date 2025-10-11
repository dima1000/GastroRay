# Гастрономический Рай — Vite/React проект

## Запуск локально
```bash
npm install
npm run dev
```

## Сборка
```bash
npm run build
npm run preview
```

## Деплой через Netlify + GitHub
1. Создайте репозиторий на GitHub и загрузите файлы из этой папки (или распакуйте zip и `git init && git add . && git commit -m "Initial" && git branch -M main && git remote add origin <repo> && git push -u origin main`).
2. В Netlify: **Add new site → Import from Git** → выберите ваш репозиторий.
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Нажмите **Deploy**. При каждом `git push` сайт обновится автоматически.

> Мы используем hash-роутинг, поэтому дополнительных правил редиректа не требуется.

### Логотип
Файл `public/logo.png`. Замените на свой.

### Где редактировать контент
`src/App.jsx` — карточка события и страница события. Добавляйте новые события по аналогии.
