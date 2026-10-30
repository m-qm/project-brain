/** Normalize marketing imperatives into agent-friendly third person (Spanish). */
export function toThirdPersonEs(text: string, brand: string): string {
  let t = text.trim();
  t = t.replace(/^Enviad\b/gi, "El cliente envía");
  t = t.replace(/^Enviáis\b/gi, "El cliente envía");
  t = t.replace(/\bnosotros no entramos\b/gi, `${brand} no accede`);
  t = t.replace(/^No entramos\b/gi, `${brand} no accede`);
  t = t.replace(/\bsi lo tenéis\b/gi, "si disponen de export de miembros");
  t = t.replace(/^Sin export\b/gi, "Sin export de miembros");
  if (/^En \d+/i.test(t)) {
    t = t.replace(/^En (\d+[^,:]+),?\s*/i, `${brand} entrega en $1: `);
  }
  if (/^Sin entrar en/i.test(t)) {
    return `${brand} no accede a las cuentas del cliente.`;
  }
  return t.replace(/\s+/g, " ").trim();
}

export function toThirdPersonEn(text: string, brand: string): string {
  let t = text.trim();
  t = t.replace(/^Send\b/gi, "The customer sends");
  t = t.replace(/^We do not access\b/gi, `${brand} does not access`);
  if (/^In \d+/i.test(t)) {
    t = t.replace(/^In (\d+[^,:]+),?\s*/i, `${brand} delivers within $1: `);
  }
  return t.replace(/\s+/g, " ").trim();
}
