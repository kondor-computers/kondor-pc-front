import type { Build, BuildComponent, BuildFpsEntry, ConfigGroup } from "@/types/build";

/**
 * Temporary chassis photography — Unsplash placeholders.
 * When the client ships real product PNGs, swap this map for Sanity URLs.
 * Source is abstracted so the component layer never knows where URLs come from.
 */
const UNSPLASH = (id: string) =>
  `https://images.unsplash.com/${id}?w=1200&q=80&auto=format&fit=crop`;

const HERO_PHOTOS: Record<Build["slug"], string> = {
  vega: UNSPLASH("photo-1587202372775-e229f172b9d7"),
  hyper: UNSPLASH("photo-1624705002806-5d72df19c3ad"),
  nebula: UNSPLASH("photo-1591799264318-7e6ef8ddb7ea"),
  orbitra: UNSPLASH("photo-1587831990711-23ca6441447b"),
  nyx: UNSPLASH("photo-1625842268584-8f3296236761"),
  velar: UNSPLASH("photo-1612287230202-1ff1d85d1bdf"),
  pulsar: UNSPLASH("photo-1547082299-de196ea013d6"),
  comet: UNSPLASH("photo-1555680202-c86f0e12f086"),
};

// Gallery pool — 8 verified Unsplash IDs (same set as HERO_PHOTOS).
// Each build gets hero + 2 extra shots cycled from the pool.
const GALLERY_POOL = [
  "photo-1587202372775-e229f172b9d7",
  "photo-1591799264318-7e6ef8ddb7ea",
  "photo-1624705002806-5d72df19c3ad",
  "photo-1547082299-de196ea013d6",
  "photo-1587831990711-23ca6441447b",
  "photo-1625842268584-8f3296236761",
  "photo-1555680202-c86f0e12f086",
  "photo-1612287230202-1ff1d85d1bdf",
];

const MOCK_INCLUDED_BENEFITS = [
  { key: "assembly", title: "Збірка та налаштування" },
  { key: "stress-test", title: "Стрес-тест 4 години" },
  { key: "windows", title: "Windows 11 Home" },
  { key: "office", title: "Базовий офісний пакет" },
  { key: "video-report", title: "Фото- та відеозвіт" },
  { key: "delivery", title: "Безкоштовна доставка" },
  { key: "warranty", title: "Гарантія 12 місяців" },
  { key: "support", title: "Технічна підтримка" },
  { key: "consult", title: "Безкоштовна консультація" },
  { key: "return", title: "Повернення 14 днів" },
];

function cmp(c: BuildComponent): BuildComponent {
  return c;
}

function fps(
  gameSlug: string,
  resolution: BuildFpsEntry["resolution"],
  fpsAvg: number,
  opts: Partial<BuildFpsEntry> = {},
): BuildFpsEntry {
  return {
    gameSlug,
    resolution,
    fpsAvg,
    settings: "high",
    verified: true,
    ...opts,
  };
}

export const BUILDS: Build[] = [
  {
    slug: "vega",
    sku: "KPC-VEGA",
    name: "VEGA",
    tier: "base",
    targetResolution: "fullhd",
    colorVariant: "white",
    shortTagline: "Оптимально для Full HD геймінгу",
    priceUah: 34990,
    status: "assemble_on_order",
    assemblyDays: 3,
    spec: {
      cpu: "Ryzen 5 7400F",
      gpu: "RTX 5060",
      gpuVram: "8 GB",
      ram: "32 GB DDR5",
      ramSpeed: "6000",
      storage: "500 GB NVMe",
    },
    components: [
      cmp({ category: "cpu", brand: "AMD", model: "Ryzen 5 7400F", displayName: "AMD Ryzen 5 7400F", humanDescription: "6 ядер, 12 потоків. Достатньо для будь-якої сучасної гри у Full HD.", warrantyMonths: 36 }),
      cmp({ category: "gpu", brand: "NVIDIA", model: "GeForce RTX 5060 8GB", displayName: "NVIDIA GeForce RTX 5060 8GB", humanDescription: "144+ FPS у Full HD на високих налаштуваннях у більшості ігор.", warrantyMonths: 24 }),
      cmp({ category: "ram", brand: "Kingston", model: "FURY DDR5-6000 32GB", displayName: "32 GB DDR5 6000 MHz Kingston FURY", humanDescription: "Швидка пам'ять. 32 ГБ з запасом на Discord, Chrome, стрім.", warrantyMonths: 120 }),
      cmp({ category: "ssd", brand: "Kingston", model: "KC3000 500GB NVMe", displayName: "500 GB NVMe M.2 Kingston KC3000", humanDescription: "Ігри завантажуються за 5–10 секунд.", warrantyMonths: 60 }),
      cmp({ category: "motherboard", brand: "ASUS", model: "PRIME B650M-A", displayName: "ASUS PRIME B650M-A", humanDescription: "З'єднує всі компоненти. Підтримує Wi-Fi 6 та Bluetooth 5.2.", warrantyMonths: 36 }),
      cmp({ category: "cooling", brand: "DeepCool", model: "AK400", displayName: "DeepCool AK400", humanDescription: "Тихе та ефективне повітряне охолодження. До 28 дБ на максимумі.", warrantyMonths: 36 }),
      cmp({ category: "psu", brand: "Chieftec", model: "650W 80+ Bronze", displayName: "Chieftec 650W 80+ Bronze", humanDescription: "Сертифікований БЖ із запасом потужності на апгрейд.", warrantyMonths: 60 }),
      cmp({ category: "case", brand: "Lian Li", model: "LANCOOL 205 Mesh White", displayName: "Lian Li LANCOOL 205 Mesh Білий", humanDescription: "Прозора стінка, RGB-підсвітка, хороша продувка.", warrantyMonths: 24 }),
      cmp({ category: "os", brand: "Microsoft", model: "Windows 11 Home", displayName: "Windows 11 Home", humanDescription: "Ліцензійна, попередньо встановлена, активована.", warrantyMonths: 9999 }),
    ],
    fps: [
      fps("cs2", "fullhd", 380), fps("cs2", "2k", 280), fps("cs2", "4k", 165),
      fps("warzone", "fullhd", 145), fps("warzone", "2k", 110),
      fps("gta5", "fullhd", 140), fps("gta5", "2k", 95), fps("gta5", "4k", 60),
      fps("fortnite", "fullhd", 180), fps("fortnite", "2k", 130),
      fps("dota2", "fullhd", 210), fps("dota2", "2k", 170),
      fps("valorant", "fullhd", 380), fps("valorant", "2k", 280),
      fps("cyberpunk", "fullhd", 85), fps("cyberpunk", "2k", 62), fps("cyberpunk", "4k", 38),
    ],
    powerConsumptionW: 350,
    noiseLevelDb: 28,
    upgradePathNotes: "Вільні M.2 слоти для +2 ТБ NVMe, можна поставити кулер Tower, PSU витримує GPU наступного покоління.",
    includedBenefits: MOCK_INCLUDED_BENEFITS,
  },
  {
    slug: "hyper",
    sku: "KPC-HYPER",
    name: "HYPER",
    tier: "base",
    targetResolution: "fullhd",
    colorVariant: "black",
    shortTagline: "Альтернатива на DDR4 для CS2 та Dota 2",
    priceUah: 31990,
    status: "in_stock",
    assemblyDays: 3,
    spec: {
      cpu: "Ryzen 5 5600",
      gpu: "RTX 5060",
      gpuVram: "8 GB",
      ram: "32 GB DDR4",
      ramSpeed: "3200",
      storage: "500 GB NVMe",
    },
    components: [
      cmp({ category: "cpu", brand: "AMD", model: "Ryzen 5 5600", displayName: "AMD Ryzen 5 5600", humanDescription: "6 ядер, перевірений на роках. Ідеальний для CS2, Dota 2.", warrantyMonths: 36 }),
      cmp({ category: "gpu", brand: "NVIDIA", model: "GeForce RTX 5060 8GB", displayName: "NVIDIA GeForce RTX 5060 8GB", humanDescription: "Стабільні 144+ FPS у Full HD.", warrantyMonths: 24 }),
      cmp({ category: "ram", brand: "Kingston", model: "FURY DDR4-3200 32GB", displayName: "32 GB DDR4 3200 MHz", humanDescription: "32 ГБ DDR4 — більш ніж достатньо для поточних ігор.", warrantyMonths: 120 }),
      cmp({ category: "ssd", brand: "Kingston", model: "NV2 500GB NVMe", displayName: "500 GB NVMe M.2 Kingston", humanDescription: "Швидкий SSD під систему та ігри.", warrantyMonths: 60 }),
      cmp({ category: "motherboard", brand: "MSI", model: "B550M-A PRO", displayName: "MSI B550M-A PRO", humanDescription: "Надійна плата на AM4.", warrantyMonths: 36 }),
      cmp({ category: "cooling", brand: "DeepCool", model: "AK400", displayName: "DeepCool AK400", humanDescription: "Тихе повітряне охолодження.", warrantyMonths: 36 }),
      cmp({ category: "psu", brand: "GameMax", model: "650W 80+ Bronze", displayName: "GameMax 650W 80+ Bronze", humanDescription: "Сертифікований БЖ.", warrantyMonths: 36 }),
      cmp({ category: "case", brand: "GameMax", model: "Black RGB", displayName: "GameMax Black RGB", humanDescription: "Чорний корпус з RGB-підсвіткою.", warrantyMonths: 24 }),
      cmp({ category: "os", brand: "Microsoft", model: "Windows 11 Home", displayName: "Windows 11 Home", humanDescription: "Ліцензійна.", warrantyMonths: 9999 }),
    ],
    fps: [
      fps("cs2", "fullhd", 340), fps("cs2", "2k", 240),
      fps("warzone", "fullhd", 128), fps("warzone", "2k", 95),
      fps("dota2", "fullhd", 210),
      fps("fortnite", "fullhd", 165),
      fps("valorant", "fullhd", 360),
      fps("cyberpunk", "fullhd", 72), fps("cyberpunk", "2k", 50),
      fps("gta5", "fullhd", 120),
    ],
    powerConsumptionW: 340,
    noiseLevelDb: 30,
    upgradePathNotes: "Апгрейд до Ryzen 7 на AM4 без заміни плати. Вільний M.2 слот.",
    includedBenefits: MOCK_INCLUDED_BENEFITS,
  },
  {
    slug: "nebula",
    sku: "KPC-NEBULA",
    name: "NEBULA",
    tier: "prime",
    targetResolution: "2k",
    colorVariant: "white",
    shortTagline: "2K геймінг без компромісів",
    priceUah: 49990,
    oldPriceUah: 54990,
    status: "in_stock",
    assemblyDays: 3,
    spec: {
      cpu: "Ryzen 7 7800X3D",
      gpu: "RTX 5060 Ti",
      gpuVram: "16 GB",
      ram: "32 GB DDR5",
      ramSpeed: "6000",
      storage: "500 GB NVMe",
    },
    components: [
      cmp({ category: "cpu", brand: "AMD", model: "Ryzen 7 7800X3D", displayName: "AMD Ryzen 7 7800X3D", humanDescription: "Топовий ігровий процесор з 3D V-Cache. Лідер у всіх тестах ігор 2026.", warrantyMonths: 36 }),
      cmp({ category: "gpu", brand: "NVIDIA", model: "GeForce RTX 5060 Ti 16GB", displayName: "NVIDIA GeForce RTX 5060 Ti 16GB", humanDescription: "16 ГБ пам'яті з запасом на ігри наступних поколінь у 2K.", warrantyMonths: 24 }),
      cmp({ category: "ram", brand: "Kingston", model: "FURY DDR5-6000 32GB", displayName: "32 GB DDR5 6000 MHz Kingston FURY", humanDescription: "Швидка DDR5 для X3D процесора.", warrantyMonths: 120 }),
      cmp({ category: "ssd", brand: "Kingston", model: "KC3000 500GB NVMe", displayName: "500 GB NVMe Kingston KC3000", humanDescription: "Топовий NVMe SSD.", warrantyMonths: 60 }),
      cmp({ category: "motherboard", brand: "ASUS", model: "TUF B650-PLUS WIFI", displayName: "ASUS TUF B650-PLUS WIFI", humanDescription: "Потужна плата з Wi-Fi 6E.", warrantyMonths: 36 }),
      cmp({ category: "cooling", brand: "DeepCool", model: "AK620", displayName: "DeepCool AK620", humanDescription: "Двовежеве повітряне охолодження для X3D.", warrantyMonths: 36 }),
      cmp({ category: "psu", brand: "Chieftec", model: "750W 80+ Gold", displayName: "Chieftec 750W 80+ Gold", humanDescription: "Gold-сертифікований БЖ.", warrantyMonths: 60 }),
      cmp({ category: "case", brand: "Lian Li", model: "O11 Dynamic Mini White", displayName: "Lian Li O11 Dynamic Mini White", humanDescription: "Преміальний корпус з подвійними скляними панелями.", warrantyMonths: 24 }),
      cmp({ category: "os", brand: "Microsoft", model: "Windows 11 Home", displayName: "Windows 11 Home", humanDescription: "Ліцензійна.", warrantyMonths: 9999 }),
    ],
    fps: [
      fps("cs2", "fullhd", 420), fps("cs2", "2k", 380), fps("cs2", "4k", 240),
      fps("warzone", "fullhd", 180), fps("warzone", "2k", 130), fps("warzone", "4k", 78),
      fps("gta5", "fullhd", 165), fps("gta5", "2k", 110), fps("gta5", "4k", 68),
      fps("fortnite", "fullhd", 220), fps("fortnite", "2k", 165), fps("fortnite", "4k", 95),
      fps("dota2", "fullhd", 260), fps("dota2", "2k", 200),
      fps("valorant", "fullhd", 420), fps("valorant", "2k", 340),
      fps("cyberpunk", "fullhd", 110), fps("cyberpunk", "2k", 75), fps("cyberpunk", "4k", 42),
    ],
    powerConsumptionW: 450,
    noiseLevelDb: 32,
    upgradePathNotes: "Плата тримає Ryzen 9 7950X3D без заміни. Легко +NVMe до 4 ТБ.",
    includedBenefits: MOCK_INCLUDED_BENEFITS,
  },
  {
    slug: "orbitra",
    sku: "KPC-ORBITRA",
    name: "ORBITRA",
    tier: "phantom",
    targetResolution: "4k",
    colorVariant: "black",
    shortTagline: "4K геймінг та стрімінг",
    priceUah: 89990,
    status: "assemble_on_order",
    assemblyDays: 5,
    spec: {
      cpu: "Ryzen 7 9800X3D",
      gpu: "RTX 5070 Ti",
      gpuVram: "16 GB",
      ram: "32 GB DDR5",
      ramSpeed: "6000",
      storage: "1 TB NVMe",
    },
    components: [
      cmp({ category: "cpu", brand: "AMD", model: "Ryzen 7 9800X3D", displayName: "AMD Ryzen 7 9800X3D", humanDescription: "Найпотужніший ігровий CPU. X3D-cache наступного покоління.", warrantyMonths: 36 }),
      cmp({ category: "gpu", brand: "NVIDIA", model: "GeForce RTX 5070 Ti 16GB", displayName: "NVIDIA GeForce RTX 5070 Ti 16GB", humanDescription: "Комфортний 4K геймінг та 1440p60 стрім одночасно.", warrantyMonths: 24 }),
      cmp({ category: "ram", brand: "Kingston", model: "FURY DDR5-6000 32GB", displayName: "32 GB DDR5 6000 MHz Kingston FURY", humanDescription: "Швидка DDR5.", warrantyMonths: 120 }),
      cmp({ category: "ssd", brand: "Kingston", model: "KC3000 1TB NVMe", displayName: "1 TB NVMe Kingston KC3000", humanDescription: "Вистачить на 30+ сучасних ігор.", warrantyMonths: 60 }),
      cmp({ category: "motherboard", brand: "ASUS", model: "ROG STRIX X670E-F", displayName: "ASUS ROG STRIX X670E-F", humanDescription: "Топова плата для X3D.", warrantyMonths: 36 }),
      cmp({ category: "cooling", brand: "NZXT", model: "Kraken X63 AIO", displayName: "NZXT Kraken X63 (рідинне)", humanDescription: "Рідинне охолодження 280 мм.", warrantyMonths: 72 }),
      cmp({ category: "psu", brand: "be quiet!", model: "Pure Power 850W Gold", displayName: "be quiet! Pure Power 850W 80+ Gold", humanDescription: "Gold-сертифікований, тихий.", warrantyMonths: 60 }),
      cmp({ category: "case", brand: "Lian Li", model: "LANCOOL III RGB", displayName: "Lian Li LANCOOL III RGB", humanDescription: "Просторий корпус з RGB-підсвіткою.", warrantyMonths: 24 }),
      cmp({ category: "os", brand: "Microsoft", model: "Windows 11 Home", displayName: "Windows 11 Home", humanDescription: "Ліцензійна.", warrantyMonths: 9999 }),
    ],
    fps: [
      fps("cs2", "fullhd", 500), fps("cs2", "2k", 420), fps("cs2", "4k", 240),
      fps("warzone", "fullhd", 240), fps("warzone", "2k", 165), fps("warzone", "4k", 100),
      fps("gta5", "fullhd", 200), fps("gta5", "2k", 145), fps("gta5", "4k", 85),
      fps("fortnite", "fullhd", 260), fps("fortnite", "2k", 210), fps("fortnite", "4k", 130),
      fps("dota2", "fullhd", 290), fps("dota2", "2k", 240), fps("dota2", "4k", 160),
      fps("valorant", "fullhd", 500), fps("valorant", "2k", 420), fps("valorant", "4k", 260),
      fps("cyberpunk", "fullhd", 160), fps("cyberpunk", "2k", 110), fps("cyberpunk", "4k", 60, { notes: "Ray Tracing Medium" }),
    ],
    powerConsumptionW: 620,
    noiseLevelDb: 34,
    upgradePathNotes: "Платформа AM5 тримає всі наступні X3D. БЖ з запасом на RTX 5080.",
    includedBenefits: MOCK_INCLUDED_BENEFITS,
  },
  {
    slug: "nyx",
    sku: "KPC-NYX",
    name: "NYX",
    tier: "starter",
    targetResolution: "fullhd",
    colorVariant: "white",
    shortTagline: "Найдоступніший ПК для CS2 та Dota 2",
    priceUah: 26990,
    status: "in_stock",
    assemblyDays: 3,
    spec: {
      cpu: "Ryzen 7 5700X",
      gpu: "RX 6800 XT",
      gpuVram: "16 GB",
      ram: "16 GB DDR4",
      ramSpeed: "3200",
      storage: "500 GB NVMe",
    },
    components: [
      cmp({ category: "cpu", brand: "AMD", model: "Ryzen 7 5700X", displayName: "AMD Ryzen 7 5700X", humanDescription: "8 ядер на AM4. Надійний і бюджетний.", warrantyMonths: 36 }),
      cmp({ category: "gpu", brand: "AMD", model: "Radeon RX 6800 XT 16GB", displayName: "AMD Radeon RX 6800 XT 16GB", humanDescription: "16 ГБ VRAM — рідкість у цьому бюджеті.", warrantyMonths: 24 }),
      cmp({ category: "ram", brand: "Kingston", model: "FURY DDR4-3200 16GB", displayName: "16 GB DDR4 3200 MHz", humanDescription: "16 ГБ — базовий комфорт для ігор.", warrantyMonths: 120 }),
      cmp({ category: "ssd", brand: "Kingston", model: "NV2 500GB NVMe", displayName: "500 GB NVMe M.2", humanDescription: "Швидкий SSD.", warrantyMonths: 60 }),
      cmp({ category: "motherboard", brand: "MSI", model: "B450M-A PRO MAX", displayName: "MSI B450M-A PRO MAX", humanDescription: "Бюджетна плата AM4.", warrantyMonths: 36 }),
      cmp({ category: "cooling", brand: "ID-COOLING", model: "SE-214-XT", displayName: "ID-COOLING SE-214-XT", humanDescription: "Тихе повітряне охолодження.", warrantyMonths: 36 }),
      cmp({ category: "psu", brand: "GameMax", model: "650W Bronze", displayName: "GameMax 650W Bronze", humanDescription: "Сертифікований БЖ.", warrantyMonths: 36 }),
      cmp({ category: "case", brand: "1stPlayer", model: "DK-3 White", displayName: "1stPlayer DK-3 White", humanDescription: "Білий корпус з RGB.", warrantyMonths: 24 }),
      cmp({ category: "os", brand: "Microsoft", model: "Windows 11 Home", displayName: "Windows 11 Home", humanDescription: "Ліцензійна.", warrantyMonths: 9999 }),
    ],
    fps: [
      fps("cs2", "fullhd", 310), fps("warzone", "fullhd", 115), fps("dota2", "fullhd", 190),
      fps("fortnite", "fullhd", 155), fps("valorant", "fullhd", 330),
      fps("gta5", "fullhd", 115), fps("cyberpunk", "fullhd", 78),
    ],
    powerConsumptionW: 380,
    noiseLevelDb: 32,
    upgradePathNotes: "Можна додати +16 ГБ RAM, +NVMe 1 ТБ.",
    includedBenefits: MOCK_INCLUDED_BENEFITS,
  },
  {
    slug: "velar",
    sku: "KPC-VELAR",
    name: "VELAR",
    tier: "pulsar",
    targetResolution: "4k",
    colorVariant: "black",
    shortTagline: "Флагман на AMD",
    priceUah: 109990,
    status: "assemble_on_order",
    assemblyDays: 7,
    spec: {
      cpu: "Ryzen 7 9700X",
      gpu: "RX 9070 XT",
      gpuVram: "16 GB",
      ram: "32 GB DDR5",
      ramSpeed: "6000",
      storage: "500 GB NVMe",
    },
    components: [
      cmp({ category: "cpu", brand: "AMD", model: "Ryzen 7 9700X", displayName: "AMD Ryzen 7 9700X", humanDescription: "Нове покоління Zen 5, 8 ядер / 16 потоків.", warrantyMonths: 36 }),
      cmp({ category: "gpu", brand: "AMD", model: "Radeon RX 9070 XT 16GB", displayName: "AMD Radeon RX 9070 XT 16GB", humanDescription: "Флагманська AMD GPU з FSR 4.", warrantyMonths: 24 }),
      cmp({ category: "ram", brand: "Kingston", model: "FURY DDR5-6000 32GB", displayName: "32 GB DDR5 6000 MHz", humanDescription: "Швидка DDR5.", warrantyMonths: 120 }),
      cmp({ category: "ssd", brand: "Kingston", model: "KC3000 500GB NVMe", displayName: "500 GB NVMe Kingston KC3000", humanDescription: "Топовий NVMe.", warrantyMonths: 60 }),
      cmp({ category: "motherboard", brand: "ASUS", model: "ROG STRIX X670E-E", displayName: "ASUS ROG STRIX X670E-E", humanDescription: "Топова плата AM5.", warrantyMonths: 36 }),
      cmp({ category: "cooling", brand: "Arctic", model: "Liquid Freezer III 360", displayName: "Arctic Liquid Freezer III 360", humanDescription: "Рідинне охолодження 360 мм.", warrantyMonths: 72 }),
      cmp({ category: "psu", brand: "be quiet!", model: "Pure Power 850W Gold", displayName: "be quiet! Pure Power 850W Gold", humanDescription: "Gold-сертифікований.", warrantyMonths: 60 }),
      cmp({ category: "case", brand: "Lian Li", model: "O11 Dynamic EVO", displayName: "Lian Li O11 Dynamic EVO", humanDescription: "Преміальний dual-chamber корпус.", warrantyMonths: 24 }),
      cmp({ category: "os", brand: "Microsoft", model: "Windows 11 Home", displayName: "Windows 11 Home", humanDescription: "Ліцензійна.", warrantyMonths: 9999 }),
    ],
    fps: [
      fps("cs2", "fullhd", 480), fps("cs2", "2k", 400), fps("cs2", "4k", 220),
      fps("warzone", "fullhd", 230), fps("warzone", "2k", 160), fps("warzone", "4k", 95),
      fps("gta5", "4k", 80),
      fps("fortnite", "4k", 120),
      fps("cyberpunk", "fullhd", 150), fps("cyberpunk", "2k", 105), fps("cyberpunk", "4k", 70),
    ],
    powerConsumptionW: 620,
    noiseLevelDb: 33,
    upgradePathNotes: "AM5 до Ryzen 9 9950X. БЖ тримає топові GPU.",
    includedBenefits: MOCK_INCLUDED_BENEFITS,
  },
  {
    slug: "pulsar",
    sku: "KPC-PULSAR",
    name: "PULSAR",
    tier: "phantom",
    targetResolution: "2k",
    colorVariant: "black",
    shortTagline: "Для стрімінгу та контент-мейкінгу",
    priceUah: 74990,
    status: "assemble_on_order",
    assemblyDays: 5,
    spec: {
      cpu: "Ryzen 9 7900X",
      gpu: "RTX 5070",
      gpuVram: "12 GB",
      ram: "64 GB DDR5",
      ramSpeed: "6000",
      storage: "1 TB NVMe",
    },
    components: [
      cmp({ category: "cpu", brand: "AMD", model: "Ryzen 9 7900X", displayName: "AMD Ryzen 9 7900X", humanDescription: "12 ядер для OBS та багатопоточних задач.", warrantyMonths: 36 }),
      cmp({ category: "gpu", brand: "NVIDIA", model: "GeForce RTX 5070 12GB", displayName: "NVIDIA GeForce RTX 5070 12GB", humanDescription: "NVENC AV1 для стрімінгу без втрат FPS.", warrantyMonths: 24 }),
      cmp({ category: "ram", brand: "Kingston", model: "FURY DDR5-6000 64GB", displayName: "64 GB DDR5 6000 MHz", humanDescription: "64 ГБ для Chrome + OBS + Discord + гра одночасно.", warrantyMonths: 120 }),
      cmp({ category: "ssd", brand: "Kingston", model: "KC3000 1TB NVMe", displayName: "1 TB NVMe Kingston KC3000", humanDescription: "Швидкий NVMe для запису стріму локально.", warrantyMonths: 60 }),
      cmp({ category: "motherboard", brand: "ASUS", model: "TUF X670E-PLUS", displayName: "ASUS TUF X670E-PLUS", humanDescription: "Надійна плата X670E.", warrantyMonths: 36 }),
      cmp({ category: "cooling", brand: "Noctua", model: "NH-D15", displayName: "Noctua NH-D15", humanDescription: "Легенда тихого повітряного охолодження.", warrantyMonths: 72 }),
      cmp({ category: "psu", brand: "be quiet!", model: "Pure Power 850W Gold", displayName: "be quiet! Pure Power 850W Gold", humanDescription: "Gold-сертифікований.", warrantyMonths: 60 }),
      cmp({ category: "case", brand: "Lian Li", model: "LANCOOL III", displayName: "Lian Li LANCOOL III", humanDescription: "Просторий чорний корпус.", warrantyMonths: 24 }),
      cmp({ category: "os", brand: "Microsoft", model: "Windows 11 Home", displayName: "Windows 11 Home", humanDescription: "Ліцензійна.", warrantyMonths: 9999 }),
    ],
    fps: [
      fps("cs2", "fullhd", 280, { notes: "+ OBS Full HD 60" }),
      fps("cs2", "2k", 240), fps("cs2", "4k", 180),
      fps("warzone", "2k", 130, { notes: "+ OBS 2K 60" }),
      fps("gta5", "2k", 100), fps("fortnite", "2k", 180),
      fps("cyberpunk", "2k", 90),
    ],
    powerConsumptionW: 560,
    noiseLevelDb: 32,
    upgradePathNotes: "64 ГБ RAM вже з запасом. Можна додати +NVMe 2 ТБ.",
    includedBenefits: MOCK_INCLUDED_BENEFITS,
  },
  {
    slug: "comet",
    sku: "KPC-COMET",
    name: "COMET",
    tier: "starter",
    targetResolution: "fullhd",
    colorVariant: "white",
    shortTagline: "Перший ПК для новачка",
    priceUah: 21990,
    status: "in_stock",
    assemblyDays: 2,
    spec: {
      cpu: "Ryzen 5 5500",
      gpu: "RTX 4060",
      gpuVram: "8 GB",
      ram: "16 GB DDR4",
      ramSpeed: "3200",
      storage: "500 GB NVMe",
    },
    components: [
      cmp({ category: "cpu", brand: "AMD", model: "Ryzen 5 5500", displayName: "AMD Ryzen 5 5500", humanDescription: "6 ядер, стабільна база для ігор.", warrantyMonths: 36 }),
      cmp({ category: "gpu", brand: "NVIDIA", model: "GeForce RTX 4060 8GB", displayName: "NVIDIA GeForce RTX 4060 8GB", humanDescription: "Відмінна стартова GPU для Full HD.", warrantyMonths: 24 }),
      cmp({ category: "ram", brand: "Kingston", model: "FURY DDR4-3200 16GB", displayName: "16 GB DDR4 3200 MHz", humanDescription: "16 ГБ для більшості ігор.", warrantyMonths: 120 }),
      cmp({ category: "ssd", brand: "Kingston", model: "NV2 500GB NVMe", displayName: "500 GB NVMe M.2", humanDescription: "Швидкий SSD.", warrantyMonths: 60 }),
      cmp({ category: "motherboard", brand: "ASUS", model: "PRIME A520M-K", displayName: "ASUS PRIME A520M-K", humanDescription: "Бюджетна плата AM4.", warrantyMonths: 36 }),
      cmp({ category: "cooling", brand: "DeepCool", model: "Gammaxx 400", displayName: "DeepCool Gammaxx 400", humanDescription: "Тихе повітряне охолодження.", warrantyMonths: 36 }),
      cmp({ category: "psu", brand: "Chieftec", model: "500W Bronze", displayName: "Chieftec 500W Bronze", humanDescription: "Сертифікований БЖ.", warrantyMonths: 60 }),
      cmp({ category: "case", brand: "1stPlayer", model: "D4 White", displayName: "1stPlayer D4 White", humanDescription: "Білий корпус з віконцем.", warrantyMonths: 24 }),
      cmp({ category: "os", brand: "Microsoft", model: "Windows 11 Home", displayName: "Windows 11 Home", humanDescription: "Ліцензійна.", warrantyMonths: 9999 }),
    ],
    fps: [
      fps("cs2", "fullhd", 240), fps("fortnite", "fullhd", 140),
      fps("minecraft", "fullhd", 90, { notes: "з шейдерами" }),
      fps("valorant", "fullhd", 280), fps("dota2", "fullhd", 160),
    ],
    powerConsumptionW: 300,
    noiseLevelDb: 28,
    upgradePathNotes: "Можна апгрейдити до Ryzen 7 на AM4, +RAM до 32 ГБ.",
    includedBenefits: MOCK_INCLUDED_BENEFITS,
  },
];

// Attach placeholder hero photography to each build.
// This lives in mock-land; swap for Sanity-derived `heroImageUrl` when CMS is online.
BUILDS.forEach((b, i) => {
  b.heroImageUrl = HERO_PHOTOS[b.slug];
  // Hero + two additional shots cycled from the pool (offsets avoid hero duplicate).
  b.galleryImageUrls = [
    HERO_PHOTOS[b.slug],
    UNSPLASH(GALLERY_POOL[(i + 2) % GALLERY_POOL.length]),
    UNSPLASH(GALLERY_POOL[(i + 5) % GALLERY_POOL.length]),
  ];
});

// Demo assembly videos — real URLs come from Sanity `build.assemblyVideo`.
// VEGA gets Google's public test MP4 so the video slide flow is visible now.
// NEBULA gets a YouTube placeholder to demonstrate the iframe render path.
const VEGA = BUILDS.find((b) => b.slug === "vega");
if (VEGA) {
  VEGA.assemblyVideoUrl =
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
}
const NEBULA = BUILDS.find((b) => b.slug === "nebula");
if (NEBULA) {
  NEBULA.assemblyVideoUrl = "https://www.youtube.com/watch?v=ScMzIvxBSi4";
}

// ──────────────────────────────────────────────────────────────
// Configurable options — extend the base price with RAM / SSD / warranty picks.
// Structure mirrors what we'll emit from Sanity later:
//   build.configurableOptions: configGroup[] where each configGroup has options[].
// UI and cart layer only read from `build.configurableOptions`.
// ──────────────────────────────────────────────────────────────

const WARRANTY_GROUP: ConfigGroup = {
  id: "warranty",
  label: "Гарантія",
  icon: "shield",
  options: [
    { id: "1y", label: "1 рік", description: "включено", priceDelta: 0, isDefault: true },
    { id: "2y", label: "2 роки", description: "захист компонентів", priceDelta: 3500 },
    { id: "3y", label: "3 роки", description: "пріоритет + чистки", priceDelta: 6500 },
  ],
};

const ssdGroup = (defaultId: "500gb" | "1tb" | "2tb"): ConfigGroup => ({
  id: "ssd",
  label: "Накопичувач SSD",
  icon: "hard-drive",
  overridesSpec: "storage",
  options: [
    { id: "500gb", label: "500 GB NVMe", priceDelta: 0, isDefault: defaultId === "500gb" },
    { id: "1tb", label: "1 TB NVMe", priceDelta: 1800, isDefault: defaultId === "1tb" },
    { id: "2tb", label: "2 TB NVMe", priceDelta: 4500, isDefault: defaultId === "2tb" },
    { id: "4tb", label: "4 TB NVMe", priceDelta: 9500 },
  ],
});

const ddr5RamGroup = (defaultId: "32" | "64"): ConfigGroup => ({
  id: "ram",
  label: "Оперативна пам'ять",
  icon: "memory-stick",
  overridesSpec: "ram",
  options: [
    { id: "32", label: "32 GB DDR5", description: "6000 MHz", priceDelta: 0, isDefault: defaultId === "32" },
    { id: "64", label: "64 GB DDR5", description: "6000 MHz", priceDelta: 3000, isDefault: defaultId === "64" },
  ],
});

const ddr4RamGroup: ConfigGroup = {
  id: "ram",
  label: "Оперативна пам'ять",
  icon: "memory-stick",
  overridesSpec: "ram",
  options: [
    { id: "16", label: "16 GB DDR4", description: "3200 MHz", priceDelta: -1200 },
    { id: "32", label: "32 GB DDR4", description: "3200 MHz", priceDelta: 0, isDefault: true },
    { id: "64", label: "64 GB DDR4", description: "3200 MHz", priceDelta: 2200 },
  ],
};

const starterDdr4RamGroup: ConfigGroup = {
  id: "ram",
  label: "Оперативна пам'ять",
  icon: "memory-stick",
  overridesSpec: "ram",
  options: [
    { id: "16", label: "16 GB DDR4", description: "3200 MHz", priceDelta: 0, isDefault: true },
    { id: "32", label: "32 GB DDR4", description: "3200 MHz", priceDelta: 1500 },
  ],
};

const CONFIGURABLE: Record<Build["slug"], ConfigGroup[]> = {
  vega: [
    ddr5RamGroup("32"),
    ssdGroup("500gb"),
    WARRANTY_GROUP,
  ],
  hyper: [
    ddr4RamGroup,
    ssdGroup("500gb"),
    WARRANTY_GROUP,
  ],
  nebula: [
    ddr5RamGroup("32"),
    ssdGroup("500gb"),
    WARRANTY_GROUP,
  ],
  orbitra: [
    ddr5RamGroup("32"),
    ssdGroup("1tb"),
    WARRANTY_GROUP,
  ],
  nyx: [
    starterDdr4RamGroup,
    ssdGroup("500gb"),
    WARRANTY_GROUP,
  ],
  velar: [
    ddr5RamGroup("32"),
    ssdGroup("500gb"),
    WARRANTY_GROUP,
  ],
  pulsar: [
    ssdGroup("1tb"),
    WARRANTY_GROUP,
  ],
  comet: [
    starterDdr4RamGroup,
    ssdGroup("500gb"),
    WARRANTY_GROUP,
  ],
};

BUILDS.forEach((b) => {
  b.configurableOptions = CONFIGURABLE[b.slug];
});

export function buildBySlug(slug: string): Build | undefined {
  return BUILDS.find((b) => b.slug === slug);
}

export function popularBuilds(slugs: Build["slug"][] = ["vega", "nebula", "orbitra"]): Build[] {
  return slugs
    .map((s) => buildBySlug(s))
    .filter((b): b is Build => Boolean(b));
}

export function similarBuilds(currentSlug: string, count = 3): Build[] {
  const current = buildBySlug(currentSlug);
  if (!current) return [];
  const rest = BUILDS.filter((b) => b.slug !== currentSlug);
  rest.sort(
    (a, b) => Math.abs(a.priceUah - current.priceUah) - Math.abs(b.priceUah - current.priceUah),
  );
  return rest.slice(0, count);
}
