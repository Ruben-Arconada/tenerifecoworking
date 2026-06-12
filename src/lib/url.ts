// Helper de rutas que respeta el `base` configurado (importante para el
// staging en subcarpeta /staging/). Úsalo en TODOS los enlaces internos:
//   <a href={url('espacios')}>  →  /espacios/  (dev/prod)  o  /staging/espacios/ (staging)
//
// Con trailingSlash: 'always', siempre devolvemos con barra final.
const BASE = import.meta.env.BASE_URL; // p.ej. '/' o '/staging/'

export function url(path = ''): string {
  const base = BASE.replace(/\/+$/, ''); // sin barra final
  const clean = path.replace(/^\/+/, '').replace(/\/+$/, ''); // sin barras a los lados
  return clean ? `${base}/${clean}/` : `${base}/`;
}

// Para assets en /public (no llevan barra final): url estática con base.
export function asset(path: string): string {
  const base = BASE.replace(/\/+$/, '');
  const clean = path.replace(/^\/+/, '');
  return `${base}/${clean}`;
}
