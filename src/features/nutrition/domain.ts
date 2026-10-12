export type NutrientFact = Readonly<{
  nutrientId: string;
  name: string;
  unit: string;
  /** Amount per 100 g of the food. Null means the source did not provide a value. */
  amountPer100g: number | null;
}>;

export type FoodPortion = Readonly<{
  foodId: string;
  weightGrams: number;
  nutrients: readonly NutrientFact[];
}>;

export type NutrientTotal = Readonly<{
  nutrientId: string;
  name: string;
  unit: string;
  /** Null means a source value is unavailable for at least one portion. */
  amount: number | null;
  knownPortions: number;
  totalPortions: number;
}>;

export type NutritionTotals = Readonly<Record<string, NutrientTotal>>;

function assertWeight(weightGrams: number, foodId: string): void {
  if (!Number.isFinite(weightGrams) || weightGrams <= 0) {
    throw new RangeError(`Portion weight for ${foodId} must be a positive finite number of grams.`);
  }
}

function assertFact(fact: NutrientFact): void {
  if (!fact.nutrientId.trim() || !fact.unit.trim()) {
    throw new TypeError("Each nutrient fact must include a nutrient ID and unit.");
  }
  if (fact.amountPer100g !== null && (!Number.isFinite(fact.amountPer100g) || fact.amountPer100g < 0)) {
    throw new RangeError(`Invalid amount for nutrient ${fact.nutrientId}.`);
  }
}

/**
 * Scales source-attributed, per-100 g facts to weighed portions.
 * Missing facts remain null; this function never infers a zero.
 */
export function calculateNutritionTotals(portions: readonly FoodPortion[]): NutritionTotals {
  const metadata = new Map<string, { name: string; unit: string }>();
  const perPortion = portions.map((portion) => {
    if (!portion.foodId.trim()) throw new TypeError("Each portion must have a food ID.");
    assertWeight(portion.weightGrams, portion.foodId);

    const facts = new Map<string, NutrientFact>();
    for (const fact of portion.nutrients) {
      assertFact(fact);
      if (facts.has(fact.nutrientId)) {
        throw new TypeError(`Duplicate nutrient ${fact.nutrientId} for food ${portion.foodId}.`);
      }
      const knownMetadata = metadata.get(fact.nutrientId);
      if (knownMetadata && knownMetadata.unit !== fact.unit) {
        throw new TypeError(`Unit mismatch for nutrient ${fact.nutrientId}: ${knownMetadata.unit} vs ${fact.unit}.`);
      }
      if (!knownMetadata) metadata.set(fact.nutrientId, { name: fact.name, unit: fact.unit });
      facts.set(fact.nutrientId, fact);
    }
    return { weightGrams: portion.weightGrams, facts };
  });

  const totals: Record<string, NutrientTotal> = {};
  for (const [nutrientId, nutrientMetadata] of metadata) {
    let amount = 0;
    let knownPortions = 0;
    for (const portion of perPortion) {
      const fact = portion.facts.get(nutrientId);
      if (!fact || fact.amountPer100g === null) continue;
      const contribution = fact.amountPer100g * (portion.weightGrams / 100);
      if (!Number.isFinite(contribution)) {
        throw new RangeError(`Scaled amount for nutrient ${nutrientId} is not finite.`);
      }
      amount += contribution;
      if (!Number.isFinite(amount)) {
        throw new RangeError(`Total amount for nutrient ${nutrientId} is not finite.`);
      }
      knownPortions += 1;
    }
    totals[nutrientId] = {
      nutrientId,
      name: nutrientMetadata.name,
      unit: nutrientMetadata.unit,
      amount: knownPortions === portions.length ? amount : null,
      knownPortions,
      totalPortions: portions.length
    };
  }
  return totals;
}

/** Returns a display-safe rounded value while preserving null as unavailable. */
export function roundNutrientAmount(amount: number | null, fractionDigits = 1): number | null {
  if (amount === null) return null;
  if (!Number.isFinite(amount)) throw new RangeError("Nutrition amount must be finite.");
  if (!Number.isInteger(fractionDigits) || fractionDigits < 0 || fractionDigits > 6) {
    throw new RangeError("fractionDigits must be an integer between 0 and 6.");
  }
  const factor = 10 ** fractionDigits;
  const scaled = (amount + Number.EPSILON) * factor;
  // At extreme magnitudes, fractional digits are below Number precision and the
  // scaling multiplication may overflow. Returning the finite input is safer.
  if (!Number.isFinite(scaled)) return amount;
  return Math.round(scaled) / factor;
}
