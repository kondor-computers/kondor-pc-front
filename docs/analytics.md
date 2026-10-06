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

Покупка (`submit_order`) та початок оформлення (`start_checkout`) додатково відправляються з сервера, щоб не губитись через блокувальники та обмеження браузерів. `view_item` та `add_to_cart` лишаються лише браузерними (їх багато, а серверна копія майже нічого не додає).

Потік: `trackStartCheckout` / `CheckoutView` → `lib/analytics/serverEvent.ts` (`fetch` з `keepalive`) → `POST /api/analytics/event` → `lib/analytics/server/{meta,tiktok}.ts`.

| Подія сайту | Meta | TikTok | `event_id` |
|---|---|---|---|
| `submit_order` | `Purchase` | `CompletePayment` | номер замовлення |
| `start_checkout` | `InitiateCheckout` | `InitiateCheckout` | випадковий UUID на кожну подію |

- Дедуплікація: той самий `event_id` є в події `dataLayer` (поле `event_id`) і в серверному запиті. Теги GTM передають його як `eventID` (Meta) та `event_id` (TikTok).
- Ідентифікатори: cookie `_fbp`/`_fbc` (Meta Pixel), `_ttp` (TikTok Pixel), `ttclid` і `fbclid` з URL зберігає `ClickIdTracker` (cookie `kondor_ttclid`, `kondor_fbc`, 30 днів).
- Помилки відправки не впливають на оформлення замовлення, лише логуються (на Hobby логи Vercel зберігаються 1 годину).
- Ендпоінт перевіряє `Origin`, валідує тіло (zod), пропускає ботів (за User-Agent). Ліміту запитів немає.
- `/api/analytics/purchase` залишено для сумісності зі старими відкритими сторінками, він перенаправляє на `/event`.

### Змінні оточення (server-only)

| Змінна | Призначення |
|---|---|
| `META_PIXEL_ID`, `META_CAPI_TOKEN` | Meta Conversions API. Без них Meta пропускається |
| `META_GRAPH_VERSION` | Версія Graph API (за замовчуванням `v25.0`) |
| `META_TEST_EVENT_CODE` | Лише для тестів (Test events). У продакшені прибрати |
| `TIKTOK_PIXEL_CODE`, `TIKTOK_EVENTS_TOKEN` | TikTok Events API. Без них TikTok пропускається |
| `TIKTOK_TEST_EVENT_CODE` | Лише для тестів. У продакшені прибрати |
| `ANALYTICS_USER_DATA` | `none` (за замовчуванням): без персональних даних; `phone`: + хешований телефон (лише для покупки) |
| `ANALYTICS_SERVER_EVENTS` | Які події відправляти з сервера, через кому: `purchase` (за замовчуванням), `purchase,start_checkout`. Дозволяє вмикати події на Vercel без деплою |

### Порядок увімкнення нової серверної події

1. У GTM оновити теги Meta і TikTok, щоб вони передавали `event_id` з події `dataLayer` (див. код нижче). Це безпечно й до деплою коду.
2. Задеплоїти код (`event_id` з'являється в `dataLayer`).
3. Перевірити в Network, що запит Meta `tr` має `eid`, а TikTok `pixel` має `event_id`.
4. Додати `start_checkout` у `ANALYTICS_SERVER_EVENTS` на Vercel і задеплоїти.
5. Перевірити в Events Manager: джерело «Browser and Server», а кількість подій не подвоїлась.

Якщо ввімкнути серверну подію до пункту 1–3, браузерна й серверна копії не зіставляться, і подія порахується двічі.

### Теги GTM (фрагмент, що змінюється)

Meta (`Meta Pixel - Events`), замість блоку `if (name === 'submit_order')`:

```js
if (ev.event_id) {
  fbq('track', map[name], params, { eventID: ev.event_id });
} else {
  fbq('track', map[name], params);
}
```

TikTok (`TikTok Pixel - Events`):

```js
if (ev.event_id) {
  ttq.track(map[name], params, { event_id: ev.event_id });
} else {
  ttq.track(map[name], params);
}
```

### Перевірка

1. Додати test-коди, зробити тестове замовлення з позначками «ТЕСТ» і пройти шлях до кошика.
2. Події з'являються в Test events Meta і TikTok.
3. У Meta Events Manager статус події має бути **Deduplicated** (збігається з браузерною).
4. Прибрати test-коди.
