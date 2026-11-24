# Claude y MCP remoto

Usa Agent KBase desde **Claude** (o cualquier cliente MCP con Streamable HTTP) antes de redactar copy de marketing. El servidor no publica: lee tu web pública, guarda un perfil alojado temporal y comprueba borradores contra los hechos.

**URL en producción:** `https://agentkbase.com/mcp`

**Dev local:** `http://localhost:3000/mcp`

## Autenticación (obligatoria)

`POST /mcp` exige un secreto compartido. El servidor **falla cerrado**: si `MCP_API_KEY` no está definida en el host, todas las peticiones reciben **401 Unauthorized**.

1. **Servidor:** define `MCP_API_KEY` en Vercel (Producción y Preview si aplica) o en `apps/web/.env.local` en local. Plantilla: `apps/web/.env.example`.
2. **Cliente:** envía `Authorization: Bearer <MCP_API_KEY>` en cada petición MCP HTTP.

### Claude Code

```bash
export MCP_API_KEY='tu-secreto-largo-aleatorio'

claude mcp add --transport http agentkbase https://agentkbase.com/mcp \
  --header "Authorization: Bearer $MCP_API_KEY"
```

En local:

```bash
claude mcp add --transport http agentkbase http://localhost:3000/mcp \
  --header "Authorization: Bearer $MCP_API_KEY"
```

OAuth para el directorio de Claude sigue [CONFIRMAR] en la hoja de ruta; hoy el operador usa este bearer.

## Cinco preguntas de ejemplo

1. Escanea mi web y dime qué puedo afirmar.
2. Revisa este borrador antes de publicarlo.
3. ¿Este post de LinkedIn inventa un precio?
4. ¿Qué quedó en [CONFIRMAR]?
5. ¿Cómo paso esto a git? → [asistente](/wizard).

## Herramientas

| Herramienta | Pide confirmación | Qué hace |
|-------------|-------------------|----------|
| `scan_business_website` | No | URL pública → perfil + borrador (escribe JSON en servidor) |
| `get_what_we_can_claim` | No | Brief del perfil |
| `check_draft_before_publish` | No | Eval del borrador |

## FAQ

**Tus notas son archivos que posees; una capa solo alojada no.** Exporta `brain.zip` cuando quieras.

**¿401 en `/mcp`?** Revisa `MCP_API_KEY` en el servidor y que el cliente envíe el mismo `Authorization: Bearer`.