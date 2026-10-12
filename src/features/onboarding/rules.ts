export type AgeBand = "under_13" | "13_17" | "18_29" | "30_49" | "50_69" | "70_plus" | "prefer_not_to_say";

export function isAdultAgeBand(ageBand: AgeBand | null): boolean {
  return ageBand === "18_29" || ageBand === "30_49" || ageBand === "50_69" || ageBand === "70_plus";
}

export function isRestrictiveWeightLossAllowed(ageBand: AgeBand | null): boolean {
  // Requires an explicitly selected adult band. Unknown or withheld ages fail closed.
  return isAdultAgeBand(ageBand);
}
