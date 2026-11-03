# Workers de contenido y anuncios

Objetivo: entender la **capa Act de pago** sin mezclarla con el brain de código abierto.

La CLI, el asistente y `@agentkbase/mcp` siguen siendo **verdad de solo lectura en git**. No publican, no impulsan y no escriben a nadie.

## Qué compras (cuando salga)

Un brain de empresa que los agentes no pueden contradecir, más conectores que solo corren después de que una persona dice que sí:

1. **WhatsApp:** entra el borrador, sale aprobado o rechazado.
2. **Blog:** el artículo va a la web de la empresa solo cuando está `approved`. Primer bucle del propio Agent KBase.
3. **LinkedIn:** borrador a partir de un artículo publicado. No a partir de un texto pendiente.

Instagram y Meta Ads son formatos posteriores de la misma pieza aprobada. El vídeo no es la primera prueba.

La calidad es el producto: fuentes, huecos `[CONFIRM]`, revisión humana, nada de fango a escala. El alcance y los rankings no son un entregable.

## Núcleo abierto

| Capa | Precio | Hace |
| --- | --- | --- |
| Brain OSS + MCP | Gratis | Hechos, historias, `[CONFIRM]`, brief, validate |
| Conectores Act | De pago | HITL de WhatsApp, publicar el blog, borrador de LinkedIn |
| Hecho para ti | Con presupuesto | Operamos el bucle en tu marca |

Las plantillas que puedes copiar no son el producto. Lo son OAuth, el alojamiento y la cola de aprobación.

## Lo que esto no es

* No es un catálogo de Zapier (aquí no hay pack de Shopify, HubSpot ni CRM).
* No es un publicador automático. Los borradores sin aprobar se quedan en la cola.
* No es «te hacemos virales».
* No es una petición de facturas ni de contraseñas.

## Prueba hoy la parte de código abierto

```bash
npm install -g @agentkbase/cli
brain setup -n "My Product" -d "One line mission" ~/path/to/your-repo
```

Bucle de ejemplo (reglas de una marca ficticia, calendario de 14 días, cinco posts bilingües): [`examples/content-ads-brain`](https://github.com/m-qm/project-brain/tree/main/examples/content-ads-brain).

Workers de pago: [lista de espera y hecho para ti](https://agentkbase.com/company-brain).
