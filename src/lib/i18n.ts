// Soporte de idiomas. ES vive en la raíz; EN bajo /en/ con slugs propios.
// Las fichas de espacios y las páginas legales son solo ES por ahora.
import { url } from './url';

export type Lang = 'es' | 'en';

/** Home del idioma indicado (respeta el base path de staging). */
export function langUrl(lang: Lang, path = ''): string {
  if (lang === 'es') return url(path);
  return url(path ? `en/${path}` : 'en');
}

/** og:locale por idioma. */
export const OG_LOCALE: Record<Lang, string> = {
  es: 'es_ES',
  en: 'en_US',
};
