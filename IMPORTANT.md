# TenderKZ — Важная информация

## Ссылки
- Сайт: https://tenderkzz.vercel.app
- Backend API: https://tenderkz-public.onrender.com
- GitHub (private): https://github.com/d71404189-beep/tenderkz
- Neon DB: https://console.neon.tech

## Демо-доступ
- Email: demo@tenderkz.kz
- Пароль: demo123456

## Как обновить сайт
Внести изменения в код, затем в терминале VS Code:
```
cd C:\tuf
git add .
git commit -m "описание что изменил"
git push
```
Vercel и Render обновятся автоматически через 2-5 минут.

## Как запустить локально
1. PostgreSQL должен работать (порт 5432)
2. Backend:
   ```
   cd C:\tuf\apps\api
   npm install
   npx prisma db push
   npx nest start --watch
   ```
3. Frontend:
   ```
   cd C:\tuf\apps\desktop
   npm install
   npm run dev
   ```
4. Открыть http://localhost:5173

## Сервисы (бесплатные)
- Neon — PostgreSQL база данных (бесплатно, 512 МБ)
- Render — Backend API (бесплатно, засыпает через 15 мин, просыпается ~30 сек)
- Vercel — Frontend (бесплатно, безлимит)

## Render Manual Deploy
Если автоматический деплой не сработал:
https://dashboard.render.com → tenderkz-public → Manual Deploy → Deploy latest commit

## Vercel Redeploy
https://vercel.com → tenderkz-web → Deployments → ⋮ → Redeploy

## GitHub токен
Хранится в git credential manager. Если нужен новый:
https://github.com/settings/tokens → Generate new token (classic) → галочка repo
