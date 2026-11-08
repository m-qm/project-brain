# Evaluación y enrutado (avanzado)

Los agentes en producción fallan cuando la **herramienta equivocada** devuelve una respuesta **fluida**. Agent KBase no trae un router, pero aplica la misma disciplina:

## Conjunto dorado

Entradas fijas con resultados esperados. El build falla si el enrutado o la recuperación empeora.

## Trazas

`brain validate`, `brain eval`, `brain brief`, `brain fill-gaps`, `brain extract-url` y las herramientas MCP exportan un span de Langfuse cuando están definidas `LANGFUSE_PUBLIC_KEY` y `LANGFUSE_SECRET_KEY`. `LANGFUSE_BASE_URL` apunta a una instancia propia. Sin las dos claves no se envía nada.

Cada span guarda el nombre de la llamada, si pasó o falló, los códigos de issue, el número de coincidencias y las rutas. El texto de los hechos, los borradores y las líneas de búsqueda se quedan en la máquina. `LANGFUSE_TRACE_CONTENT=1` incluye esos cuerpos, recortados a 2.000 caracteres.

Un cliente puede unir el span del servidor a su propia traza enviando un `traceparent` W3C en el `_meta` de la petición MCP. Un proceso MCP comparte sesión de Langfuse hasta que el cliente manda `sessionId` o `langfuseSessionId` en ese mismo `_meta`.

Una demo no es una traza. `LANGFUSE_LOG_LEVEL=INFO` escribe en stdout y rompe el servidor MCP por stdio; el nivel por defecto de este proceso es `ERROR`.

## Caminos calientes deterministas

Prefiere código para elegir la herramienta. El desempate del modelo solo entra con una prueba de evaluación y un presupuesto de latencia.

## El asistente como puerta de evaluación

El asistente web bloquea la exportación hasta que los campos obligatorios pasan `validateBrainInputStrict`. La misma idea: no se publica sin comprobaciones.
