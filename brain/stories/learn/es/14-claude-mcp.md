<!-- SYNCED from apps/web/public — run: node scripts/sync-learn-stories.mjs -->
<!-- Not ground truth. Distill claims into brain/facts/ before agents state them as fact. -->

# Claude y MCP remoto

Usa Agent KBase desde **Claude** (o cualquier cliente MCP con Streamable HTTP) antes de redactar copy de marketing. El servidor no publica: lee tu web pública, guarda un perfil alojado temporal y comprueba borradores contra los hechos.

**URL en producción:** `https://agentkbase.com/mcp`

**Dev local:** `http://localhost:3000/mcp`

OAuth para el directorio de Claude está en camino. Hoy las tres herramientas funcionan sin login; los perfiles se guardan en disco del servidor (exporta **brain.zip** desde el [asistente](/wizard) para tener archivos en git).

## Conectar (Claude Code, solo servidor)

```bash
claude mcp add --transport http agentkbase https://agentkbase.com/mcp
```

## Cinco preguntas de ejemplo

1. Escanea mi web y dime qué puedo afirmar.
2. Revisa este borrador antes de publicarlo.
3. ¿Este post de LinkedIn inventa un precio?
4. ¿Qué quedó en [CONFIRMAR]?
5. ¿Cómo paso esto a git? → [asistente](/wizard).

## Herramientas

| Herramienta | Pide confirmación | Qué hace |
|-------------|-------------------|----------|
| `scan_business_website` | No | URL pública → perfil + borrador |
| `get_what_we_can_claim` | No | Brief del perfil |
| `check_draft_before_publish` | No | Eval del borrador |

## FAQ

**Tus notas son archivos que posees; una capa solo alojada no.** Exporta `brain.zip` cuando quieras.
