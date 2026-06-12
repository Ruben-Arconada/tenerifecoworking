# Informe Fase 0.1 · Backup tenerifecoworking.es

**Fecha:** 2026-05-18
**Operador:** sesión Claude Code (pivot tenerifecoworking.es)
**Acceso:** SSH root al servidor 82.223.65.247 (panel Plesk)
**Servidor afectado:** `clickcomunicacion.com` (Plesk multi-tenant, vhost `tenerifecoworking.es`)

---

## Resultado: ✅ Backup completo, verificado e íntegro en local

Ubicación: [`backups/2026-05-18/`](../backups/2026-05-18/)
**Total descargado:** 149 MB
**Servidor:** temporales borrados (`/root/backups-tenerifecoworking/` ya no existe)
**WordPress en producción:** intacto, sigue sirviendo (no se ha tocado nada del docroot)

| Archivo | Tamaño | Contenido | SHA-256 (primeros 16 chars) |
|---|---|---|---|
| `db/tener_.sql.gz` | 13 MB | Dump completo MySQL (43 tablas, prefix `wp_`) | `da6347c385c6d0a9` |
| `mail/info.tar.gz` | 126 MB | Maildir completo de `info@tenerifecoworking.es` | `6d007c9a0032dcbf` |
| `files/uploads.tar.gz` | 7.3 MB | `wp-content/uploads/` (imágenes de la web) | `31ce3093405df893` |
| `config/wp-config.php` | 3 KB | Credenciales BD + secret keys (chmod 600) | `323f36a5fbcb9a75` |
| `config/plugins-installed.txt` | 328 B | Carpetas de plugins instalados (sin binarios) | `f1309a41f88731b7` |
| `config/themes-installed.txt` | 65 B | Themes instalados | `c8be012070aa9e28` |
| `config/htaccess-wp.txt` | 261 B | `.htaccess` actual del docroot | `6d554caeddac5c6d` |
| `MANIFEST.txt` | 1.2 KB | SHA-256 + tamaños de todo | — |

Verificación: los 7 archivos pasan `shasum -a 256 -c MANIFEST.txt` con `OK`.

---

## 🎯 Hallazgo crítico — leads históricos preservados

**826 envíos de formulario + 710 contactos únicos** sobreviven en la BD como post_types de Flamingo (plugin de storage para Contact Form 7).

### Rango temporal y distribución
- **Primer envío:** 2017-05-08
- **Último envío (form):** 2024-02-21
- **Último contacto registrado:** 2024-06-05

| Año | Envíos | Comentario |
|---|---|---|
| 2017 | 71 | |
| 2018 | 124 | |
| 2019 | 204 | Pico histórico |
| 2020 | 178 | COVID, sostenido |
| 2021 | 185 | |
| 2022 | 36 | Caída brusca (¿coincide con migración 17-mar-2022?) |
| 2023 | 23 | |
| 2024 | 5 | Últimos envíos antes del cierre físico |

### Ubicación en la BD
Los leads están en `wp_posts` con:
- `post_type = 'flamingo_inbound'` → cada envío del formulario (826 filas).
- `post_type = 'flamingo_contact'` → contacto único deduplicado por email (710 filas).
- `post_content` lleva el mensaje completo del envío.
- `post_meta` (tabla `wp_postmeta`) lleva los campos individuales del formulario (`_field_your-name`, `_field_your-email`, etc.).

### Muestra (primer envío)
```
Fecha: 2017-05-08 21:41:32
Asunto: Coworking San Isidro de abona
Mensaje:
  Fiamma Ravaioli
  fiammaravaioli@gmail.com
  Coworking San Isidro de abona
  Buenas. Me gustaría tener información sobre coworking en la zona del sur
  de tenerife, a ser posible en san Isidro de abona. Gracias.
```

### Próximo paso para usarlos (cuando toque)
Export a CSV con un script Python que parsee `wp_posts` + `wp_postmeta`:
- Columnas sugeridas: `fecha`, `nombre`, `email`, `asunto`, `mensaje`, `formulario_id`.
- Apto para importar a Mailchimp, Notion, Excel o el CRM que decidamos para la fase 2.
- Lo dejo pendiente, lo levantamos cuando definamos el destino.

---

## 🩺 Diagnóstico colateral: por qué `/contacto/` daba 404

El usuario detectó hoy que la página de contacto pública no funciona. Confirmado **desde fuera, sin entrar al servidor**:

| URL | Respuesta | Diagnóstico |
|---|---|---|
| `https://tenerifecoworking.es/` | 200 OK | OK (sirve directamente `index.php`) |
| `https://tenerifecoworking.es/?pagename=contacto` | 200 OK | La página **existe** en la BD (ID 25) |
| `https://tenerifecoworking.es/contacto/` | 404 (Plesk genérico) | La rewrite "URLs bonitas" no llega a WP |
| `https://tenerifecoworking.es/wp-sitemap.xml` | 404 | Mismo problema |
| `https://tenerifecoworking.es/wp-json/` | 404 | Mismo problema |

**Causa probable:** la configuración nginx de Plesk no incluye el `try_files ... /index.php?$args` que necesita WordPress con permalinks bonitos. Es un fallo clásico de migración a Plesk: el `.htaccess` queda en el filesystem pero nginx no lo lee.

**El 404 que sirve nginx tiene `last-modified: 2022-03-17`** (fecha de creación del dominio en este servidor según `BRIEF.md`). Pista fuerte de que el problema viene desde la migración hecha en marzo 2022.

**Pero:** los leads de 2022-2024 (36+23+5 = 64 envíos) demuestran que **el formulario seguía funcionando parcialmente** después de la migración. Probablemente:
- Quien llegaba a la home tenía el form embebido visible.
- O el form estaba en otra página accesible.
- O el form llegaba por una ruta alternativa (`?pagename=contacto`).

**Nota:** este diagnóstico **no era relevante para la decisión del usuario** (ha cerrado el coworking físico y va a montar otra cosa). Queda registrado por si en la fase 2 necesitamos heredar algo del viejo.

---

## ✅ Verificación de no-compromiso (defacement / hackeo)

Señales revisadas, **ninguna sospechosa**:
- Home sirve HTML legítimo, contenido del coworking original, Yoast/WPML/CF7 cargados normalmente.
- Sin redirecciones extrañas, sin scripts inyectados visibles desde fuera.
- En el servidor: presencia de **Imunify** (`.imunify_patch_id`, `.myimunify_id`) y **Revisium Antivirus** (`.revisium_antivirus_cache/`) → hay protección activa que estaría alertando.
- Solo 2 usuarios admin en la BD (`ClickCom` y `digital`), ambos coherentes con el dueño y el equipo.
- Versión WordPress: 6.5.8 (desactualizada — última estable es 6.x más reciente, pero da igual: se va a apagar).

**Conclusión:** no hay evidencia de hackeo. Lo que veía el usuario era simplemente la web rota desde una migración mal hecha.

---

## 📋 Inventario del servidor (no descargado, solo registrado)

| Recurso | Estado |
|---|---|
| Vhost `/var/www/vhosts/tenerifecoworking.es/` | Activo, owner `tenerifecoworking.es_ul6xdxmimvq:psaserv` |
| `httpdocs/` | 1,1 GB — WP 6.5.8 vivo. NO descargado entero (90% es WP core / plugins / themes desechables). |
| `wp-content/uploads/` | 11 MB — **descargado** entero (imágenes históricas del site) |
| `wordpress-backups/` | **Vacío**. No había backups previos del cliente. |
| Maildir `/var/qmail/mailnames/tenerifecoworking.es/` | 225 MB (1 buzón: `info@`) — **descargado** entero (Maildir intacto) |
| Cuentas SFTP dedicadas al vhost | Ninguna. Acceso vía root del servidor. |
| Cron jobs del vhost | No revisados (no necesarios para fase 0) |
| Plugins activos en WP | sitepress-multilingual-cms, all-in-one-wp-migration, cdn-enabler, connects-mailchimp, contact-form-7, duracelltomi-google-tag-manager, **flamingo**, insert-headers-and-footers, really-simple-captcha, really-simple-ssl, **updraftplus**, wordpress-seo (Yoast), wp-clean-up, wp-lightbox-2, wpml-string-translation, x-custom-404 |
| Theme activo | (sin determinar — listado de carpetas guardado en `config/themes-installed.txt`) |

**Observación útil:** UpdraftPlus está activo. Si estaba configurado contra Google Drive/Dropbox, podría haber backups remotos en alguna cuenta del cliente. No los necesitamos (ya tenemos este backup), pero conviene saber que existen para no dejarlos huérfanos cuando apaguemos el WP.

---

## 🔜 Siguiente paso (Fase 0.2 — pendiente del OK)

Con el backup íntegro y los leads asegurados, ya podemos atacar la landing temporal y las redirecciones catch-all sin riesgo:

1. Diseñar `landing-temporal/` (HTML estático, ES + EN, mailto al buzón existente, `noindex`).
2. Plan de despliegue:
   - `mv httpdocs httpdocs-wp-2026-05-18` (mantiene el WP intacto para rollback instantáneo).
   - `mkdir httpdocs` + subir la landing.
   - `.htaccess` catch-all → `index.html` con `200` y `X-Robots-Tag: noindex,follow`.
3. Test post-despliegue: curl varias URLs viejas, comprobar que el correo sigue funcionando.
4. Rollback ready: `mv` inverso o restauración desde este backup.

Espero OK para arrancar 0.2.

---

## 📂 Apéndice · cómo restaurar desde este backup

### BD
```bash
gunzip -c db/tener_.sql.gz | mysql -u <user> -p <db>
```

### Maildir
```bash
# En un servidor con qmail/Plesk:
tar xzf mail/info.tar.gz -C /var/qmail/mailnames/tenerifecoworking.es/
chown -R popuser:popuser /var/qmail/mailnames/tenerifecoworking.es/info
```

### Uploads
```bash
tar xzf files/uploads.tar.gz -C /var/www/vhosts/<dominio>/httpdocs/wp-content/
```

### Extraer leads de Flamingo a CSV (script pendiente)
Script Python que lea `wp_posts` (post_type=flamingo_inbound) + JOIN `wp_postmeta`. Se hace cuando definamos el destino (Mailchimp / CSV / Notion / CRM nuevo).
