import { describe, expect, it } from "vitest";
import { InvalidFoodDataPayloadError, normalizeFdcSearchResponse } from "./normalize";

describe("normalizeFdcSearchResponse", () => {
  it("maps USDA search identity and provenance without accepting nutrient arithmetic", () => {
    const foods = normalizeFdcSearchResponse({
      foods: [{
        fdcId: 12345,
        description: "Apples, raw, with skin",
        dataType: "Foundation",
        publicationDate: "2024-10-01",
        foodCategory: "Fruits and Fruit Juices"
      }]
    });

    expect(foods).toEqual([{
      source: "USDA FoodData Central",
      sourceId: "12345",
      sourceUrl: "https://fdc.nal.usda.gov/food-details/12345/nutrients",
      description: "Apples, raw, with skin",
      dataType: "Foundation",
      brandOwner: null,
      gtinUpc: null,
      publicationDate: "2024-10-01",
      foodCategory: "Fruits and Fruit Juices",
      nutritionStatus: "not-loaded"
    }]);
  });

  it("returns an empty list for a valid no-match result", () => {
    expect(normalizeFdcSearchResponse({ foods: [] })).toEqual([]);
  });

  it("rejects malformed provider data rather than inventing defaults", () => {
    expect(() => normalizeFdcSearchResponse({ foods: [{ fdcId: "not-an-id", description: "Unknown" }] }))
      .toThrow(InvalidFoodDataPayloadError);
  });
});
