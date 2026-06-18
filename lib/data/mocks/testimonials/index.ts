import type { Testimonial } from "../../types/testimonial";

export const oleksandr: Testimonial = {
  id: "oleksandr-k-vega",
  author: "Олександр К.",
  source: "google_maps",
  verified: true,
  body: "Замовив VEGA для сина. Зібрали за 3 дні, прийшло у подвійній коробці. Син задоволений, CS2 йде стабільно 300+ FPS. Менеджер у Telegram відповідав терпляче на всі питання.",
  buildSlug: "vega",
  gameTags: ["cs2"],
};

export const dmytro: Testimonial = {
  id: "dmytro-r-nebula",
  author: "Дмитро Р.",
  source: "telegram",
  verified: true,
  body: "Брав NEBULA під CS2 та стрім. У 1440p тримає 380 FPS у Mirage, OBS у фоні не лагає. Тести FPS прислали відео — це підкуповує. Рекомендую.",
  buildSlug: "nebula",
  gameTags: ["cs2"],
};

export const allTestimonials: Testimonial[] = [oleksandr, dmytro];
