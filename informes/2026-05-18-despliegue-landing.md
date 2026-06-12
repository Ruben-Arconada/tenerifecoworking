# Informe Fase 0.2 + 0.3 · Despliegue landing temporal + catch-all

**Fecha:** 2026-05-18
**Estado:** ✅ Online. WP viejo intacto fuera de path para rollback.

---

## Lo que se hizo

1. **`mv httpdocs httpdocs-wp-2026-05-18`** — preservando el WordPress completo (1,1 GB) fuera del docroot. Rollback instantáneo posible.
2. **Nuevo `httpdocs/`** vacío con owner `tenerifecoworking.es_ul6xdxmimvq:psaserv` y mode 750 (igual que el original).
3. **SCP** de 3 archivos: `index.html`, `robots.txt`, `.htaccess`.
4. **chown** `tenerifecoworking.es_ul6xdxmimvq:psacln` + **chmod 644** a los archivos.

## Verificaciones desde fuera

| Test | Resultado |
|---|---|
| `https://tenerifecoworking.es/` | **200**, sirve la landing, `X-Robots-Tag: noindex, follow` |
| `https://tenerifecoworking.es/contacto/` | **200**, sirve la landing (catch-all OK) |
| `https://tenerifecoworking.es/lo-que-sea-random` | **200**, sirve la landing |
| `https://tenerifecoworking.es/wp-admin` | **200**, sirve la landing (ya no hay admin público) |
| `https://tenerifecoworking.es/galeria/` `/servicios/` `/coworking-tenerife` `/feed/` `/?p=11` `/wp-login.php` | **200**, todas redirigen al catch-all |
| `https://tenerifecoworking.es/wp-content/uploads/2016/07/tenerife-coworking-1-500x281.jpg` | **200**, sirve la landing (imagen vieja ya no se sirve, lo cual es deseado) |
| `http://tenerifecoworking.es/` | **301 → https://** |
| `https://tenerifecoworking.es/robots.txt` | **200**, `text/plain`, contenido correcto |
| Como Googlebot UA | **200**, `noindex, follow` presente |

**Sorpresa positiva:** el `.htaccess` SÍ se aplicó sin tocar las "Additional nginx directives" de Plesk. Nginx en este Plesk hace proxy a Apache y Apache lee `.htaccess`. El plan B (reglas nginx) queda documentado pero no fue necesario.

## Estado del correo

- Postfix + Dovecot + Plesk-PC-Remote → vivos.
- Maildir `/var/qmail/mailnames/tenerifecoworking.es/info/` intacto, con timestamps de actividad reciente (`May 17 22:56` — correo entrando justo antes del cambio).
- **No se ha tocado nada de mail.** El cambio fue puramente HTTP.

## Cabeceras de respuesta

```
HTTP/2 200
content-type: text/html
content-length: 6229
x-robots-tag: noindex, follow
cache-control: public, max-age=300, must-revalidate
x-content-type-options: nosniff
x-frame-options: SAMEORIGIN
referrer-policy: strict-origin-when-cross-origin
```

## Estado del filesystem en el servidor

```
/var/www/vhosts/tenerifecoworking.es/
├── httpdocs/                       20 KB  ← landing temporal (vivo)
├── httpdocs-wp-2026-05-18/         1.1 GB ← WordPress viejo (intocado)
└── ...
```

## Rollback (si en algún momento queremos volver al WP)

```bash
ssh root@82.223.65.247
cd /var/www/vhosts/tenerifecoworking.es
mv httpdocs httpdocs-landing-2026-05-18
mv httpdocs-wp-2026-05-18 httpdocs
```

< 30 segundos. El WP retoma exactamente como estaba.

---

## Cierre de Fase 0

| Sub-fase | Estado |
|---|---|
| 0.1 Backup completo (BD + Maildir + uploads + config) | ✅ [Informe](2026-05-18-backup-fase0.md) |
| 0.2 Landing temporal estática | ✅ Online |
| 0.3 Catch-all + SEO conservativo | ✅ Funcionando (vino "gratis" en el mismo `.htaccess`) |

Listos para definir **Fase 1 (alcance MVP)** cuando quieras.

## Pendientes en backlog (para abordar en futuras sesiones)

- **Extraer leads de Flamingo a CSV/Mailchimp/Notion** (826 envíos + 710 contactos preservados en el dump SQL local).
- **Decidir destino final del WP viejo**: tras un mes verificando que el correo y el SEO siguen sanos, ¿se borra `httpdocs-wp-2026-05-18/` del servidor para liberar el GB de espacio? El backup local sigue siendo la red de seguridad.
- **Actualizar credenciales** del panel Plesk tras el handover si procede (regla de oro 5 de `BRIEF.md`).
- **Configurar Search Console** para detectar a tiempo si Google empieza a desindexar masivamente. Como la landing devuelve `noindex,follow`, esperaríamos una caída lenta — útil para confirmar que el dominio no muere del todo.
