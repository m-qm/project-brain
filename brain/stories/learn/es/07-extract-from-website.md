<!-- SYNCED from apps/web/public — run: node scripts/sync-learn-stories.mjs -->
<!-- Not ground truth. Distill claims into brain/facts/ before agents state them as fact. -->

# Extraer desde la web

Rellena el asistente o la CLI desde una página **pública** de marketing o de documentación.

## Asistente

1. Abre `/wizard`.
2. Pega `https://…` y pulsa **Extraer desde la web**.
3. Revisa cada campo. El texto del producto (precio, SLA) no es toda la historia de la empresa hasta que lo confirmas.

## CLI

Con `@agentkbase/cli` instalado (`npm install -g @agentkbase/cli`):

```bash
brain extract-url https://example.com --json
brain extract-url https://example.com --init ./my-app
```

Desde el monorepo: `pnpm brain extract-url …` (las mismas flags).

### Prueba local del LLM (tu clave, no la de Vercel)

La CLI lee **`ANTHROPIC_API_KEY` / `OPENAI_API_KEY` de tu shell**, no del `.env.local` de Next salvo que lo cargues.

**Un disparo con npx** (paquete publicado):

```bash
ANTHROPIC_API_KEY='sk-ant-…' npx @agentkbase/cli extract-url https://auditamia.com/en --deep --json
```

**Monorepo (código más reciente):** pon la clave en `apps/web/.env.local` y luego:

```bash
pnpm run build:packages
pnpm brain:extract https://auditamia.com/en --deep --json
```

`pnpm brain:extract` carga `apps/web/.env.local` antes de ejecutar `extract-url`.

Si va bien: el JSON tiene `"method": "anthropic"` (o `"openai"`) y pasos del registro con `"usedLlm": true`. Sin clave obtienes `"method": "heuristic"` y un aviso en `warnings`.

Varias páginas y lectura profunda: [08-multi-page-extract.md](08-multi-page-extract.md).

## Cómo funciona el análisis

1. **Descarga** el HTML público (hay límites de tamaño y de tiempo).
2. **Lee** el título, meta/OG, encabezados y párrafos con sustancia.
3. **Sintetiza** una descripción orientada a la empresa desde la sección hero (no solo el meta, cuando el meta es una línea corta de SKU).
4. **Pasada opcional de LLM:** si está `ANTHROPIC_API_KEY` (preferida), Claude refina el JSON (`method: "anthropic"`). Si no, `OPENAI_API_KEY` (`method: "openai"`). Modelos: `ANTHROPIC_EXTRACT_MODEL` por defecto `claude-3-5-haiku-latest`; `OPENAI_EXTRACT_MODEL` por defecto `gpt-4o-mini`.

La respuesta incluye `method`, `warnings` y `raw` para que se vea.

## Límites

* Solo http/https públicos (ni localhost ni IPs privadas).
* HTML hasta 512KB, tiempo de espera de 12 segundos.
* La síntesis heurística no inventa clientes ni métricas que no estén en la página.

Revisa siempre a mano antes de exportar.

## Lo que la extracción *no* hace

* **No trae skills de Cursor.** Solo `brain/facts`, historias y preguntas abiertas. Importa las skills desde SkillTree o escribe tú el `SKILL.md`.
* **No hay índice RAG.** Lee una URL pública, no todo tu corpus de docs.
* **Heurística frente a LLM.** Sin `ANTHROPIC_API_KEY` ni `OPENAI_API_KEY`, la síntesis usa solo encabezados y texto. Pon una clave en Vercel o en local para una segunda pasada.

## Resultados más ricos

1. Pega la URL de la **home de marketing** (no solo `/pricing`, salvo que sea lo único que tienes).
2. Después de extraer, añade hechos **del repo**: stack, despliegue, ICP, métricas.
3. Copia notas de quien funda, de `agent.md` o de docs internos, a `brain/facts/`.
4. En webs al estilo de Auditamia, confirma en las preguntas abiertas qué es muestra y qué es el entregable en vivo.
