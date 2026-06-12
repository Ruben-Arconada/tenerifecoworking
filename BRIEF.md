# Tenerife Coworking → Intermediación de espacios en Canarias

> **Sesión dedicada.** Proyecto independiente del de la auditoría (`clickcom-auditoria/`) y del proyecto Click (`clickcom-web/`). Aquí se trabaja un **pivot** de `tenerifecoworking.es`: el negocio antiguo (coworking físico) se cerró; el dominio se reutiliza para una nueva web de **intermediación en alquileres de espacios en las islas Canarias**.

---

## 🎯 Objetivo

Construir una web nueva sobre el dominio `tenerifecoworking.es` para un negocio de **intermediación en alquileres de espacios** (todas las islas Canarias). El proyecto se divide en 3 fases — solo la fase 0 está acordada hoy; el resto se concreta en la nueva sesión.

### Fase 0 · Apagar el WP viejo + landing "Próximamente" *(acordado)*
1. **Backup completo** del WordPress actual de `tenerifecoworking.es` (archivos + BD + mail) antes de tocar nada.
2. Sustituir el WordPress por una **landing estática** que diga:
   > *"En breve volvemos a dar servicio en todas las islas Canarias."*
3. Configurar que **TODAS las URLs/slugs antiguas redirijan a esa landing** (catch-all). El usuario que llega de Google o de un enlace viejo verá siempre la página de "próximamente".
4. Conservar el dominio activo en buscadores (no devolver 410/404/503).
5. Conservar el buzón de email del dominio (no tocar).

### Fase 1 · Definir alcance MVP *(pendiente — se decide al arrancar la sesión)*
Posibles direcciones (ordenadas por simplicidad):
- **a)** Catálogo de espacios + formulario de contacto. Sin login, sin pagos.
- **b)** Catálogo + reservas con calendario, sin pagos. Cierre del alquiler offline.
- **c)** Marketplace completo (cuentas, reservas online, pagos). Comisiones.

Decidir esto antes de empezar a construir.

### Fase 2 · Build con Astro estático + CMS ligero *(pendiente)*
Stack acordado:
- **Astro estático** como generador (como `clickcom-web/`).
- **CMS ligero** para contenido editable (Sanity, Strapi, Decap, o similar — definir).
- **Backend ligero** si el alcance lo necesita (formularios, leads, reservas) — definir según fase 1.
- Despliegue al mismo servidor (Plesk + Apache/Nginx).

---

## 🗺️ Estado actual del dominio (a fecha 2026-05-17)

| Dato | Valor |
|---|---|
| Dominio | `tenerifecoworking.es` |
| Cliente Plesk | `Ruben` |
| Estado en Plesk | Activo (status=0) |
| Creado | 2022-03-17 |
| Webroot | `/var/www/vhosts/tenerifecoworking.es/httpdocs/` |
| DNS | A → `82.223.65.247` (este servidor) |
| Stack actual | **WordPress 6.5.8** (desactualizado) con tema **Cornerstone Pro** (X Theme / Pro) |
| Filesystem | 1,1 GB en `httpdocs/` |
| Base de datos | `tener_` · 272 MB · prefijo `wp_` |
| Cuenta de email | 1 buzón (225 MB) |
| Tráfico | **Sigue vivo**. Hits humanos en `access_ssl_log` el 16-may y 17-may. SEO antiguo aún trae visitas. |

---

## 🚨 Reglas de oro

1. **Backup completo antes de tocar nada.** Archivos + BD + buzón.
2. **No tocar el correo del dominio** sin avisar (sigue activo).
3. **No tocar la zona DNS** mientras la landing temporal esté sirviendo desde el mismo servidor.
4. **Si surge algo que afecta a otro proyecto** (auditoría, clickcom-web), anotarlo y compartirlo con la otra sesión.
5. **No subir nada al servidor sin confirmación explícita.**

---

## 📂 Estructura del proyecto

```
~/Documents/tenerifecoworking-web/
├── BRIEF.md              (este fichero)
├── accesos.txt           (credenciales — NO commitear)
├── .gitignore
├── backups/              (backups del WP actual antes de cualquier cambio)
├── landing-temporal/     (landing "próximamente" — HTML + CSS estático)
└── informes/             (informes intermedios, decisiones, etc.)
```

---

## 🤖 Cómo arrancar esta sesión en Claude Code

1. Abre Claude Code en una **nueva conversación** dentro de `~/Documents/tenerifecoworking-web/`.
2. Pega como primer mensaje:

```
Lee @BRIEF.md y @accesos.txt. Trabajamos en el pivot de tenerifecoworking.es
hacia una web de intermediación en alquileres de espacios en Canarias.

Empezamos por la Fase 0:
1. Backup completo del WordPress actual (archivos + BD + buzón) en backups/.
2. Diseñar y montar la landing temporal "En breve volvemos a dar servicio
   en todas las islas Canarias" en landing-temporal/.
3. Plan para hacer que TODAS las URLs antiguas redirijan a esa landing
   (catch-all en .htaccess o equivalente) sin romper el SEO ni el correo.

Antes de tocar nada en el servidor:
- Dame el inventario del backup que vas a hacer (qué incluye, qué peso,
  dónde lo guardas en local).
- Dame el plan de despliegue de la landing (qué archivos, qué redirecciones,
  cómo se reactiva el WP si hace falta volver atrás).
- Espera mi OK antes de modificar nada del servidor.

Cuando tengamos la Fase 0 cerrada, definimos Fase 1 (alcance MVP).
```

3. Tener a mano:
   - Esta carpeta `~/Documents/tenerifecoworking-web/`
   - `accesos.txt` ya tiene los accesos al servidor (SFTP del .com + root de Plesk + datos del WP actual).

---

## 📎 Relación con los otros proyectos

- `~/Documents/clickcom-auditoria/` — auditoría de hostings (donde se identificó este pivot como oportunidad). Esta sesión puede leer informes de allí, pero no toca su contenido.
- `~/Documents/clickcom-web/` — web nueva de Click Comunicación. Ningún solapamiento técnico, pero comparten servidor Plesk y stack (Astro).

Si surge algo durante el pivot que afecte al servidor entero (cron, BDs, dominios), anotarlo en `informes/` y compartirlo con la sesión de auditoría.
