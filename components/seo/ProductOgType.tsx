/**
 * Open Graph `og:type` = `product` for product card pages.
 *
 * Next.js's typed `openGraph.type` does not include `product` (and its renderer
 * throws on unknown types), so we cannot set it through the Metadata API.
 * Instead the page's metadata omits `og:type` entirely and renders this tag,
 * which React 19 hoists into `<head>` with the correct `property` attribute.
 */
export function ProductOgType() {
  return <meta property="og:type" content="product" />;
}
