/**
 * Stub Nova Poshta cities until we wire the real API.
 * Structure mirrors what real autocomplete returns.
 */
export interface NpCity {
  ref: string;
  name: string;
  region: string;
  branchCount: number;
}

export interface NpBranch {
  ref: string;
  number: string;
  address: string;
}

export const NP_CITIES: NpCity[] = [
  { ref: "8d5a980d-kyiv", name: "Київ", region: "Київська область", branchCount: 420 },
  { ref: "db5c88d0-lviv", name: "Львів", region: "Львівська область", branchCount: 180 },
  { ref: "db5c88f0-kharkiv", name: "Харків", region: "Харківська область", branchCount: 160 },
  { ref: "db5c88e0-odesa", name: "Одеса", region: "Одеська область", branchCount: 180 },
  { ref: "db5c88a0-dnipro", name: "Дніпро", region: "Дніпропетровська область", branchCount: 140 },
  { ref: "db5c88b0-zaporizhzhia", name: "Запоріжжя", region: "Запорізька область", branchCount: 90 },
  { ref: "db5c88c0-vinnytsia", name: "Вінниця", region: "Вінницька область", branchCount: 70 },
  { ref: "db5c88d1-ivano-frankivsk", name: "Івано-Франківськ", region: "Івано-Франківська область", branchCount: 55 },
  { ref: "db5c88d2-ternopil", name: "Тернопіль", region: "Тернопільська область", branchCount: 40 },
  { ref: "db5c88d3-rivne", name: "Рівне", region: "Рівненська область", branchCount: 45 },
  { ref: "db5c88d4-lutsk", name: "Луцьк", region: "Волинська область", branchCount: 40 },
  { ref: "db5c88d5-khmelnytskyi", name: "Хмельницький", region: "Хмельницька область", branchCount: 50 },
  { ref: "db5c88d6-cherkasy", name: "Черкаси", region: "Черкаська область", branchCount: 45 },
  { ref: "db5c88d7-poltava", name: "Полтава", region: "Полтавська область", branchCount: 55 },
  { ref: "db5c88d8-sumy", name: "Суми", region: "Сумська область", branchCount: 40 },
  { ref: "db5c88d9-chernihiv", name: "Чернігів", region: "Чернігівська область", branchCount: 40 },
  { ref: "db5c88da-chernivtsi", name: "Чернівці", region: "Чернівецька область", branchCount: 35 },
  { ref: "db5c88db-uzhhorod", name: "Ужгород", region: "Закарпатська область", branchCount: 30 },
  { ref: "db5c88dc-mykolaiv", name: "Миколаїв", region: "Миколаївська область", branchCount: 70 },
  { ref: "db5c88dd-kropyvnytskyi", name: "Кропивницький", region: "Кіровоградська область", branchCount: 40 },
  { ref: "db5c88de-zhytomyr", name: "Житомир", region: "Житомирська область", branchCount: 50 },
];

export function searchCities(query: string, limit = 8): NpCity[] {
  const q = query.trim().toLowerCase();
  if (q.length < 1) return [];
  return NP_CITIES
    .filter((c) => c.name.toLowerCase().startsWith(q))
    .slice(0, limit);
}

export function branchesFor(cityRef: string): NpBranch[] {
  const city = NP_CITIES.find((c) => c.ref === cityRef);
  if (!city) return [];
  const sample = Math.min(city.branchCount, 12);
  return Array.from({ length: sample }).map((_, i) => ({
    ref: `${cityRef}-br-${i + 1}`,
    number: String(i + 1),
    address: `Відділення №${i + 1} · ${city.name}`,
  }));
}
