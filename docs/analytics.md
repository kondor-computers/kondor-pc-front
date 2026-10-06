# Аналітика (GTM / dataLayer)

GTM-контейнер підключено в `app/layout.tsx` (`NEXT_PUBLIC_GTM_ID`, fallback — `GTM-KWHVVR26`).
Усі події йдуть у `window.dataLayer` через `lib/analytics/ecommerce.ts`. Валюта завжди `UAH`.

`items[]`: `{ item_id, item_name, item_variant?, price, quantity }`.
`item_id` = `sku` збірки (збігається з `g:id` у фідах Meta/Google); для аксесуарів — код кольору, інакше `slug`.

| Подія | Де викликається |
|---|---|
| `view_item` | Сторінки `/pk/[slug]` і `/catalog/[slug]` (`ViewItemTracker`) |
| `add_to_cart` | `PurchaseActions`, `StickyMobileBuyBar`, `CatalogPurchasePanel`, `CatalogCard`, `CatalogCardBuyButton`, `CartCrossSell` |
| `start_checkout` | Кнопка «Оформити замовлення» в `CartDrawer`; кнопки «Купити зараз» (`PurchaseActions`, `StickyMobileBuyBar`, `CatalogPurchasePanel`) — після `add_to_cart` |
| `submit_order` | `CheckoutView` після Telegram + KeyCRM |

`submit_order`: `order_number`, `value`, `items`, `user_data` (`phone`, `first_name`, `last_name`, `city`).
`user_data` передається **без хешування**.

Подія `purchase` прибрана. Конверсія — `submit_order`; для оплати карткою вона спрацьовує до підтвердження платежу.

## Серверні події (Meta Conversions API, TikTok Events API)

Покупка (`submit_order`) додатково відправляється з сервера, щоб не губитись через блокувальники та обмеження браузерів.

Потік: `CheckoutView` → `lib/analytics/serverPurchase.ts` (`fetch` з `keepalive`) → `POST /api/analytics/purchase` → `lib/analytics/server/{meta,tiktok}.ts`.

- Meta: подія `Purchase`, TikTok: `CompletePayment`.
- Дедуплікація з браузерною подією: `event_id` = номер замовлення (його ж передають теги GTM).
- Ідентифікатори: cookie `_fbp`/`_fbc` (Meta Pixel), `_ttp` (TikTok Pixel), `ttclid` і `fbclid` з URL зберігає `ClickIdTracker` (cookie `kondor_ttclid`, `kondor_fbc`, 30 днів).
- Помилки відправки не впливають на оформлення замовлення, лише логуються.
- Ендпоінт перевіряє `Origin`, валідує тіло (zod). Ліміту запитів немає.

### Змінні оточення (server-only)

| Змінна | Призначення |
|---|---|
| `META_PIXEL_ID`, `META_CAPI_TOKEN` | Meta Conversions API. Без них Meta пропускається |
| `META_GRAPH_VERSION` | Версія Graph API (за замовчуванням `v25.0`) |
| `META_TEST_EVENT_CODE` | Лише для тестів (Test events). У продакшені прибрати |
| `TIKTOK_PIXEL_CODE`, `TIKTOK_EVENTS_TOKEN` | TikTok Events API. Без них TikTok пропускається |
| `TIKTOK_TEST_EVENT_CODE` | Лише для тестів. У продакшені прибрати |
| `ANALYTICS_USER_DATA` | `none` (за замовчуванням): без персональних даних; `phone`: + хешований телефон |

### Перевірка

1. Додати test-коди, зробити тестове замовлення з позначками «ТЕСТ».
2. Подія з'являється в Test events Meta і TikTok.
3. У Meta Events Manager статус події має бути **Deduplicated** (збігається з браузерною).
4. Прибрати test-коди.
