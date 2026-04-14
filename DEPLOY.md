# TenderKZ — Деплой на бесплатные сервисы

## Шаг 1: Neon (PostgreSQL) — бесплатно, работает 24/7

1. Зайди на https://neon.tech → Sign Up (через GitHub)
2. Нажми "Create Project" → назови "tenderkz" → Region: Singapore (ближе к КЗ)
3. Скопируй **connection string** — выглядит так:
   `postgresql://tenderkz:password@ep-xxx.us-east-2.aws.neon.tech/tenderkz?sslmode=require`

## Шаг 2: Render (Backend API) — бесплатно

1. Зайди на https://render.com → Sign Up (через GitHub)
2. Создай **Web Service**:
   - Connect repository: твой GitHub-репозиторий
   - Root Directory: `apps/api`
   - Build Command: `npm install && npx prisma db push --skip-generate && npx prisma generate && npm run build`
   - Start Command: `node dist/main.js`
   - Free plan
3. Добавь Environment Variables:
   - `DATABASE_URL` = (строка из Neon)
   - `JWT_SECRET` = tenderkz-prod-secret-2026
   - `APP_PORT` = 10000
   - `NODE_ENV` = production
4. Нажми "Create Web Service"
5. Запомни URL: `https://tenderkz-api.onrender.com`

## Шаг 3: Vercel (Frontend) — бесплатно

1. Зайди на https://vercel.com → Sign Up (через GitHub)
2. Импортируй GitHub-репозиторий
3. Root Directory: `apps/desktop`
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Добавь Environment Variables:
   - `VITE_API_URL` = https://tenderkz-api.onrender.com
7. Нажми "Deploy"
8. Запомни URL: `https://tenderkz.vercel.app`

## Шаг 4: Обновить прокси

После получения URL Render, обнови `vercel.json`:
```json
{ "source": "/api/(.*)", "destination": "https://tenderkz-api.onrender.com/api/$1" }
```

## Шаг 5: Залить код на GitHub

```bash
cd C:\tuf
git init
git add .
git commit -m "TenderKZ initial release"
git remote add origin https://github.com/ТВОЙ-ЛОГИН/tenderkz.git
git push -u origin main
```

## Итого — $0/мес:
- Neon: 512 МБ PostgreSQL (хватит для MVP)
- Render: 750 часов/мес (засыпает через 15мин, просыпается за ~30сек)
- Vercel: безлимитный хостинг React

После деплоя TenderKZ будет работать даже когда твой ПК выключен!
