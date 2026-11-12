<!-- SYNCED from apps/web/public — run: node scripts/sync-learn-stories.mjs -->
<!-- Not ground truth. Distill claims into brain/facts/ before agents state them as fact. -->

# El primer brain en 15 minutos

Objetivo: una carpeta **`brain/` validada** en tu repo, que los agentes de Cursor puedan leer antes de actuar.

## Instalar

```bash
npm install -g @agentkbase/cli
```

¿Sin instalar? [Asistente web](https://agentkbase.com/wizard) → exporta `brain.zip` → descomprime en la raíz del repo. Para la config de Engram y las reglas de Cursor en un paso, mejor `setup` de la CLI ([Engram + brain](05-engram.md)).

## Esqueleto (recomendado)

```bash
brain setup -n "My Product" -d "What we do in one sentence" ~/path/to/your-repo
```

Borrador de hechos desde una portada **pública** (revísalo siempre antes de exportar):

```bash
brain setup -n "My Product" --url https://yourproduct.com ~/path/to/your-repo
```

Tras extraer la URL, revisa `brain/facts/project.md` y `brain/open-questions.md`.

## Validar y usar

```bash
brain validate --dir ~/path/to/your-repo
brain brief --dir ~/path/to/your-repo
```

Pega el brief en el chat de Cursor, o menciona con `@` los archivos de `brain/`.

Activa **Engram MCP** en Cursor si quieres memoria entre sesiones junto a la verdad de git ([guía](05-engram.md)).

## Quien contribuye (desde el código)

Desde la raíz del repositorio [project-brain](https://github.com/m-qm/project-brain):

```bash
pnpm install
pnpm run build:packages
pnpm brain setup -n "My Product" -d "One line mission" ~/path/to/your-repo
pnpm brain validate --dir ~/path/to/your-repo
```

Usa `pnpm brain …` allí donde esta guía dice `brain …`.

## Legado: solo archivos

```bash
brain init ./my-app
```

Crea `brain/` sin Engram ni reglas de Cursor. Mejor `setup`.

## Inicio rápido en la terminal

```bash
brain quickstart
```

Pasos en texto plano cuando no estás en el navegador. El camino del estudio es [Pega tu web](12-what-you-sell.md). Esta página es la instalación.
