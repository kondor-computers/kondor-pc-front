import { formatCartItemCrmName } from "@/lib/cart/formatItemSpecification";
import type { CartItem } from "@/lib/cartStore";
import type { PromoApplication } from "@/lib/promoCode";
import type {
  DeliveryMethod,
  OrderFormValues,
  PaymentMethod,
} from "@/lib/validations/order";

const KEYCRM_SOURCE_ID = 1;

function mapPayment(paymentMethod: PaymentMethod): {
  payment_method: string;
  payment_method_id?: number;
} {
  switch (paymentMethod) {
    case "monopay":
      return { payment_method: "MonoPay", payment_method_id: 6 };
    case "cod":
      return {
        payment_method: "Післяплата Нова пошта",
        payment_method_id: 7,
      };
    case "iban_individual":
      return {
        payment_method: "Безготівковий (IBAN)",
        payment_method_id: 3,
      };
    case "iban_business":
      return { payment_method: "Для ФОП / ЮО", payment_method_id: 8 };
    case "crypto":
      return { payment_method: "Криптовалюта", payment_method_id: 9 };
    case "monobank_parts":
      return { payment_method: "Частинами Monobank" };
    case "privat_parts":
      return { payment_method: "Частинами ПриватБанк" };
    case "pumb_parts":
      return { payment_method: "Частинами ПУМБ" };
    default:
      return { payment_method: paymentMethod };
  }
}

function mapDelivery(
  deliveryMethod: DeliveryMethod,
  values: OrderFormValues,
): {
  delivery_service_id?: number;
  shipping_service: string;
  shipping_address_city?: string;
  shipping_secondary_line?: string;
  shipping_receive_point?: string;
} {
  if (deliveryMethod === "self_pickup") {
    return {
      delivery_service_id: 3,
      shipping_service: "Самовивіз",
    };
  }

  if (deliveryMethod === "np_courier") {
    return {
      delivery_service_id: 1,
      shipping_service: "Нова Пошта — кур'єр",
      shipping_address_city: values.deliveryCity?.trim(),
      shipping_secondary_line: values.deliveryAddress?.trim(),
    };
  }

  return {
    delivery_service_id: 1,
    shipping_service: "Нова Пошта — відділення",
    shipping_address_city: values.deliveryCity?.trim(),
    shipping_receive_point: values.deliveryBranchNumber?.trim(),
  };
}

function mapProducts(items: CartItem[]) {
  return items.map((item) => {
    const product: {
      price: number;
      quantity: number;
      name: string;
      sku?: string;
    } = {
      price: item.unitPriceUah,
      quantity: item.quantity,
      name: formatCartItemCrmName(item),
    };

    const sku = item.sku ?? (item.itemType !== "build" ? item.slug : undefined);
    if (sku) {
      product.sku = sku;
    }

    return product;
  });
}

export function buildKeyCrmOrderPayload(params: {
  orderNumber: string;
  orderDate: Date;
  values: OrderFormValues;
  cartItems: CartItem[];
  promoForOrder: PromoApplication | null;
  payableTotal: number;
}) {
  const { orderNumber, orderDate, values, cartItems, promoForOrder, payableTotal } =
    params;
  const orderedAt = orderDate.toISOString().slice(0, 19).replace("T", " ");
  const basePayload = {
    source_id: KEYCRM_SOURCE_ID,
    source_uuid: orderNumber,
    orderedAt,
    promocode: promoForOrder?.promo.code,
    buyer_comment: values.customerComment?.trim() || undefined,
    buyer: {
      full_name: values.customerName.trim(),
      phone: values.customerPhone.trim(),
      email: values.customerEmail.trim(),
    },
    shipping: mapDelivery(values.deliveryMethod, values),
    products: mapProducts(cartItems),
  };

  if (values.paymentMethod === "monopay") {
    return basePayload;
  }

  return {
    ...basePayload,
    payments: [
      {
        ...mapPayment(values.paymentMethod),
        amount: payableTotal,
        status: "not_paid",
      },
    ],
  };
}

export async function sendOrderToKeyCrm(payload: unknown): Promise<void> {
  const res = await fetch("/api/keycrm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(
      `[keycrm/client] ${res.status} ${JSON.stringify(error ?? "unknown error")}`,
    );
  }
}
