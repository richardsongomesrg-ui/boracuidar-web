export function marketplaceLinkForCycle(cycle) {
  const params = new URLSearchParams();
  if (cycle?.category) params.set("categoria", cycle.category);
  params.set("origem", "rotina");
  return `/marketplace?${params.toString()}`;
}
