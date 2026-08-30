const calculatePercentageChange = (
  myproductValue: number | undefined,
  baselineValue: number | undefined
) => {
  if (baselineValue && myproductValue) {
    return ((myproductValue - baselineValue) / baselineValue) * 100;
  }
  return 0;
};
export const extractTabPercentage = (type: string, my, baseline) => {
  switch (type) {
    case "productEnvironmental":
      return calculatePercentageChange(
        my?.totallca?.total_lifecycle_total_pef_excluding_use_phase_functional_unit,
        baseline?.totallca?.total_lifecycle_total_pef_excluding_use_phase_functional_unit
      );

    case "carbonFootprint":
      return calculatePercentageChange(
        my?.totallca?.total_lifecycle_pre_normalization_excluding_use_phase?.climate_change_functional_unit,
        baseline?.totallca?.total_lifecycle_pre_normalization_excluding_use_phase?.climate_change_functional_unit
      );

    case "sustainablePackaging":
      return my?.["sustainablepackaging-rollup-compare"]?.Final_Score_Disrupters ?? 0;
    
    case "greenChemistry": {
      const myVal =
        my?.["green_chemistry_rollup"]?.step_6_final_score_with_5_watchlist ?? 0;
      const baseVal =
        my?.["baseline_green_chemistry_rollup"]?.step_5_final_score ?? 0;

      return parseFloat((myVal - baseVal).toFixed(0));
    }

    default:
      return 0;
  }
};
