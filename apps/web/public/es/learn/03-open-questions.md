# Preguntas abiertas

Los agentes adivinan cuando se acaba el contexto. Las preguntas abiertas son una **lista de parada** explícita.

## Reglas

* Si el trabajo depende de algo sin responder, el agente te pregunta.
* Usa `[CONFIRM]` en los borradores que va a revisar una persona.
* Los huecos de confirmación vacíos hacen que `brain validate` avise.

## Ejemplos

* [CONFIRM] Production URL
* [CONFIRM] Whether feature X is in scope for v1

Cuando sepas la respuesta, muévela a `brain/facts/` y quítala de las preguntas abiertas.
