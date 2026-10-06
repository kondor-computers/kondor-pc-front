const TTCLID_COOKIE = "kondor_ttclid";
const FBC_COOKIE = "kondor_fbc";
const COOKIE_DAYS = 30;

export type TrackingContext = {
  fbp?: string;
  fbc?: string;
  ttp?: string;
  ttclid?: string;
  eventSourceUrl: string;
};

function getCookie(name: string): string | undefined {
  const match = document.cookie
    .split("; ")
    .find((part) => part.startsWith(`${name}=`));
  if (!match) return undefined;
  try {
    return decodeURIComponent(match.slice(name.length + 1));
  } catch {
    return undefined;
  }
}

function setCookie(name: string, value: string): void {
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie =
    `${name}=${encodeURIComponent(value)}; Max-Age=${COOKIE_DAYS * 86400}` +
    `; Path=/; SameSite=Lax${secure}`;
}

/**
 * Зберігає `ttclid` і `fbclid` з URL у first-party cookie, щоб вони дожили
 * до оформлення замовлення. Meta Pixel сам ставить `_fbc`, але лише коли
 * встиг завантажитись; `kondor_fbc` — запасний варіант у форматі `_fbc`.
 */
export function captureClickIds(): void {
  try {
    const params = new URLSearchParams(location.search);

    const ttclid = params.get("ttclid");
    if (ttclid) setCookie(TTCLID_COOKIE, ttclid);

    const fbclid = params.get("fbclid");
    if (fbclid && !getCookie(FBC_COOKIE)) {
      setCookie(FBC_COOKIE, `fb.1.${Date.now()}.${fbclid}`);
    }
  } catch {
    // cookie недоступні — просто не зберігаємо
  }
}

export function readTrackingContext(): TrackingContext {
  try {
    return {
      fbp: getCookie("_fbp"),
      fbc: getCookie("_fbc") ?? getCookie(FBC_COOKIE),
      ttp: getCookie("_ttp"),
      ttclid: getCookie(TTCLID_COOKIE),
      eventSourceUrl: location.href,
    };
  } catch {
    return { eventSourceUrl: location.href };
  }
}
