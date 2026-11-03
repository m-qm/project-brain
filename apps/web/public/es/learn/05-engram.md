# Engram + Agent KBase (capas en paralelo)

Los agentes deberían consultar **dos fuentes de conocimiento**, no una:

| Capa | Dónde | Para qué |
|------|--------|----------|
| **Agent KBase** | `brain/` en git | Ofertas, límites, historias, huecos `[CONFIRM]`: lo revisa el equipo |
| **Engram** | Almacén de memoria MCP | Decisiones, bugs, resúmenes de sesión: continuidad entre chats |

Las skills de SkillTree son una tercera capa (cómo trabajar). Brain + Engram responden **qué es verdad** y **qué ya decidimos**.

## Un comando de la CLI

Desde la raíz de tu repo:

```bash
brain setup --name "Auditamia" --url https://auditamia.com/es
```

O sin URL:

```bash
brain setup -n "My SaaS" -d "One line mission"
```

Esto escribe:

* `brain/` (AGENTS.md, hechos, historias, preguntas abiertas)
* `.cursor/rules/project-brain.mdc` (cargar primero la verdad de git)
* `.cursor/rules/engram.mdc` (protocolo mem_context / mem_save)
* `.engram/config.json` (el slug del proyecto en Engram)

Activa **Engram MCP** en Cursor una vez. Después, en cada sesión:

1. Las reglas dicen al agente que lea `brain/` **y** llame a `mem_context`.
2. Los hechos duraderos del equipo → edita `brain/facts/`.
3. Lo que se descubre en la sesión → `mem_save`; al acabar, `mem_session_summary`.

## Ajustes a mano

* Cambiar el slug de Engram: edita `.engram/config.json` → `project`.
* Desactivar Engram en un repo: `brain setup --no-engram`.

## Frente a la entrevista de SkillTree

SkillTree construye skills y puede entrevistar para un segundo cerebro alojado. Agent KBase es **local, git primero, código abierto**: los archivos son tuyos, validas antes de exportar, y la extracción de URL es opcional. Usa los dos: SkillTree para los paquetes de skills, Agent KBase + Engram para la base nativa del repo.
