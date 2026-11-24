/** Resolve extensionless TypeScript imports when node:test loads the web lib. */
export async function resolve(specifier, context, nextResolve) {
  if (!specifier.startsWith(".")) return nextResolve(specifier, context);
  try {
    return await nextResolve(specifier, context);
  } catch (error) {
    if (!context.parentURL) throw error;
    const base = new URL(specifier, context.parentURL);
    let last = error;
    for (const ext of [".ts", ".tsx", ".js", ".mjs"]) {
      try {
        return await nextResolve(`${base.href}${ext}`, context);
      } catch (next) {
        last = next;
      }
    }
    throw last;
  }
}
