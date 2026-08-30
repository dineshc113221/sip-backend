import { matchRange } from "../dialCalculator";

describe("matchRange", () => {
  const rules = [
    {
      label: "Excellent",
      min: null,
      max: -20,
      exclusiveMax: true,
    },
    {
      label: "Good",
      min: -20,
      max: -10,
      exclusiveMax: true,
    },
    {
      label: "No Improvement",
      min: -10,
      max: 10,
    },
    {
      label: "Poor",
      min: 10,
      max: 20,
      exclusiveMin: true,
    },
    {
      label: "Very Poor",
      min: 20,
      max: null,
      exclusiveMin: true,
    },
  ];

  it("matches rule when min is null and exclusiveMax is true", () => {
    const result = matchRange(-30, rules);
    expect(result).toEqual({ description: "Excellent" });
  });

  it("matches rule with inclusive min and exclusive max", () => {
    const result = matchRange(-15, rules);
    expect(result).toEqual({ description: "Good" });
  });

  it("matches rule with inclusive min and inclusive max", () => {
    const result = matchRange(0, rules);
    expect(result).toEqual({ description: "No Improvement" });
  });

  it("respects exclusiveMin rule", () => {
    const result = matchRange(10, rules);
    expect(result).toEqual({ description: "No Improvement" });
  });

  it("matches rule when exclusiveMin condition passes", () => {
    const result = matchRange(15, rules);
    expect(result).toEqual({ description: "Poor" });
  });

  it("matches rule when max is null and exclusiveMin is true", () => {
    const result = matchRange(25, rules);
    expect(result).toEqual({ description: "Very Poor" });
  });

  it("returns null when value does not match any rule", () => {
    const customRules = [
      {
        label: "Only Zero",
        min: 0,
        max: 0,
        exclusiveMin: true,
        exclusiveMax: true,
      },
    ];

    const result = matchRange(0, customRules);
    expect(result).toBeNull();
  });

  it("returns first matching rule when multiple could match", () => {
    const overlappingRules = [
      {
        label: "First",
        min: null,
        max: 10,
      },
      {
        label: "Second",
        min: null,
        max: 20,
      },
    ];

    const result = matchRange(5, overlappingRules);
    expect(result).toEqual({ description: "First" });
  });
});
