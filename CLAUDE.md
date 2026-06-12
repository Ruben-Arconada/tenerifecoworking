# Tenerife Coworking — Web de intermediación (Astro) · Guía para Claude Code

> Lee primero `BRIEF.md` y `accesos.txt` (gitignored): contexto del pivot,
> credenciales del servidor y del staging.

## Qué es esto
Pivot de `tenerifecoworking.es`: el coworking físico cerró; el dominio se
reutiliza para una web de **intermediación en alquiler de espacios** (oficinas,
salas, locales, coworkings) en todas las islas Canarias. Modelo: comisión por
alquiler cerrado. MVP fase 1: catálogo + formularios de contacto (sin login,
sin pagos).

- **Producción** (`https://tenerifecoworking.es/`): landing temporal "Volvemos
  pronto" + catch-all de URLs viejas del WP. NO tocar sin OK explícito.
- **Staging** (`https://tenerifecoworking.es/staging/`): la web nueva, con
  basic auth (credenciales en `accesos.txt`).
- El WordPress viejo está apagado pero intacto en
  `httpdocs-wp-2026-05-18/` (rollback) y respaldado en `backups/` local
  (incluye 826 leads de Flamingo en el dump SQL).

## Stack
Astro 6 + Tailwind 4 + TS. Node 22 (`/opt/homebrew/opt/node@22/bin`). pnpm.
Mismo patrón que `~/Documents/clickcom-web/`.

## Comandos
```bash
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
pnpm dev              # dev server (base /)
pnpm build            # build dev (noindex, base /)
pnpm build:staging    # TNF_TARGET=staging → base /staging/, noindex
pnpm build:prod       # TNF_TARGET=prod → base /, indexable  ⚠️ solo para go-live
```

Deploy staging (tar + ssh root, ver scripts `.ssh-run.exp` / `.scp-up.exp`):
```bash
pnpm build:staging && tar czf /tmp/tnf-staging.tar.gz -C dist .
# subir y extraer en /var/www/vhosts/tenerifecoworking.es/httpdocs/staging/
# (conservar el .htaccess de basic auth de esa carpeta, o regenerarlo)
# chown -R tenerifecoworking.es_ul6xdxmimvq:psacln + 644/755
```

## Arquitectura
- **Contenido**: cada espacio es un `.md` en `src/content/espacios/` con schema
  Zod (`src/content.config.ts`). Los 4 actuales son EJEMPLOS a sustituir.
- **i18n**: ES en raíz, EN bajo `/en/` (slugs propios: spaces, list-your-space,
  contact, thanks). Fichas y legales solo ES (decisión, no bug). Componentes
  aceptan prop `lang`; `Base.astro` emite hreflang con `altHref`.
- **Enlaces internos SIEMPRE con `url()`/`asset()`** (`src/lib/url.ts`): el
  staging vive en subcarpeta y un href hardcodeado "/x" lo rompe.
- **Formularios**: `LeadForm.astro` → webhook n8n (PENDIENTE de configurar;
  ver `n8n/README.md` para la convención anti-colisión `tnf-` del n8n
  compartido). Env: `PUBLIC_N8N_WEBHOOK_URL`, `PUBLIC_TURNSTILE_SITE_KEY`
  (ver `.env.example`).
- **Dark mode**: `data-theme` en `<html>` (anti-FOUC inline en Base) +
  `@custom-variant dark` en `global.css`. Tokens semánticos `--surface`,
  `--text`, `--accent`… definidos para ambos temas.

## Reglas que NO se rompen
- **NO desplegar a la raíz de producción sin OK explícito de Rubén.**
- **NO tocar el correo** (`info@tenerifecoworking.es`, Maildir en el servidor) **ni la zona DNS**.
- **NO commitear** `accesos.txt`, `.env`, `backups/`.
- **NO borrar** `httpdocs-wp-2026-05-18/` del servidor sin OK (rollback de la landing).
- El n8n es compartido con otros proyectos: respetar la convención de
  `n8n/README.md` (prefijo `tnf-`, credenciales y destinos propios).
- Forma de trabajar de Rubén: **por hitos, anunciar antes, verificar después,
  commits granulares**, español, conciso. Esperar confirmación entre hitos
  salvo autorización explícita de avanzar en bloque.

## Pendiente (ver informes/ para detalle)
- Conectar webhook n8n + Turnstile y probar envío real.
- Datos fiscales del titular → sustituir [PENDIENTE] en aviso-legal/privacidad.
- Contenido real de espacios (sustituir los 4 ejemplos).
- Export de los 826 leads Flamingo (backups/2026-05-18/db/) cuando se decida destino.
- Go-live: build:prod a la raíz + redirects de slugs WP con tráfico + Search Console.
