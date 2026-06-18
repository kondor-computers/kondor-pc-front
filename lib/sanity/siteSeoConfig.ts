/**
 * Site-wide SEO singletons from kondor-pc-admin (`siteSeoPages.ts`).
 * Each entry maps a Sanity document _id → route + frontend fallbacks.
 */
export const SITE_SEO_PAGE_IDS = [
  "seoHomePage",
  "seoPickerPage",
  "seoPickerResultPage",
  "seoCustomBuildPage",
  "seoPcCatalogPage",
  "seoAccessoriesPage",
  "seoDeliveryPaymentPage",
  "seoWarrantyPage",
  "seoContactsPage",
  "seoPublicOfferPage",
  "seoPrivacyPolicyPage",
  "seoRequisitesPage",
  "seoCheckoutPage",
  "seoOrderSuccessPage",
] as const;

export type SiteSeoPageId = (typeof SITE_SEO_PAGE_IDS)[number];

export type SiteSeoPageConfig = {
  path: string;
  defaultTitle: string;
  defaultDescription: string;
};

export const SITE_SEO_CONFIG: Record<SiteSeoPageId, SiteSeoPageConfig> = {
  seoHomePage: {
    path: "/",
    defaultTitle: "Ігрові ПК під замовлення",
    defaultDescription:
      "Готові ігрові ПК з реальними FPS, гарантією та доставкою Новою Поштою. Підбір під твої ігри та бюджет.",
  },
  seoPickerPage: {
    path: "/pidbir",
    defaultTitle: "Підбір ПК за 30 секунд",
    defaultDescription:
      "Обери свої ігри та бюджет — покажемо 3–5 підходящих збірок з реальними FPS.",
  },
  seoPickerResultPage: {
    path: "/pidbir/rezultat",
    defaultTitle: "Результат підбору",
    defaultDescription:
      "Підібрані ігрові ПК під твій бюджет та ігри — реальні FPS, гарантія та доставка НП.",
  },
  seoCustomBuildPage: {
    path: "/sborka",
    defaultTitle: "Кастомна збірка ПК під замовлення",
    defaultDescription:
      "Зберемо ПК під твої задачі та бюджет. Менеджер зв'яжеться за 2 години у робочий час.",
  },
  seoPcCatalogPage: {
    path: "/pk",
    defaultTitle: "Каталог ігрових ПК",
    defaultDescription:
      "Каталог ігрових ПК у Києві: перевірені збірки від 20 000 до 200 000 ₴.",
  },
  seoAccessoriesPage: {
    path: "/catalog",
    defaultTitle: "Каталог аксесуарів — клавіатури, миші, поверхні",
    defaultDescription:
      "Ігрові клавіатури, миші, ігрові поверхні, комплекти кейкапів. Доставка НП, гарантія 12 міс.",
  },
  seoDeliveryPaymentPage: {
    path: "/dostavka-oplata",
    defaultTitle: "Доставка та оплата",
    defaultDescription:
      "Безкоштовна доставка Новою Поштою по Україні. Оплата: карта, MonoPay, IBAN, крипто, накладений платіж.",
    // Повний опис (з частинами): карта, MonoPay, частинами, IBAN, крипто, накладений платіж.
  },
  seoWarrantyPage: {
    path: "/garantiya",
    defaultTitle: "Гарантія на ігрові ПК до 3 років",
    defaultDescription:
      "Офіційна гарантія 12 місяців + гарантія виробника на кожен компонент до 3 років. Безкоштовне повернення Новою Поштою при поломці.",
  },
  seoContactsPage: {
    path: "/kontakty",
    defaultTitle: "Контакти",
    defaultDescription:
      "Шоурум у Києві, Telegram, email, телефон. Щодня з 9:00 до 21:00. Ігрові ПК з гарантією до 3 років.",
  },
  seoPublicOfferPage: {
    path: "/legal/publichna-oferta",
    defaultTitle: "Публічна оферта",
    defaultDescription:
      "Публічна оферта Kondor PC — умови купівлі-продажу ігрових ПК та супутніх послуг.",
  },
  seoPrivacyPolicyPage: {
    path: "/legal/politika-konfidentsiynosti",
    defaultTitle: "Політика конфіденційності",
    defaultDescription:
      "Як Kondor PC збирає, використовує та захищає персональні дані користувачів сайту.",
  },
  seoRequisitesPage: {
    path: "/legal/pravova-informatsiya",
    defaultTitle: "Реквізити",
    defaultDescription:
      "Юридична інформація та реквізити Kondor PC для оплати та договорів.",
  },
  seoCheckoutPage: {
    path: "/oformlennya",
    defaultTitle: "Оформлення замовлення",
    defaultDescription:
      "Оформи замовлення на ігровий ПК або аксесуари — доставка Новою Поштою, кілька способів оплати.",
  },
  seoOrderSuccessPage: {
    path: "/oformlennya/uspikh",
    defaultTitle: "Замовлення оформлено",
    defaultDescription:
      "Дякуємо за замовлення! Менеджер Kondor PC зв'яжеться з тобою для підтвердження.",
  },
};

/** `/legal/[slug]` → Sanity SEO singleton id. */
export const LEGAL_SEO_BY_SLUG: Record<string, SiteSeoPageId> = {
  "publichna-oferta": "seoPublicOfferPage",
  "politika-konfidentsiynosti": "seoPrivacyPolicyPage",
  "pravova-informatsiya": "seoRequisitesPage",
};
