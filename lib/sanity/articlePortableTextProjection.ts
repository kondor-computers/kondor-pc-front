/**
 * GROQ projection for article-style Portable Text (blog body, seoSettings.content).
 * Mirrors kondor-pc-admin `articlePortableTextOf`.
 */
export const ARTICLE_PORTABLE_TEXT_ARRAY_PROJECTION = `[]{
  ...,
  _type == "block" => {
    ...,
    children[]{
      ...,
      marks[]
    }
  },
  _type == "image" => {
    _key,
    _type,
    asset,
    crop,
    hotspot,
    alt,
    "dimensions": asset->metadata.dimensions
  },
  _type == "gallerySection" => {
    _key,
    _type,
    items[]{
      _key,
      _type,
      image{
        _type,
        asset,
        crop,
        hotspot,
        alt,
        "dimensions": asset->metadata.dimensions
      }
    }
  },
  _type == "table" => {
    _key,
    _type,
    rows[]{
      cells[]
    }
  },
  _type == "faqAnswerButton" => {
    _key,
    _type,
    label,
    href,
    newTab
  },
  markDefs[]{
    ...,
    _type == "link" => {
      _key,
      _type,
      href,
      blank
    }
  }
}`;
