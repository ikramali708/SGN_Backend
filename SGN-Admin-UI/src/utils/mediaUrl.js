const envBase = import.meta.env.VITE_API_URL?.trim() || '';

/**
 * Resolve plant/media URLs for the storefront.
 * Absolute http(s) URLs are unchanged.
 * Relative paths: `${VITE_API_URL}${imageUrl}` when VITE_API_URL is set.
 * In dev without env, uses http://localhost:5285 to match typical API port.
 */
export function mediaUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  const base = envBase.replace(/\/$/, '') || (import.meta.env.DEV ? 'http://localhost:5285' : '');
  if (!base) {
    const p = path.startsWith('/') ? path : `/${path}`;
    return typeof window !== 'undefined' ? `${window.location.origin}${p}` : p;
  }
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}
