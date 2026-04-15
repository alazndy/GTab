
import { Shortcut, ShortcutProfile } from '../../types';

// Cache for favicon URLs to prevent expensive URL parsing on every render
const faviconCache = new Map<string, string>();

/**
 * Ensures a URL has a protocol (defaulting to https://)
 */
export const ensureProtocol = (url: string | undefined): string => {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

/**
 * Resolves the final URL based on shortcut and active profile (handles Google authuser)
 */
export const resolveTargetUrl = (shortcut: Shortcut, profile?: ShortcutProfile): string => {
  const mainUrl = ensureProtocol(shortcut.url);
  if (!profile) return mainUrl;
  const pUrl = profile.url?.trim();
  if (!pUrl) return mainUrl;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (emailRegex.test(pUrl)) {
     if (mainUrl.includes('google.com') || mainUrl.includes('youtube.com')) {
        try {
            const urlObj = new URL(mainUrl);
            urlObj.searchParams.set('authuser', pUrl);
            return urlObj.toString();
        } catch {
            const separator = mainUrl.includes('?') ? '&' : '?';
            return `${mainUrl}${separator}authuser=${pUrl}`;
        }
     }
     return `mailto:${pUrl}`;
  }
  return ensureProtocol(pUrl);
};

/**
 * Gets the favicon URL for a given domain, with caching
 */
export const getFavicon = (url: string, baseShortcutUrl?: string): string => {
  const cacheKey = baseShortcutUrl ? `${url}|${baseShortcutUrl}` : url;
  if (faviconCache.has(cacheKey)) {
    return faviconCache.get(cacheKey)!;
  }

  let result: string;
  try {
    const fullUrl = ensureProtocol(url);
    if (fullUrl.startsWith('mailto:') && baseShortcutUrl) {
      result = getFavicon(baseShortcutUrl);
    } else {
      const domain = new URL(fullUrl).hostname;
      // Using sz=128 for higher quality favicons as default
      result = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    }
  } catch {
    // Better placeholder than picsum for broken favicons
    result = `https://ui-avatars.com/api/?name=${encodeURIComponent(url.substring(0, 1))}&background=random&color=fff&size=128`;
  }

  faviconCache.set(cacheKey, result);
  return result;
};
