import { z } from "zod";

const fdcFoodSchema = z.object({
  fdcId: z.union([z.number().int().positive(), z.string().regex(/^\d+$/)]),
  description: z.string().trim().min(1).max(500),
  dataType: z.string().trim().min(1).max(80),
  brandOwner: z.string().nullish(),
  gtinUpc: z.string().nullish(),
  publicationDate: z.string().nullish(),
  foodCategory: z.string().nullish()
});

const fdcSearchSchema = z.object({
  foods: z.array(fdcFoodSchema).max(1000)
});

export type FoodSearchResult = Readonly<{
  source: "USDA FoodData Central";
  sourceId: string;
  sourceUrl: string;
  description: string;
  dataType: string;
  brandOwner: string | null;
  gtinUpc: string | null;
  publicationDate: string | null;
  foodCategory: string | null;
  nutritionStatus: "not-loaded";
}>;

export class InvalidFoodDataPayloadError extends Error {
  constructor() {
    super("FoodData Central returned an unrecognized search response.");
    this.name = "InvalidFoodDataPayloadError";
  }
}

/** Search results are discovery records only; no nutrient figures are accepted here. */
export function normalizeFdcSearchResponse(payload: unknown): FoodSearchResult[] {
  const parsed = fdcSearchSchema.safeParse(payload);
  if (!parsed.success) throw new InvalidFoodDataPayloadError();

  return parsed.data.foods.map((food) => {
    const sourceId = String(food.fdcId);
    return {
      source: "USDA FoodData Central",
      sourceId,
      sourceUrl: `https://fdc.nal.usda.gov/food-details/${sourceId}/nutrients`,
      description: food.description,
      dataType: food.dataType,
      brandOwner: food.brandOwner ?? null,
      gtinUpc: food.gtinUpc ?? null,
      publicationDate: food.publicationDate ?? null,
      foodCategory: food.foodCategory ?? null,
      nutritionStatus: "not-loaded"
    };
  });
}
