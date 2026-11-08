# MCP de Agent KBase

`@agentkbase/mcp` es un servidor [MCP](https://modelcontextprotocol.io) local y de solo lectura. Expone el mismo brief y la misma validación que la CLI `brain`, más listar, leer y buscar en `brain/`.

Git sigue siendo el camino de escritura. El servidor no crea, edita ni borra hechos, y no escribe en `brain/`.

`@agentkbase/mcp` no está en el registro de npm. Ejecútalo desde un checkout de este repositorio después de `pnpm run build:packages`.

## Ejecutarlo desde un checkout

Mezcla esto en `.cursor/mcp.json`. Deja en su sitio los servidores que ya tengas.

```json
{
  "mcpServers": {
    "agentkbase": {
      "command": "node",
      "args": ["packages/mcp/dist/index.js"],
      "env": {
        "BRAIN_DIR": "examples/fictional-saas-brain"
      }
    }
  }
}
```

`args` es relativo al checkout. Usa una ruta absoluta cuando el directorio de trabajo de Cursor sea otro repo. Cursor arranca el proceso con tu repo como directorio de trabajo. El servidor usa ese directorio si contiene `brain/AGENTS.md`. Si no, mira `BRAIN_DIR` y luego sube hasta 8 directorios padre.

`brain setup` no escribe `.cursor/mcp.json`.

## Herramientas

| Herramienta | Devuelve |
|-------------|----------|
| `brain_brief` | El mismo texto que `brain brief` |
| `brain_validate` | JSON `{ dir, ok, issues }`, las mismas comprobaciones que `brain validate` |
| `brain_list` | Rutas markdown bajo `brain/` |
| `brain_read` | Un archivo. La ruta real tiene que quedarse dentro de `brain/` |
| `brain_search` | Coincidencias sin distinguir mayúsculas, con ruta y línea (máximo 50) |
| `brain_open_questions` | Preguntas de `brain/open-questions.md` |

`brain_read` rechaza `..`, rutas absolutas y enlaces simbólicos que salen de `brain/`. `brain_list` y `brain_search` omiten esos enlaces.

Cada herramienta está marcada como solo lectura. Pasa `dir` cuando el brain no está en el directorio de trabajo.

## Trazas

Las trazas están apagadas hasta que el proceso MCP tiene `LANGFUSE_PUBLIC_KEY` y `LANGFUSE_SECRET_KEY`. Las mismas variables trazan `brain eval`, `brain brief` y `brain validate`.

```json
{
  "mcpServers": {
    "agentkbase": {
      "command": "node",
      "args": ["packages/mcp/dist/index.js"],
      "env": {
        "BRAIN_DIR": "examples/fictional-saas-brain",
        "LANGFUSE_PUBLIC_KEY": "pk-lf-...",
        "LANGFUSE_SECRET_KEY": "sk-lf-...",
        "LANGFUSE_BASE_URL": "https://cloud.langfuse.com"
      }
    }
  }
}
```

Los spans guardan la herramienta, si pasó o falló, los códigos de issue y las rutas. No incluyen el texto de hechos ni borradores salvo con `LANGFUSE_TRACE_CONTENT=1`. Detalle: [Evaluación y enrutado](advanced/eval-and-routing.md).

## Lo que esto no es

* No es un sitio para guardar decisiones. Eso es Engram (`mem_save`). Los hechos del equipo siguen en git.
* No es una API alojada. Los archivos se quedan en el repo de la máquina que ejecuta el servidor.
* No es la extracción de una web. Para eso, `brain extract-url`.
* No es publicar en Instagram, Meta Ads ni enviar WhatsApp. Esos conectores son una capa Act de pago, aparte, con aprobación humana. No van a salir dentro de este MCP de solo lectura. Véase [Workers de contenido y anuncios](11-content-ads-workers.md).
