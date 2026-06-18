import type { Review } from "@/types/build";

const REVIEW_IMAGE = "/images/home/reviews/review.webp";

export const REVIEWS: Review[] = [
  {
    authorName: "Олександр К.",
    imageUrl: REVIEW_IMAGE,
    rating: 5,
    text: "Замовив VEGA для сина. Зібрали за 3 дні, прийшло у подвійній коробці. Син задоволений, CS2 йде стабільно 300+ FPS. Менеджер у Telegram відповідав терпляче на всі питання.",
    sourcePlatform: "google",
    relatedBuildSlug: "vega",
    isVerified: true,
  },
  {
    authorName: "Ігор К.",
    imageUrl: REVIEW_IMAGE,
    rating: 5,
    text: "Замовив VEGA для сина. Зібрали за 3 дні, прийшло у подвійній коробці. Син задоволений, CS2 йде стабільно 300+ FPS. Менеджер у Telegram відповідав терпляче на всі питання.",
    sourcePlatform: "google",
    relatedBuildSlug: "vega",
    isVerified: true,
  },
  {
    authorName: "Костянтин П.",
    imageUrl: REVIEW_IMAGE,
    rating: 5,
    text: "Замовив VEGA для сина. Зібрали за 3 дні, прийшло у подвійній коробці. Син задоволений, CS2 йде стабільно 300+ FPS. Менеджер у Telegram відповідав терпляче на всі питання.",
    sourcePlatform: "google",
    relatedBuildSlug: "vega",
    isVerified: true,
  },
  {
    authorName: "Дмитро Ш.",
    imageUrl: REVIEW_IMAGE,
    rating: 5,
    text: "Брав ORBITRA для стрімінгу. У Warzone тримає 100+ FPS у 4K з увімкненим OBS. Підсвітка корпусу класна. Доставка НП з Києва за добу. Рекомендую.",
    sourcePlatform: "google",
    relatedBuildSlug: "orbitra",
    isVerified: true,
  },
  {
    authorName: "Катерина М.",
    imageUrl: REVIEW_IMAGE,
    rating: 5,
    text: "Перший ПК в житті. NEBULA виглядає в кімнаті ідеально, а головне — усе працює прям з коробки. Windows, всі драйвери, навіть Discord налаштований. Дуже задоволена.",
    sourcePlatform: "instagram",
    relatedBuildSlug: "nebula",
    isVerified: true,
  },
  {
    authorName: "Ігор Л.",
    imageUrl: REVIEW_IMAGE,
    rating: 5,
    text: "HYPER для школяра. Бюджетно, але в CS2 280+ FPS, Dota 2 без лагів. Через місяць прокинулась помилка з пам'яттю — замінили по гарантії за 4 дні.",
    sourcePlatform: "google",
    relatedBuildSlug: "hyper",
    isVerified: true,
  },
  {
    authorName: "Тарас Б.",
    imageUrl: REVIEW_IMAGE,
    rating: 5,
    text: "VELAR на RX 9070 XT — звір. 4K ультра в Cyberpunk, OBS стріму не вбиває. За таку ціну це реально топ. Менеджер узгодив всі деталі до оплати.",
    sourcePlatform: "google",
    relatedBuildSlug: "velar",
    isVerified: true,
  },
  {
    authorName: "Марія Д.",
    imageUrl: REVIEW_IMAGE,
    rating: 5,
    text: "Брала NYX для доньки — хочеться, щоб без проблем тягнуло Fortnite і Minecraft. Тягне. Відео збірки прислали, коробка в порядку.",
    sourcePlatform: "google",
    relatedBuildSlug: "nyx",
    isVerified: true,
  },
];

export function reviewsForBuild(slug: string, limit = 3): Review[] {
  return REVIEWS.filter((r) => r.relatedBuildSlug === slug).slice(0, limit);
}
