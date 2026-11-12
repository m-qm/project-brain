<!-- SYNCED from apps/web/public — run: node scripts/sync-learn-stories.mjs -->
<!-- Not ground truth. Distill claims into brain/facts/ before agents state them as fact. -->

# Relleno guiado de huecos

Las preguntas abiertas de `brain/open-questions.md` marcan lo que los agentes **no** deben adivinar. El relleno **sugiere respuestas en borrador** a partir de tus hechos y de tu historia actuales. Una sugerencia no es un hecho hasta que la aceptas.

## Asistente

En el paso **Huecos**, pulsa **Sugerir respuestas en borrador**. Revisa cada sugerencia y **Aplicar como nota [CONFIRM]**, o edítala a mano. La exportación sigue exigiendo `validateBrainInputStrict`.

## CLI

```bash
brain fill-gaps --dir ./my-app
brain fill-gaps --dir ./my-app --json
```

Hace falta `ANTHROPIC_API_KEY` o `OPENAI_API_KEY` en el entorno.

## Reglas

* No hay escritura automática en `brain/` salvo lo que aplicas en el asistente o editas a mano.
* No trates un borrador del LLM como métrica o prueba de cliente sin confirmarlo.
* Después de editar, ejecuta `brain validate --dir .`.
