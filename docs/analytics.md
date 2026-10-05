# Аналітика (GTM / dataLayer)

GTM-контейнер підключено в `app/layout.tsx` (`NEXT_PUBLIC_GTM_ID`, fallback — `GTM-KWHVVR26`).
Усі події йдуть у `window.dataLayer` через `lib/analytics/ecommerce.ts`. Валюта завжди `UAH`.

`items[]`: `{ item_id, item_name, item_variant?, price, quantity }`.
`item_id` = `sku` збірки (збігається з `g:id` у фідах Meta/Google); для аксесуарів — код кольору, інакше `slug`.

| Подія | Де викликається |
|---|---|
| `view_item` | Сторінки `/pk/[slug]` і `/catalog/[slug]` (`ViewItemTracker`) |
| `add_to_cart` | `PurchaseActions`, `StickyMobileBuyBar`, `CatalogPurchasePanel`, `CatalogCard`, `CatalogCardBuyButton`, `CartCrossSell` |
| `start_checkout` | Кнопка «Оформити замовлення» в `CartDrawer` |
| `submit_order` | `CheckoutView` після Telegram + KeyCRM |

`submit_order`: `order_number`, `value`, `items`, `user_data` (`phone`, `first_name`, `last_name`, `city`).
`user_data` передається **без хешування**.

Подія `purchase` прибрана. Конверсія — `submit_order`; для оплати карткою вона спрацьовує до підтвердження платежу.
