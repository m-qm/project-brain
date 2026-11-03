# Importar skills desde SkillTree

Agent KBase guarda la **verdad y las historias**. [SkillTree](https://skilltree.ai) guarda las **skills** (cómo hacer las tareas).

## Orden

1. Genera o inicia tu brain (CLI o asistente).
2. Descomprime o inicia en la raíz del repo.
3. Conecta SkillTree **una vez** (el enlace caduca tras el primer uso):
   * En SkillTree, copia tu URL `https://skilltree.ai/api/connect/sc_…`.
   * Haz `POST` a esa URL con `{"agentName":"Cursor"}` (o usa el flujo de conexión en la interfaz de SkillTree).
   * Guarda el `SKILL.md` que te devuelve en **`.cursor/skills/skilltree/SKILL.md`** de este repo (está en gitignore; contiene un token privado).
   * Recarga Cursor o abre un chat de Agent nuevo en este workspace.
4. Sigue editando `brain/facts/` en git. Actualiza las skills cuando SkillTree cambie.

**Árbol de Agent KBase en SkillTree:** `mq` (capa de skills). El **brain** se queda en `brain/` (capa de hechos).

## Modelo mental

| Capa | Dónde |
|------|--------|
| Skills | SkillTree / skills de Cursor |
| Hechos e historias | `brain/` en tu repo |
| Memoria de sesión (opcional) | Engram MCP |

No guardes secretos en ninguna capa.
