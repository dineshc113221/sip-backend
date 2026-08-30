
   
  function allFalse(...conditions: boolean[]) {
    return conditions.every(c => c === false);
  }
   
  function allTrue(...conditions: boolean[]) {
    return conditions.every(c => c === true);
  }
   
  function isCalculationIncomplete(product: any): boolean {
    const keys = [
      "isFormulationCalculated",
      "isFormulationEOLCalculated",
      "isPackagingCalculated",
      "isGreenChemistryCalculated",
      "isGreenChemistryRollupCalculated",
      "isLCACalculated",
      "isSustainabilityPackagingCalculated",
      "isSustainabilityPackagingRollupCalculated",
      "isSpiceCalculated",
    ];
    return keys.some(key => product[key] === false);
  }
   
  export default async function calculation_scenario(flags) {
    const { myProduct, baseline, isBaselinePresent, isBaselineSkipped } = flags;

    const packagingMessage = (scenario: string) => ({
      error: true,
      message: "Enter both your formulation and packaging data and hit 'calculate' to view results",
      scenario,
      data: {},
    });
   
    const baselineIncompleteMessage = (scenario: string) => ({
      error: true,
      message: "Baseline assessment is either incomplete or has not been calculated. Please return to your baselines, enter any missing data and hit 'calculate' before returning to your assessment",
      scenario,
      data: {},
    });
   
    const calculationFailedMessage = (scenario: string) => ({
      error: true,
      message: "Oops! Something went wrong. Calculation has failed. Please try again. If the issue persists, please email SIPport@kenvue.com for assistance.",
      scenario,
      data: {},
    });
   
    const baselineCalcErrorMessage = (scenario: string) => ({
      error: true,
      message: "Oops! Something went wrong in the baseline calculation. Please return to your baseline and try again. If the issue persists, please email SIPport@kenvue.com for assistance.",
      scenario,
      data: {},
    });
   
    const successMessage = {
      error: false,
      message: "Success",
      scenario: "4b-4b",
      data: {},
    };

  if (isBaselineSkipped) {
  const myProductReady =
    myProduct?.isFormulationDataCompleted &&
    myProduct?.isMyProductPackagingPartialDataComplete &&
    myProduct?.isPackagingDataCompleted;

  if (!myProductReady) {
    return packagingMessage("skip-baseline-incomplete");
  }

  if (!myProduct?.isCalculatedButtonClicked) {
    return packagingMessage("skip-not-calculated");
  }

  if (isCalculationIncomplete(myProduct)) {
    return calculationFailedMessage("skip-calc-failed");
  }

  return {
    error: false,
    message: "Success",
    scenario: "Non Comparative assessment results",
    isBaselineSkipped: true,
    data: {},
  };
}
   
    const productNotReady = allFalse(
      myProduct.isFormulationDataCompleted,
      myProduct.isMyProductPackagingPartialDataComplete,
      myProduct.isPackagingDataCompleted
    );
   
    // 3a–3h no baseline
    if (productNotReady && !isBaselinePresent) return packagingMessage("3a-1");
   
    // 3a–3h with baseline incomplete
    if (
      productNotReady &&
      isBaselinePresent &&
      baseline &&
      allFalse(
        baseline.isFormulationDataCompleted,
        baseline.isMyProductPackagingPartialDataComplete,
        baseline.isPackagingDataCompleted
      )
    ) return packagingMessage("3a-2a");
   
    // 4a-1
    if (
      myProduct.isFormulationDataCompleted &&
      myProduct.isMyProductPackagingPartialDataComplete &&
      !myProduct.isCalculatedButtonClicked &&
      !isBaselinePresent
    ) return packagingMessage("4a-1");
   
    // 4a-2a
    if (
      myProduct.isFormulationDataCompleted &&
      myProduct.isMyProductPackagingPartialDataComplete &&
      !myProduct.isCalculatedButtonClicked &&
      isBaselinePresent &&
      baseline &&
      allFalse(
        baseline.isFormulationDataCompleted,
        baseline.isMyProductPackagingPartialDataComplete,
        baseline.isPackagingDataCompleted
      )
    ) return packagingMessage("4a-2a");
   
    // 4a-3a
    if (
      myProduct.isFormulationDataCompleted &&
      myProduct.isMyProductPackagingPartialDataComplete &&
      !myProduct.isCalculatedButtonClicked &&
      isBaselinePresent &&
      baseline &&
      baseline.isCalculatedButtonClicked === false
    ) return packagingMessage("4a-3a");
   
    // 4b-1
    if (
      myProduct.isFormulationDataCompleted &&
      myProduct.isMyProductPackagingPartialDataComplete &&
      myProduct.isCalculatedButtonClicked &&
      !isBaselinePresent
    ) return baselineIncompleteMessage("4b-1");
   
    // 4b-2a
    if (
      myProduct.isFormulationDataCompleted &&
      myProduct.isMyProductPackagingPartialDataComplete &&
      myProduct.isCalculatedButtonClicked &&
      isBaselinePresent &&
      baseline &&
      baseline.isCalculatedButtonClicked === false
    ) return baselineIncompleteMessage("4b-2a");
   
    // 4b-3a
    if (
      myProduct.isFormulationDataCompleted &&
      myProduct.isMyProductPackagingPartialDataComplete &&
      myProduct.isCalculatedButtonClicked &&
      isBaselinePresent &&
      baseline &&
      baseline.isCalculatedButtonClicked === false
    ) return baselineIncompleteMessage("4b-3a");
   
    // 4b-4a
    if (
      myProduct.isFormulationDataCompleted &&
      myProduct.isMyProductPackagingPartialDataComplete &&
      myProduct.isCalculatedButtonClicked &&
      isBaselinePresent &&
      baseline &&
      baseline.isFormulationDataCompleted &&
      baseline.isBaselinePackagingPartialDataComplete &&
      !baseline.isCalculatedButtonClicked
    ) return baselineIncompleteMessage("4b-4a");
   
    // 4b-4b (success)
    if (
      allTrue(
        myProduct.isFormulationDataCompleted,
        myProduct.isMyProductPackagingPartialDataComplete,
        myProduct.isCalculatedButtonClicked,
        ...[
          "isFormulationCalculated",
          "isFormulationEOLCalculated",
          "isPackagingCalculated",
          "isGreenChemistryCalculated",
          "isGreenChemistryRollupCalculated",
          "isLCACalculated",
          "isSustainabilityPackagingCalculated",
          "isSustainabilityPackagingRollupCalculated",
          "isSpiceCalculated",
        ].map(k => myProduct[k])
      ) &&
      isBaselinePresent &&
      baseline &&
      allTrue(
        baseline.isFormulationDataCompleted,
        baseline.isBaselinePackagingPartialDataComplete,
        baseline.isCalculatedButtonClicked,
        baseline.isFormulationCalculated,
        baseline.isFormulationEOLCalculated,
        baseline.isPackagingCalculated,
        baseline.isGreenChemistryCalculated,
        baseline.isGreenChemistryRollupCalculated,
        baseline.isLCACalculated,
        baseline.isSustainabilityPackagingCalculated,
        baseline.isSustainabilityPackagingRollupCalculated,
        baseline.isSpiceCalculated
      )
    ) return successMessage;
   
    // 4b-5: baseline calculation error (myProduct OK)
    if (
      allTrue(
        myProduct.isFormulationDataCompleted,
        myProduct.isMyProductPackagingPartialDataComplete,
        myProduct.isCalculatedButtonClicked,
        ...[
          "isFormulationCalculated",
          "isFormulationEOLCalculated",
          "isPackagingCalculated",
          "isGreenChemistryCalculated",
          "isGreenChemistryRollupCalculated",
          "isLCACalculated",
          "isSustainabilityPackagingCalculated",
          "isSustainabilityPackagingRollupCalculated",
          "isSpiceCalculated",
        ].map(k => myProduct[k])
      ) &&
      isBaselinePresent &&
      baseline &&
      allTrue(
        baseline.isFormulationDataCompleted,
        baseline.isBaselinePackagingPartialDataComplete,
        baseline.isCalculatedButtonClicked
      ) &&
      isCalculationIncomplete(baseline)
    ) return baselineCalcErrorMessage("4b-5");
   
    // 5-4b: myProduct calc failed, baseline OK
    if (
      isCalculationIncomplete(myProduct) &&
      isBaselinePresent &&
      baseline &&
      allTrue(
        baseline.isFormulationDataCompleted,
        baseline.isBaselinePackagingPartialDataComplete,
        baseline.isCalculatedButtonClicked,
        baseline.isFormulationCalculated,
        baseline.isFormulationEOLCalculated,
        baseline.isPackagingCalculated,
        baseline.isGreenChemistryCalculated,
        baseline.isGreenChemistryRollupCalculated,
        baseline.isLCACalculated,
        baseline.isSustainabilityPackagingCalculated,
        baseline.isSustainabilityPackagingRollupCalculated,
        baseline.isSpiceCalculated
      )
    ) return calculationFailedMessage("5-4b");
   
    // 5-5: general failure (either side has calc issue)
    if (
      (isCalculationIncomplete(myProduct)) ||
      (isBaselinePresent &&
        baseline &&
        allTrue(
          baseline.isFormulationDataCompleted,
          baseline.isBaselinePackagingPartialDataComplete,
          baseline.isCalculatedButtonClicked
        ) &&
        isCalculationIncomplete(baseline))
    ) return calculationFailedMessage("5-5");
   
    return undefined;
  }