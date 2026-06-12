# Landing temporal · tenerifecoworking.es

Página estática "Volvemos pronto" que sustituye al WordPress viejo durante la transición al nuevo servicio de intermediación de espacios en Canarias.

## Contenido

| Archivo | Función |
|---|---|
| `index.html` | Landing en sí: ES principal + EN secundario, mailto a `info@tenerifecoworking.es`. CSS inline, favicon SVG inline, sin assets externos, ~6 KB. |
| `.htaccess` | Reglas Apache: HTTPS forzado, catch-all (cualquier URL → `index.html` con 200), `X-Robots-Tag: noindex,follow`, ErrorDocument 404/403/500 = `index.html`. |
| `robots.txt` | Permite crawleo (el `noindex` va en headers, no en robots — así Google sigue rastreando y aprende que el dominio cambió). |

## Despliegue (en el servidor)

> ⚠️ **No subir aún. Pendiente de OK explícito del propietario.**

Plan paso a paso, vía `ssh root@82.223.65.247`:

```bash
# 1) Renombrar el docroot del WP actual (queda intacto, fuera del path servido)
cd /var/www/vhosts/tenerifecoworking.es
mv httpdocs httpdocs-wp-2026-05-18

# 2) Crear nuevo docroot vacío con los permisos correctos
mkdir httpdocs
chown tenerifecoworking.es_ul6xdxmimvq:psaserv httpdocs
chmod 750 httpdocs

# 3) Subir el contenido de landing-temporal/ (desde local, con scp)
# Desde el equipo local:
#   scp -r landing-temporal/* root@82.223.65.247:/var/www/vhosts/tenerifecoworking.es/httpdocs/
# Ajustar dueños después:
chown -R tenerifecoworking.es_ul6xdxmimvq:psacln httpdocs/*
find httpdocs -type f -exec chmod 644 {} \;
find httpdocs -type d -exec chmod 755 {} \;

# 4) Tests inmediatos
curl -I https://tenerifecoworking.es/                    # 200 OK
curl -I https://tenerifecoworking.es/contacto/           # 200 OK (catch-all)
curl -I https://tenerifecoworking.es/lo-que-sea-random   # 200 OK (catch-all)
curl https://tenerifecoworking.es/robots.txt             # texto
```

### Si nginx ignora el `.htaccess` (probable en Plesk)

El servidor parece tener nginx delante de Apache **sin proxy de rewrite** (el `.htaccess` del WP estaba vacío entre los markers y aun así `/contacto/` daba 404 — síntoma de que nginx no procesa rewrites). Si tras desplegar la landing las URLs como `/contacto/` siguen dando 404 en lugar de la landing:

1. Plesk → dominio `tenerifecoworking.es` → **Apache & nginx Settings**.
2. En **Additional nginx directives**, pegar:

```nginx
# Catch-all: cualquier URL que no sea un archivo existente sirve la landing.
location / {
    try_files $uri $uri/ /index.html;
}

# Cabecera noindex
add_header X-Robots-Tag "noindex, follow" always;
```

3. **Apply**. Plesk recarga nginx.
4. Re-test con `curl -I` los mismos paths.

## Rollback (volver al WordPress original)

Si algo va mal, en < 30 segundos:

```bash
cd /var/www/vhosts/tenerifecoworking.es
mv httpdocs httpdocs-landing-broken
mv httpdocs-wp-2026-05-18 httpdocs
```

El WordPress vuelve exactamente como estaba. La home estaba sirviendo OK, así que ese rollback restaura el estado pre-cambio.

Si el rollback en caliente fallara (carpeta borrada por error, permisos rotos), reconstruir desde [../backups/2026-05-18/](../backups/2026-05-18/) — están la BD y el wp-config. Los archivos PHP del WP core / themes / plugins son recuperables con una reinstalación limpia más los uploads (`files/uploads.tar.gz`).

## Lo que NO se toca

- DNS (zona y registros A intactos).
- Maildir / cuentas de correo (`info@tenerifecoworking.es` sigue activa).
- MX, SPF, DKIM si los hubiera.
- El subscription de Plesk del dominio.
- El resto del servidor (otros dominios alojados aquí).
