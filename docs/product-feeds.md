# Товарний фід Meta (Facebook / Instagram Catalog)

Фід містить лише **збірки ПК** (`build`, сторінки `/pk/[slug]`). Аксесуари з `/catalog` у фід не входять.

## Що потрапляє у фід

У Sanity (проєкт `if6dzz62`, kondor-pc-adm) на збірці є перемикач **«Показувати в фіді Meta»** (`showInFeed`, за замовчуванням «Ні», група «Основне»).

Збірка потрапляє у фід, якщо:

- `showInFeed == true`;
- статус не «Архів» (`archived`);
- є хоча б одне фото;
- `priceUah > 0`.

Інакше збірка пропускається (`isFeedBuild` та `buildFeedItemXml` у `lib/feed.ts`).

## URL фіда

```
https://kondor-pc.ua/api/feed/meta
```

Локально: `http://localhost:3000/api/feed/meta`.

- Формат: RSS 2.0 з `xmlns:g="http://base.google.com/ns/1.0"`.
- `Content-Type: application/xml; charset=utf-8`.
- Один `<item>` на збірку (варіантів кольору немає, `item_group_id` не використовується).
- Базовий URL береться з `NEXT_PUBLIC_SITE_URL` (за замовчуванням `https://kondor-pc.ua`). У `.env.local` локально це зазвичай `http://localhost:3000`, тому `g:link` у локальному фіді вказує на localhost.

## Мапінг полів

| Поле фіда | Джерело / логіка |
|---|---|
| `g:id` | `build.sku`, якщо порожній — `slug` |
| `g:title` | `build.name` |
| `g:description` | зі `spec` (CPU, GPU, RAM, SSD) і слогана; SEO-опис (`seo.metaDescription`) не використовується, бо там може бути застаріла ціна |
| `g:link` | `{SITE_URL}/pk/{slug}` |
| `g:image_link` / `g:additional_image_link` | `heroImage` і `gallery` (до 19 додаткових), без дублікатів, з `fm=jpg` |
| `g:brand` | `Kondor PC` |
| `g:condition` | `new` |
| `g:availability` | `in_stock` → `in stock`; `assemble_on_order` → `preorder`; інше → `out of stock` |
| `g:price` / `g:sale_price` | без знижки: `price = priceUah`. Якщо `oldPriceUah > priceUah`: `price = oldPriceUah`, `sale_price = priceUah`. Формат `34999.00 UAH` |
| `g:product_type` | `Ігрові ПК` |
| `g:google_product_category` | `Electronics > Computers > Desktop Computers` |

Ціна — це базова `priceUah`, без доплат за конфігуратор.

> ⚠️ **Формат зображень.** Sanity CDN залежно від заголовка `Accept` може віддати WebP, який Meta відхиляє. Тому `toFeedImageUrl()` прибирає `auto=format` і додає `fm=jpg`.

> ⚠️ **Унікальність `g:id`.** `sku` у Sanity має бути унікальним для кожної збірки. Два однакові `sku` призведуть до того, що Meta сприйме другу збірку як оновлення першої. Це значення також має передаватись у `content_ids` Meta Pixel, коли його буде реалізовано (зараз на сайті лише `dataLayer`/GTM).

## Кешування й оновлення

- Роут статичний: `dynamic = "force-static"`, `revalidate = 3600` (`app/api/feed/meta/route.ts`). Літерал має збігатися з `SANITY_REVALIDATE_SECONDS` (`lib/sanity/revalidate.ts`).
- Одразу після зміни збірки в Sanity кеш скидає вебхук `POST /api/revalidate` (гілка `build`: тег `sanity:pc:builds` і шлях `/api/feed/meta`).
- Налаштування вебхука (Sanity → Project `if6dzz62` → API → Webhooks):
  - URL: `https://kondor-pc.ua/api/revalidate`;
  - Dataset: `production`; Trigger: Create, Update, Delete; метод POST;
  - Filter: `!(_id in path("drafts.**")) && !(_id in path("versions.**"))`;
  - Projection: `{ "_id": _id, "_type": _type, "slug": slug.current, "pathPrefix": pathPrefix, "code": code }`;
  - Secret: те саме значення, що й `SANITY_REVALIDATE_SECRET`.

## Налаштування в Meta Commerce Manager (вручну, потрібен доступ до Business Manager)

1. **Commerce Manager → Каталоги → [каталог] → Джерела даних → Запланований фід (Scheduled feed)**.
2. Вставити URL `https://kondor-pc.ua/api/feed/meta`.
3. Формат — XML, частота оновлення — раз на добу.
4. Запустити перший імпорт вручну («Завантажити зараз»).
5. Переглянути вкладку **Diagnostics**: Meta покаже помилки й попередження по конкретних збірках.

## Перевірка

- Тести: `npm test` (`lib/feed.test.ts`).
- Локально: відкрити `/api/feed/meta`. Якщо жодна збірка не має `showInFeed == true`, фід порожній (це очікувано).
