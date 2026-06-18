import { NextRequest, NextResponse } from "next/server";

import {
  calculatePromoApplication,
  normalizePromoCodeInput,
  promoInactiveMessage,
} from "@/lib/promoCode";
import type { PromoCartLine } from "@/lib/promoCode/types";
import { fetchPromoCodeByCode } from "@/lib/sanity/promoCodeFetcher";

type ValidateBody = {
  code?: string;
  items?: PromoCartLine[];
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ValidateBody;
    const code = normalizePromoCodeInput(body.code ?? "");
    const items = Array.isArray(body.items) ? body.items : [];

    if (!code) {
      return NextResponse.json(
        { error: "Введіть промокод" },
        { status: 400 },
      );
    }

    if (items.length === 0) {
      return NextResponse.json(
        { error: "Кошик порожній" },
        { status: 400 },
      );
    }

    const promo = await fetchPromoCodeByCode(code);
    if (!promo) {
      return NextResponse.json(
        { error: "Промокод не знайдено" },
        { status: 404 },
      );
    }

    const inactive = promoInactiveMessage(promo);
    if (inactive) {
      return NextResponse.json({ error: inactive }, { status: 400 });
    }

    const application = calculatePromoApplication(items, promo);

    return NextResponse.json({ application });
  } catch (error) {
    console.error("[promo/validate]", error);
    return NextResponse.json(
      { error: "Не вдалося перевірити промокод" },
      { status: 500 },
    );
  }
}
