# AYF — портфолио

Статика: `index.html` + `assets/` (CSS, JS, скриншоты, иконки).
Без сборки, без зависимостей. Открывается локально и на любом хостинге.

## Локальный просмотр

```powershell
cd "C:\Users\Magtop1\Documents\Default Project\ayf-portfolio"
python -m http.server 8768
```

Открыть `http://127.0.0.1:8768/`.

## Что заменить перед показом клиентам

1. **Почта** — сейчас `magtope2@mail.ru` (шапка, меню, контакты, футер).
   Заменить на рабочую бизнес-почту, если эта не подходит.
2. **Telegram** — пока не подключён. Дать ник → заменить CTA на `https://t.me/<ник>`
   в шапке, мобильном меню и блоке «Контакты».
3. **Домен** — `canonical`, `og:url`, `og:image` в `<head>` указывают на
   `magtop1.pythonanywhere.com/s/portfolio/`. При переезде заменить.
4. **Цифры кейсов** — рейтинги и количество отзывов взяты с Яндекс.Карт
   (Monkey Li, Индикатор), 13 страниц — exc24. Сверить перед публикацией.
5. **Сроки в услугах** — «1–2 недели», «2–4 недели», «от 1 недели» — ориентиры.
   Проверить, что они реальные.

## Кейсы и ссылки

| Кейс | Ниша | Ссылка |
|---|---|---|
| Monkey Li | барбершоп, Курск | `/s/monkey-li/` |
| Эксклюзив Компьютерс | ремонт техники, Казань | `/s/exc24/` |
| Индикатор | кузовной ремонт, Казань | `/s/indikator/` |

Скриншоты лежат в `assets/` (WebP, 1280 px по ширине). Переснять можно
headless Chrome, затем сжать в WebP.

## Деплой на PythonAnywhere

Папка на сервере: `/home/Magtop1/outreach-bot/sites/portfolio/`.

```powershell
python pa_push.py   # если файл настроен на эту папку
```

Или вручную через API: загрузить `index.html`, `meta.json` и `assets/`
в `sites/portfolio/`, затем reload webapp.

Проверка: `https://magtop1.pythonanywhere.com/s/portfolio/`.

## Структура

```
index.html        разметка + JSON-LD (ProfessionalService)
meta.json         метаданные для роутера /s/<slug>/
assets/style.css  дизайн, адаптив, анимации
assets/main.js    меню, reveal, лайтбокс
assets/*.webp     скриншоты кейсов
assets/           favicon, og-cover
```
