import type { Lang } from './i18n';

// Formato de precio orientativo para los espacios, localizado.
const LABELS: Record<Lang, { desde: string; consultar: string; periodos: Record<string, string>; locale: string }> = {
  es: {
    desde: 'Desde ',
    consultar: 'Consultar precio',
    periodos: { mes: '/mes', dia: '/día', hora: '/hora' },
    locale: 'es-ES',
  },
  en: {
    desde: 'From ',
    consultar: 'Price on request',
    periodos: { mes: '/month', dia: '/day', hora: '/hour' },
    locale: 'en-GB',
  },
};

export function formatPrecio(
  precio?: number,
  periodo: string = 'mes',
  desde: boolean = true,
  lang: Lang = 'es',
): string {
  const L = LABELS[lang];
  if (precio == null) return L.consultar;
  const n = new Intl.NumberFormat(L.locale).format(precio);
  const suf = L.periodos[periodo] ?? '';
  return `${desde ? L.desde : ''}${n} €${suf}`;
}
