import type { BrainInput } from "./types.js";

export function looksLikeService(text: string): boolean {
  return /informe|facturas|cliente|customer|consultor|audit|renovar|renew/i.test(text);
}

export function isServiceBrain(
  input: Pick<BrainInput, "projectMission" | "projectDescription" | "factBullets">,
): boolean {
  const blob = [input.projectMission, input.projectDescription, ...(input.factBullets ?? [])].join(
    " ",
  );
  return looksLikeService(blob);
}
