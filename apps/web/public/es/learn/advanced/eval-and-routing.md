# Evaluación y enrutado (avanzado)

Los agentes en producción fallan cuando la **herramienta equivocada** devuelve una respuesta **fluida**. Agent KBase no trae un router, pero aplica la misma disciplina:

## Conjunto dorado

Entradas fijas con resultados esperados. El build falla si el enrutado o la recuperación empeora.

## Trazas

Observa las decisiones después del despliegue (Langfuse, Langsmith, etc.). Una demo no es una traza.

## Caminos calientes deterministas

Prefiere código para elegir la herramienta. El desempate del modelo solo entra con una prueba de evaluación y un presupuesto de latencia.

## El asistente como puerta de evaluación

El asistente web bloquea la exportación hasta que los campos obligatorios pasan `validateBrainInputStrict`. La misma idea: no se publica sin comprobaciones.
