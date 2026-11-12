<!-- SYNCED from apps/web/public — run: node scripts/sync-learn-stories.mjs -->
<!-- Not ground truth. Distill claims into brain/facts/ before agents state them as fact. -->

# Extracción de varias páginas

Lectura opcional más allá de la URL que pegas en el asistente o en la CLI.

## Modos

| Modo | Flag / asistente | Comportamiento |
|------|------------------|----------------|
| **single** | por defecto | Una página (el comportamiento anterior). |
| **multipage** | `--multipage` / «Leer más páginas» | Enlaces del mismo sitio puntuados de forma heurística (`/about`, `/pricing`, …), hasta **5 páginas** en total. |
| **deep** | `--deep` / «Lectura profunda» | Una llamada al LLM elige rutas entre las candidatas; hace falta `ANTHROPIC_API_KEY` o `OPENAI_API_KEY`. Si no hay clave, vuelve a la heurística. |

## CLI

```bash
brain extract-url https://example.com --multipage --json
brain extract-url https://example.com --deep --json
brain setup --url https://example.com --multipage ./my-app
```

El JSON incluye `scanMode`, `pagesFetched[]` y `warnings`.

## Límites

* Solo el mismo host registrable; http/https público (véase `url-security` en `@agentkbase/core`).
* 512KB de HTML por página; presupuesto de rastreo de unos 1,2MB.
* Descarga en serie en la v1 (más lenta, más segura en Vercel).

Revisa siempre los hechos unidos antes de exportar. La validación no cambia.
