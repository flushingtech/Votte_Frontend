// Cloudinary serves whatever resolution was originally uploaded — several
// project photos in production are 2-3MB full-size camera/phone uploads
// being rendered as ~150-300px thumbnails, which is exactly what was making
// the dashboard so slow to load and janky to scroll (14MB+ of images on a
// single page load). Cloudinary can resize/recompress on the fly via URL
// parameters with no backend or upload changes, so every place that renders
// a user-uploaded image should route its `src` through this helper.
const UPLOAD_MARKER = '/image/upload/';

// Matches an existing transformation segment right after /upload/, e.g.
// "w_400,q_auto/" or "c_fill,h_100,w_100/" — so we never double-transform.
const TRANSFORM_ALREADY_PRESENT = /^[a-z][a-z0-9]*_[^/]+\//i;

/**
 * Rewrites a Cloudinary URL to request an appropriately-sized, auto-quality,
 * auto-format version instead of the original upload. Non-Cloudinary URLs
 * (or anything already transformed) are returned unchanged.
 */
export function cldOptimize(url, { width, height } = {}) {
  if (!url || typeof url !== 'string') return url;
  const idx = url.indexOf(UPLOAD_MARKER);
  if (idx === -1) return url;

  const after = url.slice(idx + UPLOAD_MARKER.length);
  if (TRANSFORM_ALREADY_PRESENT.test(after)) return url;

  const parts = ['q_auto', 'f_auto'];
  if (width) parts.push(`w_${Math.round(width)}`);
  if (height) parts.push(`h_${Math.round(height)}`);
  // Both dimensions given (avatars/thumbnails): crop to exactly fill the box.
  // Only one given (hero/gallery images): just cap that dimension and keep
  // the full image — the page's own CSS (object-fit, aspect-ratio) does the
  // actual fitting, so Cloudinary shouldn't pre-crop it differently.
  if (width && height) parts.push('c_fill');
  else if (width || height) parts.push('c_limit');

  const before = url.slice(0, idx + UPLOAD_MARKER.length);
  return `${before}${parts.join(',')}/${after}`;
}
