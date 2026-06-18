/**
 * Locks document scroll without padding-right compensation.
 * Pair with `scrollbar-gutter: stable` on <html> (see globals.css) so the
 * layout does not jump when the native scrollbar is suppressed.
 */
let lockCount = 0;
let savedHtmlOverflow = "";
let savedBodyOverflow = "";

export function lockBodyScroll(): () => void {
  lockCount += 1;
  if (lockCount === 1) {
    const { documentElement: html, body } = document;
    savedHtmlOverflow = html.style.overflow;
    savedBodyOverflow = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
  }

  return () => {
    lockCount = Math.max(0, lockCount - 1);
    if (lockCount === 0) {
      document.documentElement.style.overflow = savedHtmlOverflow;
      document.body.style.overflow = savedBodyOverflow;
    }
  };
}
