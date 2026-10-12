import { describe, expect, it } from "vitest";
import { isAdultAgeBand, isRestrictiveWeightLossAllowed, type AgeBand } from "./rules";

describe("age-aware onboarding safeguards", () => {
  it("does not permit restrictive weight-loss goals for minors or unconfirmed ages", () => {
    const nonAdultBands: AgeBand[] = ["under_13", "13_17", "prefer_not_to_say"];
    for (const band of nonAdultBands) {
      expect(isAdultAgeBand(band)).toBe(false);
      expect(isRestrictiveWeightLossAllowed(band)).toBe(false);
    }
    expect(isRestrictiveWeightLossAllowed(null)).toBe(false);
  });

  it("allows the adult flow only for an explicitly selected adult band", () => {
    const adultBands: AgeBand[] = ["18_29", "30_49", "50_69", "70_plus"];
    for (const band of adultBands) {
      expect(isAdultAgeBand(band)).toBe(true);
      expect(isRestrictiveWeightLossAllowed(band)).toBe(true);
    }
  });
});
