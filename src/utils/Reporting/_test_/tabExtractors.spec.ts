import { extractTabPercentage } from "../tabExtractors";

describe("extractTabPercentage", () => {
  it("calculates productEnvironmental percentage change", () => {
    const my = {
      totallca: {
        total_lifecycle_total_pef_excluding_use_phase_functional_unit: 80,
      },
    };
    const baseline = {
      totallca: {
        total_lifecycle_total_pef_excluding_use_phase_functional_unit: 100,
      },
    };

    const result = extractTabPercentage("productEnvironmental", my, baseline);
    expect(result).toBe(-20);
  });

  it("calculates carbonFootprint percentage change", () => {
    const my = {
      totallca: {
        total_lifecycle_pre_normalization_excluding_use_phase: {
          climate_change_functional_unit: 120,
        },
      },
    };
    const baseline = {
      totallca: {
        total_lifecycle_pre_normalization_excluding_use_phase: {
          climate_change_functional_unit: 100,
        },
      },
    };

    const result = extractTabPercentage("carbonFootprint", my, baseline);
    expect(result).toBe(20);
  });

  it("returns sustainablePackaging score directly", () => {
    const my = {
      "sustainablepackaging-rollup-compare": {
        Final_Score_Disrupters: 45,
      },
    };

    const result = extractTabPercentage("sustainablePackaging", my, {});
    expect(result).toBe(45);
  });

  it("calculates greenChemistry difference and rounds correctly", () => {
    const my = {
      green_chemistry_rollup: {
        step_6_final_score_with_5_watchlist: 78.6,
      },
    };
    const baseline = {
      baseline_green_chemistry_rollup: {
        step_5_final_score: 70.2,
      },
    };

    const result = extractTabPercentage("greenChemistry", my, baseline);
    expect(result).toBe(79); 
  });

  it("returns 0 for greenChemistry when values are missing", () => {
    const result = extractTabPercentage("greenChemistry", {}, {});
    expect(result).toBe(0);
  });

  it("returns 0 when percentage inputs are missing", () => {
    const result = extractTabPercentage("productEnvironmental", {}, {});
    expect(result).toBe(0);
  });

  it("returns 0 for unknown type", () => {
    const result = extractTabPercentage("unknownType", {}, {});
    expect(result).toBe(0);
  });
});
