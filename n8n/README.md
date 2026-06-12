# Integración n8n · Tenerife Coworking

> El n8n de `n8n.clickcomunicacion.com` es **compartido** entre varios proyectos
> (virtualmenu, directorio de tarotistas, clickcomunicacion, este…). Estas
> convenciones evitan que los workflows se pisen entre sí.

## Convención de nombres (para no colisionar)

| Elemento | Valor para este proyecto |
|---|---|
| **Webhook path** | `tnf-lead` → `https://n8n.clickcomunicacion.com/webhook/tnf-lead` |
| **Nombre del workflow** | `TNF · Lead formulario web` |
| **Tag en n8n** | `tenerifecoworking` |
| **Credencial email** | Propia de `info@tenerifecoworking.es` (NO la compartida de otro proyecto) |
| **Destino de datos** | Hoja/tabla separada y exclusiva de TNF |

> Regla general para todos los proyectos del n8n compartido: **prefijo único por
> proyecto** en el path del webhook (`tnf-`, `vm-`, `tarot-`, `cc-`…) y en el
> nombre del workflow. Así nunca hay dos webhooks con el mismo path.

## Qué envía la web

El formulario (`src/components/LeadForm.astro`) hace un `POST` JSON al webhook con
este payload. El campo **`_proyecto`** permite filtrar/enrutar sin ambigüedad
aunque el workflow se comparta:

```json
{
  "_proyecto": "tenerifecoworking",
  "_tipo": "inquilino | propietario",
  "_espacio": "Nombre del espacio (solo desde una ficha)",
  "_origen": "web tenerifecoworking.es",
  "nombre": "...",
  "email": "...",
  "telefono": "...",
  "mensaje": "...",
  "consentimiento": "on",
  "website": ""   // honeypot: si viene relleno, es spam → descartar
}
```

## Workflow propuesto (a montar en n8n)

```
[Webhook tnf-lead (Production, POST)]
        │
        ├─ IF website != ""  → STOP (spam, honeypot)
        │
        ├─ (opcional) Verificar Turnstile  → HTTP Request a
        │     https://challenges.cloudflare.com/turnstile/v0/siteverify
        │     (secret key SOLO aquí, nunca en la web)
        │
        ├─ Email → info@tenerifecoworking.es  (credencial propia TNF)
        │
        ├─ Guardar lead → Sheet/Notion/DB  (destino exclusivo TNF)
        │
        └─ Respond to Webhook → 200 + cabeceras CORS
```

### CORS (imprescindible para sitio estático)

El POST va de `tenerifecoworking.es` → `n8n.clickcomunicacion.com` (cross-origin).
El nodo **Respond to Webhook** debe devolver:

```
Access-Control-Allow-Origin: https://tenerifecoworking.es
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

Y el webhook debe atender también el preflight `OPTIONS` (en n8n: activar
"Allowed Origins (CORS)" en el nodo Webhook, o un nodo que responda al OPTIONS).

## Aislamiento — checklist al montar el workflow

- [ ] Webhook path `tnf-lead` (verificar que NINGÚN otro proyecto lo usa).
- [ ] Workflow nombrado `TNF · Lead formulario web` + tag `tenerifecoworking`.
- [ ] Credencial de email propia de TNF (no reutilizar la de otro proyecto).
- [ ] Destino de datos exclusivo (no escribir en la hoja/tabla de otro proyecto).
- [ ] NO modificar sub-workflows compartidos; si hace falta lógica común, duplicar.
- [ ] Usar **Production URL** (no Test URL).
- [ ] Exportar el workflow a JSON y guardarlo en `n8n/workflow-tnf-lead.json`
      (backup + control de versiones; reimportable sin tocar los demás).

## Cuando esté montado

1. Copia la **Production URL** del webhook.
2. Pégala en `.env` → `PUBLIC_N8N_WEBHOOK_URL`.
3. (Si usas Turnstile) crea el site en Cloudflare y pon la **site key** en
   `PUBLIC_TURNSTILE_SITE_KEY`; la **secret key** va en el nodo de n8n.
4. Avísame y probamos un envío real de punta a punta.
