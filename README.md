# Цех — сайт-портфолио

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
2. **Telegram** — подключён: `@Strixer122` → `https://t.me/Strixer122`.
   CTA стоит в шапке, мобильном меню, блоке «Контакты», футере и JSON-LD.
   Сменить ник — поиском по `Strixer122` в `index.html`.
3. **Домен** — `canonical`, `og:url`, `og:image` в `<head>` указывают на
   `magtop1.github.io/portfolio/`. При переезде на свой домен заменить.
4. **Цифры кейсов** — рейтинги и количество отзывов взяты с Яндекс.Карт
   (Monkey Li, Индикатор), 13 страниц — exc24. Сверить перед публикацией.
5. **Сроки в услугах** — «1–2 недели», «2–4 недели», «от 1 недели» — ориентиры.
   Проверить, что они реальные.

## Кейсы и ссылки

Кейсы открываются из папки `cases/` — это зеркала внутри репозитория, а не ссылки
на PythonAnywhere (в РФ он не открывается без VPN, и «Открыть сайт» вело в таймаут).

| Кейс | Ниша | Ссылка |
|---|---|---|
| Monkey Li | барбершоп, Курск | `cases/monkey-li/` |
| Эксклюзив Компьютерс | ремонт техники, Казань | `cases/exc24/` |
| Индикатор | кузовной ремонт, Казань | `cases/indikator/` |

Зеркала — копии, исходники живут на PythonAnywhere (`sites/<slug>/`) и в
`Default Project\exc24-site\dist\`. При правке кейса обновлять обе копии.

Скриншоты для карточек лежат в `assets/` (WebP, 1280 px по ширине). Переснять можно
headless Chrome, затем сжать в WebP.

## Публикация

Основной адрес (GitHub Pages): `https://magtop1.github.io/portfolio/`.

Репозиторий: `https://github.com/Magtop1/portfolio` (ветка `main`, корень).

Обновление:

```powershell
cd "C:\Users\Magtop1\Documents\Default Project\ayf-portfolio"
git add -A
git commit -m "update portfolio"
git push
```

GitHub Pages пересоберёт сайт автоматически за 30–90 секунд.

Зеркало на PythonAnywhere: `/home/Magtop1/outreach-bot/sites/portfolio/`,
`https://magtop1.pythonanywhere.com/s/portfolio/`. Обновляется через
`pa_push.py` из папки `tg-bot`.

## Структура

```
index.html        разметка + JSON-LD (ProfessionalService)
meta.json         метаданные для роутера /s/<slug>/
assets/style.css  дизайн, адаптив, анимации
assets/main.js    меню, reveal, лайтбокс
assets/*.webp     скриншоты кейсов
assets/           favicon, og-cover
cases/            зеркала кейсов: monkey-li, exc24, indikator
o/                страница оффера для лидов (noindex), копия /o/ с PythonAnywhere
robots.txt        индексация + ссылка на sitemap
sitemap.xml       одна страница портфолио
```

## Название

Бренд — **Цех** (`tsekh.ru` свободен на 20.10.2026, не выкуплен). Прежнее имя AYF
убрано из логотипа, title, OG, JSON-LD и футера. При покупке домена заменить
`canonical` и `og:url` на него.
