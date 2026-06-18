const KEYCRM_API_URL = "https://openapi.keycrm.app/v1";

function getKeyCrmApiKey(): string {
  const apiKey = process.env.KEY_CRM_API_KEY;
  if (!apiKey) {
    throw new Error("KEY_CRM_API_KEY не визначено в середовищі");
  }
  return apiKey;
}

export async function createKeyCrmOrder(payload: unknown) {
  const response = await fetch(`${KEYCRM_API_URL}/order`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getKeyCrmApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      `[keycrm/create-order] ${response.status} ${JSON.stringify(data)}`,
    );
  }

  return data;
}

export async function markKeyCrmOrderAsPaid(
  orderReference: string,
  amountUah: number,
) {
  const orderSearchResponse = await fetch(
    `${KEYCRM_API_URL}/order?source_uuid=${encodeURIComponent(orderReference)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getKeyCrmApiKey()}`,
        "Content-Type": "application/json",
      },
    },
  );

  const orderSearchData = await orderSearchResponse.json().catch(() => null);
  if (!orderSearchResponse.ok) {
    throw new Error(
      `[keycrm/find-order] ${orderSearchResponse.status} ${JSON.stringify(orderSearchData)}`,
    );
  }

  const orderId =
    orderSearchData &&
    typeof orderSearchData === "object" &&
    Array.isArray((orderSearchData as { data?: unknown[] }).data) &&
    (orderSearchData as { data: Array<{ id?: number }> }).data[0]?.id;

  if (!orderId) {
    throw new Error(
      `[keycrm/find-order] Order not found by source_uuid=${orderReference}`,
    );
  }

  const now = new Date();
  now.setHours(now.getHours() + 3);
  const paymentDate = now.toISOString().slice(0, 19).replace("T", " ");

  const response = await fetch(`${KEYCRM_API_URL}/order/${orderId}/payment`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getKeyCrmApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      payment_method: "MonoPay",
      amount: amountUah,
      status: "paid",
      description: "Оплата через MonoPay",
      payment_date: paymentDate,
    }),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      `[keycrm/mark-paid] ${response.status} ${JSON.stringify(data)}`,
    );
  }

  return data;
}
