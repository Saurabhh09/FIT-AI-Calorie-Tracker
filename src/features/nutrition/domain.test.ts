import { describe, expect, it } from "vitest";
import { calculateNutritionTotals, roundNutrientAmount, type FoodPortion } from "./domain";

const rice: FoodPortion = {
  foodId: "fdc:rice",
  weightGrams: 150,
  nutrients: [
    { nutrientId: "energy", name: "Energy", unit: "kcal", amountPer100g: 130 },
    { nutrientId: "fiber", name: "Fiber", unit: "g", amountPer100g: null },
    { nutrientId: "sodium", name: "Sodium", unit: "mg", amountPer100g: 0 }
  ]
};

const lentils: FoodPortion = {
  foodId: "fdc:lentils",
  weightGrams: 100,
  nutrients: [
    { nutrientId: "energy", name: "Energy", unit: "kcal", amountPer100g: 116 },
    { nutrientId: "fiber", name: "Fiber", unit: "g", amountPer100g: 7.9 },
    { nutrientId: "sodium", name: "Sodium", unit: "mg", amountPer100g: 2 }
  ]
};

describe("calculateNutritionTotals", () => {
  it("scales per-100 g facts for weighed portions", () => {
    const totals = calculateNutritionTotals([rice]);
    expect(totals.energy.amount).toBe(195);
    expect(totals.energy.unit).toBe("kcal");
  });

  it("sums known values across portions", () => {
    const totals = calculateNutritionTotals([rice, lentils]);
    expect(totals.energy.amount).toBe(311);
    expect(totals.energy.knownPortions).toBe(2);
    expect(totals.sodium.amount).toBe(2);
  });

  it("keeps missing data unavailable instead of treating it as zero", () => {
    const totals = calculateNutritionTotals([rice, lentils]);
    expect(totals.fiber.amount).toBeNull();
    expect(totals.fiber.knownPortions).toBe(1);
    expect(totals.fiber.totalPortions).toBe(2);
  });

  it("preserves an explicitly sourced zero", () => {
    const totals = calculateNutritionTotals([rice]);
    expect(totals.sodium.amount).toBe(0);
    expect(totals.sodium.knownPortions).toBe(1);
  });

  it("does not invent a nutrient total when all source facts are absent", () => {
    expect(calculateNutritionTotals([{ foodId: "food-with-no-facts", weightGrams: 50, nutrients: [] }])).toEqual({});
  });

  it("rejects non-positive or non-finite portions", () => {
    for (const weightGrams of [0, -10, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() => calculateNutritionTotals([{ foodId: "bad", weightGrams, nutrients: [] }])).toThrow(RangeError);
    }
  });

  it("rejects non-finite scaled contributions instead of returning Infinity", () => {
    const extreme: FoodPortion = {
      foodId: "extreme",
      weightGrams: 1e308,
      nutrients: [{ nutrientId: "energy", name: "Energy", unit: "kcal", amountPer100g: 1e308 }]
    };
    expect(() => calculateNutritionTotals([extreme])).toThrow(RangeError);
  });

  it("rejects an overflowed accumulated total", () => {
    const large: FoodPortion = {
      foodId: "large",
      weightGrams: 100,
      nutrients: [{ nutrientId: "energy", name: "Energy", unit: "kcal", amountPer100g: 1e308 }]
    };
    expect(() => calculateNutritionTotals([large, large])).toThrow(RangeError);
  });

  it("rejects inconsistent units for one nutrient", () => {
    const otherUnit: FoodPortion = {
      foodId: "bad-unit",
      weightGrams: 100,
      nutrients: [{ nutrientId: "energy", name: "Energy", unit: "kJ", amountPer100g: 500 }]
    };
    expect(() => calculateNutritionTotals([rice, otherUnit])).toThrow(/Unit mismatch/);
  });
});

describe("roundNutrientAmount", () => {
  it("rounds only for display and preserves unavailable values", () => {
    expect(roundNutrientAmount(2.26)).toBe(2.3);
    expect(roundNutrientAmount(0)).toBe(0);
    expect(roundNutrientAmount(null)).toBeNull();
  });

  it("does not turn a finite extreme amount into Infinity while rounding", () => {
    expect(roundNutrientAmount(1e308, 6)).toBe(1e308);
  });
});
