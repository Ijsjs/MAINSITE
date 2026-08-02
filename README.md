# jizer / mainsite

Проект на рабочем столе: `Desktop/mainsite`

```
mainsite/
  index.html
  frontend/     React
  backend/      FastAPI
  data/         база SQLite
  start.sh
  Dockerfile    для выкладки в интернет
```

## Локальный запуск (Mac)

```bash
cd ~/Desktop/mainsite
./start.sh
```

Открой: http://127.0.0.1:5173

Админ: `jizer` / `jizer_admin`

---

## Как выложить в интернет

Нужен хостинг, который умеет держать **Python (FastAPI)** и хранить файлы БД.  
Обычный GitHub Pages / Netlify **не подойдёт один** — там нет нормального backend.

### Вариант A — Render (проще всего для старта)

1. Зарегистрируйся на [https://render.com](https://render.com)
2. Залей проект на GitHub (создай репозиторий и загрузи папку `mainsite`)
3. В Render: **New → Web Service** → выбери репозиторий
4. Настройки:
   - **Runtime:** Docker
   - **Instance:** Free
5. После деплоя получишь ссылку вида `https://something.onrender.com`
6. Этой ссылкой делись с людьми

> На бесплатном тарифе сайт может «засыпать» без посещений ~15 минут — первый вход подождёт ~30–60 сек.

### Вариант B — Railway

1. [https://railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Выбери репозиторий с `mainsite` (есть `Dockerfile`)
4. Открой публичный URL в настройках сервиса

### Вариант C — VPS (свой сервер, свой домен)

Подойдёт Timeweb / Selectel / DigitalOcean (~200–400 ₽/мес):

1. Купи VPS (Ubuntu)
2. Установи Docker
3. На сервере:

```bash
git clone <твой-репозиторий> mainsite
cd mainsite
docker build -o -t jizer .
docker run -d -p 80:8000 -v $(pwd)/data:/app/data --name jizer jizer
```

4. Привяжи домен (например `jizer.ru`) к IP сервера в панели регистратора домена (A-запись)

### Свой домен

1. Купи домен (reg.ru, nic.ru, Namecheap)
2. В DNS укажи A-запись на IP сервера **или** CNAME на адрес Render/Railway
3. Включи HTTPS (у Render/Railway — автоматически; на VPS — nginx + Let's Encrypt)

---

## Важно перед публикацией

1. Смени пароль админа `jizer_admin` на свой
2. В `backend/auth.py` поменяй `SECRET_KEY` на длинную случайную строку
3. Ссылки соцсетей — в `backend/main.py` (`/api/profile`)
4. База будет в `data/jizer.db` на сервере — делай бэкапы

## Аккаунты

| Роль | Логин | Пароль |
|------|-------|--------|
| Админ | `jizer` | `jizer_admin` |
| Юзер | регистрация на сайте | свой |
