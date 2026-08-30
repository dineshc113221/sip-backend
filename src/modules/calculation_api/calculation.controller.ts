/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Request, Response } from "express";
import { config } from "../../data/config.js";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import _ from "lodash"; // for deep merge
import { initializeProductController } from "../product/product.controller.js";
import {
  SFNClient,
  StartSyncExecutionCommand,
  StartSyncExecutionCommandOutput,
} from "@aws-sdk/client-sfn";
import pLimit from "p-limit";
import CalculationsModel, {
  initializeCalculationModel,
} from "./calculation.model.js";
import CalculationErrorLogModel, {
  initializeCalculationErrorLogModel,
} from "./calculation-error-log.model.js";
import initializeEmailController from "../email/email.controller.js";
import { getMutexKey, getOrCreateMutex } from "./mutex.js";
import calculation_scenario from "./calculation_scenario.js";
import { toComponentSubcomponentTreeInPlace } from "../product/structuring_destructing_packaging.js";

interface UpsertInput {
  input: Record<string, any[]>;
  output: Record<string, any[]>;
}

interface UpsertMeta {
  productId: string;
  assessmentId: string;
  assessmentsType: string;
  assessmentType: string;
}

class CalculationController {
  private model;
  private calculationErrorModel;
  constructor(model, calculationErrorModel) {
    this.model = model;
    this.calculationErrorModel = calculationErrorModel;
  }

  STEP_FUCTIONS_LIST = [
    {
      name: "distribution",
      arn: config.DISTRIBUTION,
    },
    {
      name: "formula_end_of_life",
      rawMaterialsNeeded: true,
      arn: config.FORMULA_EOL,
    },
    {
      name: "packproduction",
      arn: config.PACK_PRODUCTION,
    },
    {
      name: "packagingeol",
      arn: config.PACKAGING_EOL,
    },
    {
      name: "rawmaterials",
      rawMaterialsNeeded: true,
      arn: config.RAW_MATERIAL,
    },
    {
      name: "usephase",
      arn: config.USE_PHASE,
    },
    {
      name: "manufacturing",
      arn: config.MANUFACTURING,
    },
    {
      name: "totallca",
      arn: config.TOTAL_LCA,
    },
    {
      name: "sustainablepackaging-recyclable-content",
      arn: config.SUSTAINABLE_RECYCLE_READY,
    },
    {
      name: "sustainablepackaging-pcr",
      arn: config.SUSTAINABLE_PCR_CONTENT,
    },
    {
      name: "sustainablepackaging-material-efficiency",
      arn: config.SUSTAINABLE_MATERIAL_EFFICIENCY,
    },
    {
      name: "sustainablepackaging-recyclability-disruptors",
      arn: config.SUSTAINABLE_RECYCLABILITY_DISRUPTORS,
    },
    {
      name: "sustainablepackaging-rollup-compare",
      arn: config.SUSTAINABLE_TOTAL_ROLLUP,
    },
    {
      name: "renewable_feedback_stock",
      arn: config.RENEWABLE_FEEDSTOCK_ORIGIN,
    },
    {
      name: "watchlist",
      arn: config.WATCHLIST,
    },
    {
      name: "gaia_score",
      arn: config.GAIA_SCORE,
    },
    {
      name: "green_chemistry_rollup",
      arn: config.GREEN_CHEMISTRY_ROLLUP,
    },
    {
      name: "baseline_green_chemistry_rollup",
      arn: config.GREEN_CHEMISTRY_ROLLUP,
    },
  ];

  stepFunctionCache = new Map<string, { result; timestamp: number }>();

  async checkAllStepFunctionIsPresent(
    productId: string,
    assessmentId: string,
    assessmentsType: string,
  ) {
    let formulaData = await this.model.findOne({ productId });
    if (formulaData) {
      formulaData = formulaData.toJSON();
      const dataOuputForAssessment = formulaData.formula_input_output.output[
        assessmentsType
      ].find((item: { assessmentId: string }) => {
        if (item.assessmentId === assessmentId) return item;
      });
      if (dataOuputForAssessment == undefined) {
        return false;
      } else {
        if (
          Object.prototype.hasOwnProperty.call(
            dataOuputForAssessment,
            "formula_end_of_life",
          ) &&
          Object.prototype.hasOwnProperty.call(
            dataOuputForAssessment,
            "usephase",
          ) &&
          Object.prototype.hasOwnProperty.call(
            dataOuputForAssessment,
            "distribution",
          ) &&
          Object.prototype.hasOwnProperty.call(
            dataOuputForAssessment,
            "packproduction",
          ) &&
          Object.prototype.hasOwnProperty.call(
            dataOuputForAssessment,
            "packagingeol",
          ) &&
          Object.prototype.hasOwnProperty.call(
            dataOuputForAssessment,
            "rawmaterials",
          ) &&
          Object.prototype.hasOwnProperty.call(
            dataOuputForAssessment,
            "manufacturing",
          )
        ) {
          return true;
        }
        return false;
      }
    }
  }
  async delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  spiceToTruMapping(details){
        const packagingData = (details?.packaging_level ?? []).map(
        (pack: any) => {
          const components = (pack?.components ?? []).map((c: any) => {
            const sub_components = (c?.sub_components ?? []).map((sc: any) => {
              const materialList = (sc?.material ?? []).map((m: any) => ({
                ...m,
                material_name:m.tru_material_name,
                converting_process:m.tru_converting_process,
              }));

              return {
                ...sc,
                material: materialList,
                componentId: c?._id,
                finishing_process: sc.tru_finishing_process,
              };
            });

            return {
              ...c,
              sub_components,
            };
          });

          return {
            ...pack,
            components,
            rateOfRestitution: pack?.productEvaluation,
          };
        },
      );
      return {
      ...details,
      packaging_level: packagingData,
    };
  }

  // Exponential backoff with jitter for retrying
  async exponentialBackoff(attempts: number) {
    const baseDelay = 200;
    const maxDelay = 5000;
    const jitter = Math.random() * 100;
    const delay =
      Math.min(maxDelay, baseDelay * Math.pow(2, attempts)) + jitter;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  async invokeEmailController(sfName: string, assessmentId, user, data) {
    try {
      const emailBody = `There is an error occured when executing the step function "${sfName}". ${
        assessmentId
          ? 'The effected assessment id is "' + assessmentId + '".'
          : ""
      } The step function's ARN is "${sfName}". Please check the stringified JSON object for brief about the error. </br></br>`;
      const emailHeading = `Error occured in the step function - ${sfName}`;
      if (!user) {
        throw new Error("User information not provided.");
      }
      const emailController = initializeEmailController();
      const body: string = emailBody + this.safeStringify(data);
      (await emailController).send(
        config.SUPPORT_EMAIL,
        user.email,
        emailHeading,
        body,
      );
    } catch (error) {
      console.log("Failed to send error email", error);
    }
  }

  // Circular-safe JSON stringify. AWS SDK errors carry a $response.body
  // (IncomingMessage -> TLSSocket) which contains circular references and
  // would otherwise make JSON.stringify throw "Converting circular structure".
  safeStringify(data: unknown): string {
    const seen = new WeakSet();
    try {
      return JSON.stringify(
        data,
        (_key, value) => {
          if (value instanceof Error) {
            return { name: value.name, message: value.message };
          }
          if (typeof value === "object" && value !== null) {
            if (seen.has(value)) {
              return "[Circular]";
            }
            seen.add(value);
          }
          return value;
        },
        2,
      );
    } catch {
      return String(data);
    }
  }
  batchArray<T>(array: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < array.length; i += batchSize) {
      batches.push(array.slice(i, i + batchSize));
    }
    return batches;
  }
  // Utility function to filter the data and pass only necessary fields to Step Functions
  filterNecessaryData(
    data: {
      productId: string;
      assessmentId: string;
      assessmentType: string;
      assessmentId2: string;
      assessmentType2: string;
      fmlCode: string;
      fg_spec: string;
      fg_revision: string;
      sales_country: string;
      production_country: string;
      net_content: string;
      formula_id: string;
      ConsumablesUsed: string;
      productSegment: string;
      productSubSegment: string;
      useDose: string;
      net_content_unit: string;
      productEvaluation: string;
      useScenario:string;
      user: { name: string; email: string };
      raw_materials: string;
      packaging_level: string;
    },
    stepFunctionName: string,
  ) {
    const filteredData = {
      productId: data.productId,
      assessmentId: data.assessmentId,
      assessmentType: data.assessmentType.toLowerCase(),
      assessmentId2: Object.prototype.hasOwnProperty.call(data, "assessmentId2")
        ? data.assessmentId2
        : "",
      assessmentType2: Object.prototype.hasOwnProperty.call(
        data,
        "assessmentType2",
      )
        ? data.assessmentType2
        : "",
      formulaId: Object.prototype.hasOwnProperty.call(data, "fmlCode")
        ? data.fmlCode
        : "",
      fg_spec: Object.prototype.hasOwnProperty.call(data, "fg_spec")
        ? data.fg_spec
        : "",
      fg_revision: Object.prototype.hasOwnProperty.call(data, "fg_revision")
        ? data.fg_revision
        : "",
      sales_country: Object.prototype.hasOwnProperty.call(data, "sales_country")
        ? data.sales_country
        : "",
      production_country: Object.prototype.hasOwnProperty.call(
        data,
        "production_country",
      )
        ? data.production_country
        : "",
      net_content: Object.prototype.hasOwnProperty.call(data, "net_content")
        ? data.net_content
        : "",
      formula_id: Object.prototype.hasOwnProperty.call(data, "formula_id")
        ? data.formula_id
        : "",
      ConsumablesUsed: Object.prototype.hasOwnProperty.call(
        data,
        "ConsumablesUsed",
      )
        ? data.ConsumablesUsed
        : "0",
      productSegment: Object.prototype.hasOwnProperty.call(
        data,
        "productSegment",
      )
        ? data.productSegment
        : "",
      productSubSegment: Object.prototype.hasOwnProperty.call(
        data,
        "productSubSegment",
      )
        ? data.productSubSegment
        : "",
      claimedVolumed: Object.prototype.hasOwnProperty.call(data, "net_content")
        ? data.net_content
        : "",
      useDose: Object.prototype.hasOwnProperty.call(data, "useDose")
        ? data.useDose
        : "",
      net_content_unit: Object.prototype.hasOwnProperty.call(
        data,
        "net_content_unit",
      )
        ? data.net_content_unit
        : "",
      productEvaluation: Object.prototype.hasOwnProperty.call(
        data,
        "productEvaluation",
      )
        ? data.productEvaluation
        : "0",
      rateOfRestitution: Object.prototype.hasOwnProperty.call(
        data,
        "productEvaluation",
      )
        ? data.productEvaluation
        : "0",
        useScenario: Object.prototype.hasOwnProperty.call(
          data,
          "useScenario"
        )
        ? data.useScenario
        :"",
      user: {
        name: data.user.name,
        email: data.user.email,
      },
    };

    if (stepFunctionName === "rawmaterials") {
      filteredData["raw_materials"] = data.raw_materials;
    }
    if (stepFunctionName === "formula_end_of_life") {
      filteredData["raw_materials"] = data.raw_materials;
    }
   if (
  ["renewable_feedback_stock", "watchlist", "gaia_score"]
    .includes(stepFunctionName)
) {
  filteredData["raw_materials"] = data.raw_materials;
}
    if (
      stepFunctionName === "packagingeol" ||
      stepFunctionName === "distribution" ||
      stepFunctionName === "packproduction" ||
      stepFunctionName === "sustainablepackaging-recyclable-content" ||
      stepFunctionName === "sustainablepackaging-pcr" ||
      stepFunctionName === "sustainablepackaging-material-efficiency" ||
      stepFunctionName === "sustainablepackaging-recyclability-disruptors"
    ) {
      filteredData["packaging_level"] = data.packaging_level;
    }
    return filteredData;
  }
  // Function to invoke AWS Step Function with retry logic and caching
  async invokeStepFunction(
    sfObject: { name: string; arn: string },
    data,
    sfnClient: SFNClient,
    batchSize = 1,
    maxAttempts = 3,
  ) {
    // Determine if batching is required
    const isBatching =
      sfObject.name === "rawmaterials" ||
      sfObject.name === "formula_end_of_life";
    const batches = isBatching
      ? this.batchArray(data.raw_materials || [], batchSize)
      : [data];

    const limit = pLimit(30); // Limit concurrency for Step Function invocations to 30

    // Invoke the step function with batching and retries
    const results = await Promise.allSettled(
      batches.map((batch) =>
        limit(async () => {
          const filteredData = isBatching
            ? this.filterNecessaryData(
                { ...data, raw_materials: batch },
                sfObject.name,
              )
            : this.filterNecessaryData(data, sfObject.name);

          let attempts = 0;
          while (attempts < maxAttempts) {
            try {
              const command = new StartSyncExecutionCommand({
                stateMachineArn: sfObject.arn,
                input: JSON.stringify(filteredData),
              });
              const result:
                | StartSyncExecutionCommandOutput
                | any = await sfnClient.send(command);
              if (typeof result.done != "undefined" && result.done == false) {
                let user: object | null = null;
                if (data.user) {
                  user = data.user;
                }

                this.invokeEmailController(
                  sfObject.name,
                  data.assessmentId,
                  user,
                  result,
                );
              }

              return { input: filteredData, output: result };
            } catch (error) {
              let user: object | null = null;
              if (data.user) {
                user = data.user;
              } else {
                user = null;
              }
              if (error.name === "ThrottlingException") {
                await this.exponentialBackoff(attempts++);
              } else {
                this.invokeEmailController(
                  sfObject.name,
                  data.assessmentId,
                  user,
                  error,
                );
                throw error;
              }
            }
          }
          throw new Error(
            `Failed to invoke after ${maxAttempts} attempts: ${sfObject.name}`,
          );
        }),
      ),
    );

    return results;
  }
  upsertArray(
    array: { assessmentId: string }[],
    newData: { assessmentId: string },
  ) {
    const index = array.findIndex(
      (item: { assessmentId: string }) =>
        item.assessmentId === newData.assessmentId,
    );
    if (index !== -1) {
      array[index] = { ...array[index], ...newData };
    } else {
      array.push(newData);
    }
    return array;
  }
  // Function to fetch data from the cache or database
  async getDataFromDB(
    productId: string,
    assessmentId: string,
    assessmentType: string,
  ) {
    // If cache miss, fetch from the database
    let existingDatas = await this.model.findOne({ productId });
    if (existingDatas) {
      existingDatas = existingDatas.toJSON();
      const dataOuputForAssessment = existingDatas.formula_input_output.output[
        assessmentType
      ].find((item: { assessmentId: string }) => {
        if (item.assessmentId === assessmentId) return item;
      });

      const dataInputForAssessment = existingDatas.formula_input_output.input[
        assessmentType
      ].find((item: { assessmentId: string }) => {
        if (item.assessmentId === assessmentId) return item;
      });
      let formulasData;
      if (dataInputForAssessment !== undefined) {
        formulasData = {
          formula_input_output: {
            output: { [`${assessmentType}`]: [dataOuputForAssessment] },
            input: { [`${assessmentType}`]: [dataInputForAssessment] },
          },
        };
      }
      // Cache the fetched data
      return {
        existingData: formulasData,
        product: existingDatas,
      }; // Return the cached data
    }
    return { existingData: null, product: null }; // No data found in the database
  }
  // Optimized function to upsert input/output data to the database with bulk operations
  async upsertDataToDB(
    finalData: UpsertInput,
    data: UpsertMeta,
  ): Promise<string> {
    const MAX_RETRIES = 3;
    const RETRY_DELAY_MS = 200;
    const assessment_type = data.assessmentType;
    const assessmentTypeKey =
      data["stepFunctionList"][0] === "baseline_green_chemistry_rollup"
        ? data["assessmentType2"].toLowerCase()
        : data.assessmentType.toLowerCase();
    const inputItem = {
      ...finalData.input[assessmentTypeKey]?.[0],
      assessmentId:
        data["stepFunctionList"][0] === "baseline_green_chemistry_rollup"
          ? data["assessmentId2"]
          : data.assessmentId,
      updatedAt: new Date(),
    };

    const outputItem = {
      ...finalData.output[assessmentTypeKey]?.[0],
      assessmentId:
        data["stepFunctionList"][0] === "baseline_green_chemistry_rollup"
          ? data["assessmentId2"]
          : data.assessmentId,
      updatedAt: new Date(),
    };

    // const mergeOrInsert = (arr: any, newItem: any): any[] => {
    //   const idx = arr.findIndex((x) => x.assessmentId === newItem.assessmentId);
    //   if (idx !== -1) {
    //     arr[idx] = { ...arr[idx], ...newItem };
    //   } else {
    //     assessment_type !== "baseline" ? arr.push(newItem) : (arr = newItem);
    //   }
    //   return arr;
    // };

    const deepMerge = (target: any, source: any): any => {
      for (const key of Object.keys(source)) {
        const value = source[key];
        if (
          value &&
          typeof value === "object" &&
          !Array.isArray(value) &&
          typeof target[key] === "object"
        ) {
          target[key] = deepMerge(target[key] ?? {}, value);
        } else {
          target[key] = value; // primitives & arrays overwrite
        }
      }
      return target;
    };

    const mergeOrInsert = (arr: any, newItem: any): any => {
      // Ensure we are working with an array
      const data = Array.isArray(arr) ? [...arr] : [];

      if (assessment_type === "baseline") {
        // Always deep-merge into index 0
        if (assessmentTypeKey !== "baseline") {
          const idx = data.findIndex(
            (x: any) => x.assessmentId === newItem.assessmentId,
          );
          if (idx !== -1) {
            data[idx] = { ...data[idx], ...newItem };
          } else {
            data.push(newItem);
          }
          return data;
        } else {
          const existing0 = data[0] ?? {};
          data[0] = deepMerge({ ...existing0 }, newItem);
          data.length = 1; // keep only one baseline item
          return data;
        }
      }

      // Non-baseline: shallow merge by assessmentId
      const idx = data.findIndex(
        (x: any) => x.assessmentId === newItem.assessmentId,
      );
      if (idx !== -1) {
        data[idx] = { ...data[idx], ...newItem };
      } else {
        data.push(newItem);
      }

      return data;
    };

    const key = getMutexKey(data.productId, data.assessmentId);
    const mutex = getOrCreateMutex(key);

    return await mutex.runExclusive(async () => {
      let attempt = 0;

      while (attempt < MAX_RETRIES) {
        try {
          await this.model.updateOne(
            { productId: data.productId },
            {
              $setOnInsert: {
                productId: data.productId,
                formula_input_output: {
                  input:
                    data["assessmentType"] === "baseline"
                      ? { assessmentTypeKey: {} }
                      : { [assessmentTypeKey]: [] },
                  output:
                    data["assessmentType"] === "baseline"
                      ? { assessmentTypeKey: {} }
                      : { [assessmentTypeKey]: [] },
                },
              },
            },
            { upsert: true,new:true }
          );

          const doc = await this.model
            .findOne({ productId: data.productId })
            .lean();

          const inputArr =
            doc?.formula_input_output?.input?.[assessmentTypeKey] || [];
          const outputArr =
            doc?.formula_input_output?.output?.[assessmentTypeKey] || [];

          const updatedInput = mergeOrInsert(inputArr, inputItem);
          const updatedOutput = mergeOrInsert(outputArr, outputItem);

          await this.model.findOneAndUpdate(
            { productId: data.productId },
            {
              $set: {
                [`formula_input_output.input.${assessmentTypeKey}`]: updatedInput,
                [`formula_input_output.output.${assessmentTypeKey}`]: updatedOutput,
                updatedAt: new Date(),
              },
            },
            { upsert: true,new:true }
          );

          console.log(
            `Upsert success for ${data.productId} - ${data.assessmentId}`,
          );
          return "Success";
        } catch (error) {
          attempt++;
          console.warn(`Upsert retry ${attempt}/${MAX_RETRIES}`, error.message);
          await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * attempt));
        }
      }

      throw new Error(`Upsert failed after ${MAX_RETRIES} retries`);
    });
  }
  calculateTotals(
    rawMaterialsBatch,
    finalData,
    assessmentType: string,
    stepFunctionName: string,
  ) {
    const {
      raw_materials = [],
      eol_formula_total = {},
      eol_total_part_1 = {},
    } = rawMaterialsBatch || {};
    let eol_fml_final_27 = {
      climate_change_amount: 0.0,
      ozone_depletion_amount: 0.0,
      ionising_radiation_amount: 0.0,
      photochemical_ozone_formation_amount: 0.0,
      particulate_matter_amount: 0.0,
      human_toxicity_non_cancer_amount: 0.0,
      human_toxicity_cancer_amount: 0.0,
      acidification_amount: 0.0,
      eutrophication_freshwater_amount: 0.0,
      eutrophication_marine_amount: 0.0,
      eutrophication_terrestrial_amount: 0.0,
      ecotoxicity_freshwater_amount: 0.0,
      land_use_amount: 0.0,
      water_use_amount: 0.0,
      resource_use_fossils_amount: 0.0,
      resource_use_minerals_and_metals_amount: 0.0,
    };
    let formula_total = {
      climate_change_amount: 0.0,
      ozone_depletion_amount: 0.0,
      ionising_radiation_amount: 0.0,
      photochemical_ozone_formation_amount: 0.0,
      particulate_matter_amount: 0.0,
      human_toxicity_non_cancer_amount: 0.0,
      human_toxicity_cancer_amount: 0.0,
      acidification_amount: 0.0,
      eutrophication_freshwater_amount: 0.0,
      eutrophication_marine_amount: 0.0,
      eutrophication_terrestrial_amount: 0.0,
      ecotoxicity_freshwater_amount: 0.0,
      land_use_amount: 0.0,
      water_use_amount: 0.0,
      resource_use_fossils_amount: 0.0,
      resource_use_minerals_and_metals_amount: 0.0,
    };
    formula_total =
      stepFunctionName === "rawmaterials"
        ? Object.prototype.hasOwnProperty.call(
            finalData.output[assessmentType.toLowerCase()][0],
            stepFunctionName,
          )
          ? finalData?.output[assessmentType.toLowerCase()][0][stepFunctionName]
              .formula_production_ef_total
          : formula_total
        : Object.prototype.hasOwnProperty.call(
            finalData.output[assessmentType.toLowerCase()][0],
            stepFunctionName,
          )
        ? finalData?.output[assessmentType.toLowerCase()][0][stepFunctionName]
            .eol_formula_total
        : formula_total;
    if (stepFunctionName === "formula_end_of_life") {
      eol_fml_final_27 =
        finalData?.output[assessmentType.toLowerCase()][0].length > 0
          ? finalData?.output[assessmentType.toLowerCase()][0][stepFunctionName]
              .finalCalculationData.eol_formula_final
          : eol_fml_final_27;
    }
    for (const key of Object.keys(formula_total)) {
      if (stepFunctionName === "rawmaterials") {
        for (const rmValue of raw_materials) {
          formula_total[key] =
            formula_total[key] + rmValue.raw_material_ef_total[key];
        }
        eol_fml_final_27["total"] =
          eol_fml_final_27["total"] + formula_total[key];
      } else if (
        stepFunctionName === "formula_end_of_life" &&
        Object.keys(eol_total_part_1).length > 0
      ) {
        formula_total[key] = formula_total[key] + eol_formula_total[0].x[key];
        eol_fml_final_27[key] = formula_total[key] + eol_total_part_1[key];
        eol_fml_final_27["total"] =
          eol_fml_final_27["total"] + eol_fml_final_27[key];
      }
    }
    return {
      formula_total: formula_total,
      eol_formula_final: eol_fml_final_27,
    };
  }
  async checkingResultAndTriggeringEmailIfNeeded(results) {
    if (Array.isArray(results) && results.length) {
      results.forEach(async (result) => {
        if (
          typeof result != "undefined" &&
          typeof result.value != "undefined" &&
          Array.isArray(result.value) &&
          result.value.length
        ) {
          result.value.forEach(async (value) => {
            if (
              typeof value.value != "undefined" &&
              typeof value.value.output != "undefined" &&
              typeof value.value.output.output != "undefined"
            ) {
              const executionARN = value.value.output.executionArn;
              const outputJSON = value.value.output.output;
              const inputJSON = value.value.output.input;
              try {
                const output = JSON.parse(outputJSON);
                const input = JSON.parse(inputJSON);
                if (typeof output.done != "undefined" && output.done == false) {
                  const errorDataToLog = {
                    input,
                    productId: input.productId,
                    assessmentId: input.assessmentId,
                    assessmentType: input.assessmentType,
                    output,
                    executionARN,
                  };
                  const errorModel = new this.calculationErrorModel(
                    errorDataToLog,
                  );
                  await errorModel.save(errorDataToLog);
                  // here we can check if individual step function execution is failed or not
                  await this.invokeEmailController(
                    output.type,
                    input.assessmentId,
                    input.user,
                    errorDataToLog,
                  );
                }
              } catch (error) {
                console.log("Ignorable error", error);
              }
            }
          });
        }
      });
    }
  }
  async lambda_handler(data) {
    const stepFunctionNames = data["stepFunctionList"];
    const sfnClient = new SFNClient({
      region: "us-east-1",
      credentials: {
        accessKeyId: config.AWS_ACCESS_KEY,
        secretAccessKey: config.AWS_SECRET_KEY,
      },
    });
    try {
      const limit = pLimit(100); // Limit concurrency to 100 Step Functions at a time
      // Use Promise.allSettled to handle both successful and failed step function invocations
      const stepFunctionObjects = stepFunctionNames.map(
        (stepFunctionName: string) => {
          const sfObject = this.STEP_FUCTIONS_LIST.find(
            (sf) => sf.name === stepFunctionName,
          );
          if (!sfObject) {
            throw new Error(
              `Step function with name ${stepFunctionName} not found in STEP_FUNCTIONS_LIST`,
            );
          }
          return sfObject;
        },
      );

      // Use Promise.allSettled to handle both successful and failed step function invocations
      const results = await Promise.allSettled(
        stepFunctionObjects.map((sfObject: { name: string; arn: string }) =>
          limit(() => this.invokeStepFunction(sfObject, data, sfnClient)),
        ),
      );
      await this.checkingResultAndTriggeringEmailIfNeeded(results);
      const rawMaterialsArray = [];
      const formulaEOLRawMaterialsArray = [];

      let finalData = {
        input: { experimental: [{}], baseline: [{}], final: [{}] },
        output: { experimental: [{}], baseline: [{}], final: [{}] },
      };

      // Process the results
      results.forEach((result, index) => {
        if (
          result.status === "fulfilled" &&
          !Object.prototype.hasOwnProperty.call(result.value, "data")
        ) {
          result.value.flat().forEach((batchResult) => {
            const parseOutputData = JSON.parse(
              batchResult.value.output?.output,
            );
            const stepFunctionName = stepFunctionObjects[index].name;
            finalData.input[data.assessmentType.toLowerCase()][0][
              stepFunctionName
            ] = parseOutputData.data.input;
            if (
              stepFunctionName === "rawmaterials" ||
              stepFunctionName === "formula_end_of_life"
            ) {
              if (parseOutputData.type === "rawmaterials") {
                const rawMaterialsBatch =
                  parseOutputData.data.output.raw_materials || [];
                rawMaterialsBatch.forEach((rawMaterial) => {
                  rawMaterialsArray.push(rawMaterial);
                });
              } else {
                const rawMaterialsBatch =
                  parseOutputData.data.output.raw_materials || [];
                rawMaterialsBatch.forEach((rawMaterial) => {
                  formulaEOLRawMaterialsArray.push(rawMaterial);
                });
              }
              const { formula_total, eol_formula_final } = this.calculateTotals(
                parseOutputData.data.output,
                finalData,
                data.assessmentType.toLowerCase(),
                stepFunctionName,
              );
              stepFunctionName === "formula_end_of_life"
                ? (finalData.output[data.assessmentType.toLowerCase()][0][
                    stepFunctionName
                  ] = {
                    ...parseOutputData.data.output,
                    raw_materials: formulaEOLRawMaterialsArray,
                    eol_formula_total: formula_total,
                    eol_formula_final: eol_formula_final,
                  })
                : stepFunctionName === "rawmaterials"
                ? (finalData.output[data.assessmentType.toLowerCase()][0][
                    stepFunctionName
                  ] = {
                    ...parseOutputData.data.output,
                    raw_materials: rawMaterialsArray,
                    formula_production_ef_total: formula_total,
                  })
                : (finalData.output[data.assessmentType.toLowerCase()][0][
                    stepFunctionName
                  ] = {
                    ...parseOutputData.data.output,
                    raw_materials: rawMaterialsArray,
                  });
            } else {
              if (stepFunctionNames[0] === "baseline_green_chemistry_rollup") {
                finalData.output[data.assessmentType2.toLowerCase()][0][
                  stepFunctionName
                ] = parseOutputData.data.output;
              } else {
                finalData.output[data.assessmentType.toLowerCase()][0][
                  stepFunctionName
                ] = parseOutputData.data.output;
              }
            }
          });
        }
      });
      finalData = toComponentSubcomponentTreeInPlace(finalData);
      await this.upsertDataToDB(finalData, data);
      // Save the final data structure to the database, with cache management
      return "Success";
    } catch (error) {
      console.log(`Error in Calculation`, error);
      return "Failed";
    }
  }
  // async getSpiceComponentDetails(data: object): Promise<undefined | object> {
  //   try {
  //     const payload = data;
  //     const lambda = new LambdaClient({
  //       region: config.AWS_REGION,
  //       credentials: {
  //         accessKeyId: config.AWS_ACCESS_KEY,
  //         secretAccessKey: config.AWS_SECRET_KEY,
  //       },
  //     });

  //     const params = {
  //       FunctionName: config.SPICE_COMPONENT_FUNCTION_URL,
  //       Payload: JSON.stringify(payload),
  //     };
  //     //Invoke the lambda function
  //     const command = new InvokeCommand(params);
  //     const spiceData = await lambda.send(command);
  //     return spiceData;
  //   } catch (err) {
  //     return { error: err };
  //   }
  // }
  async calculationResult(req: Request, res: Response): Promise<void> {
    try {
      const assessmentsType = req.params.assessmentType;
      const assessmentId = req.params.assessmentId;
      const productId = req.params.productId;
      const query = {
        isDelete: "false",
        productId: productId,
        [`formula_input_output.output.${assessmentsType}.assessmentId`]: assessmentId,
      };
      let calculatedResult = {};
      let calculationMessage;
      let doc = await this.model.findOne(query);
      if (doc !== null) {
        doc = doc.toJSON();
        const productController = await initializeProductController();
        const calculationDataFlags = await productController.calculationScenariosData(
          assessmentId,
          assessmentsType,
        );
        if (assessmentsType === "baseline") {
          doc["formula_input_output"]["input"]["baseline"].forEach((item) => {
            if (item.assessmentId === assessmentId) {
              calculatedResult = {
                ...calculatedResult,
                baselinePackaging: item.packproduction,
              };
            }
          });
          calculationMessage = {
            error: false,
            message:
              "Enter both your formulation and packaging data and hit 'calculate' to view results",
            scenario: "2a-1",
            data: calculatedResult,
          };
          res.status(200).json(calculationMessage);
        } else {
          calculationMessage = await calculation_scenario(calculationDataFlags);
          if (calculationMessage.error === false) {
            const filteredResults = doc["formula_input_output"]["output"][
              assessmentsType
            ].map((result: { assessmentId: string }) => {
              return result.assessmentId === assessmentId
                ? { [`${assessmentsType}`]: result }
                : {};
            });
            const myProductPackaging = doc["formula_input_output"]["input"][
              assessmentsType
            ].map((result: { assessmentId: string; packproduction }) => {
              return result.assessmentId === assessmentId
                ? result["sustainablepackaging-pcr"]
                : {};
            });

            if (filteredResults.length > 0) {
              const filteredResultsData = filteredResults.filter(
                (asssessment: object) => {
                  if (Object.keys(asssessment).length > 0) {
                    return asssessment;
                  }
                },
              );
              calculatedResult = filteredResultsData.reduce(
                (assessmentDetails: object) => {
                  return assessmentDetails;
                },
              );
              if (
                !calculationMessage.isBaselineSkipped &&
                Object.prototype.hasOwnProperty.call(
                  doc["formula_input_output"]["output"],
                  "baseline",
                )
              ) {
                const baselineResult =
                  doc["formula_input_output"]["output"]["baseline"];

                const baselinePackaging =
                  doc["formula_input_output"]["input"]["baseline"];
                calculatedResult = {
                  ...calculatedResult,
                  isBaselinePresent: true,
                  baseline: baselineResult.reduce((baselineData: object) => {
                    return baselineData;
                  }),
                  myProductPackaging: myProductPackaging.filter(
                    (myProductPackagingData: object) => {
                      if (Object.keys(myProductPackagingData).length > 0) {
                        return myProductPackagingData;
                      }
                    },
                  )[0],
                  baselinePackaging:
                    baselinePackaging[0]["sustainablepackaging-pcr"],
                };
              } else {
                calculatedResult = {
                  ...calculatedResult,
                  baseline: {},
                  myProductPackaging: myProductPackaging.filter(
                    (myProductPackagingData: object) => {
                      if (Object.keys(myProductPackagingData).length > 0) {
                        return myProductPackagingData;
                      }
                    },
                  )[0],
                  baselinePackaging: {},
                  isBaselinePresent: false,
                  isBaselineSkipped: calculationMessage.isBaselineSkipped === true,
                };
              }

              calculationMessage = {
                ...calculationMessage,
                data: calculatedResult,
              };
              res.status(200).json(calculationMessage);
            } else {
              res.status(404).json(calculationMessage);
            }
          } else {
            res.status(404).json(calculationMessage);
          }
        }
      } else {
        res.status(404).json({
          error: true,
          message:
            "Enter both your formulation and packaging data and hit 'calculate' to view results",
          data: {},
        });
      }
    } catch (error) {
      res.status(500).send("Error while fetching result data");
    }
  }
  async formulationResult(req: Request, res: Response): Promise<void> {
    try {
      const assessmentsType = req.params.assessmentType;
      const assessmentId = req.params.assessmentId;
      const productId = req.params.productId;
      const query = {
        isDelete: "false",
        productId: productId,
        [`formula_input_output.output.${assessmentsType}.assessmentId`]: assessmentId,
      };

      let doc = await this.model.findOne(query);
      if (!doc) {
        res
          .status(404)
          .json({ message: "No result data found with the specified Id" });
      }
      doc = doc.toJSON();
      if (doc !== null) {
        const filteredResults = doc["formula_input_output"]["output"][
          assessmentsType
        ].map((result: { assessmentId: string }) => {
          return result.assessmentId === assessmentId
            ? { [`${assessmentsType}`]: result }
            : {};
        });
        let calculatedResult = {};
        if (filteredResults.length > 0) {
          const filteredResultsData = filteredResults.filter(
            (asssessment: object) => {
              if (Object.keys(asssessment).length > 0) {
                return asssessment;
              }
            },
          );
          calculatedResult = filteredResultsData.reduce(
            (assessmentDetails: object) => {
              return assessmentDetails;
            },
          );
          res.status(200).json(calculatedResult);
        } else {
          res
            .status(404)
            .json({ message: "No result data found with the specified Id" });
        }
      } else {
        res
          .status(404)
          .json({ message: "No result data found with the specified Id" });
      }
    } catch (error) {
      res.status(500).send("Error while fetching result data");
    }
  }
  async assessmentLogs(req: Request, res: Response): Promise<void> {
    try {
      const assessmentId = req.params.assessmentId;
      const productId = req.params.productId;
      const query = {
        productId: productId,
        assessmentId: assessmentId,
      };

      let doc = await this.calculationErrorModel.find(query);
      if (doc !== null) {
        res.status(200).json(doc);
      } else {
        res.status(404).json({ message: "No logs for specific assessment" });
      }
    } catch (error) {
      res.status(500).send("Error while fetching result data");
    }
  }
  async assessmentInputLogs(req: Request, res: Response): Promise<void> {
    try {
      const logId = req.params.id;
      const query = {
        _id: logId,
      };

      let doc = await this.calculationErrorModel.findOne(query);
      if (doc !== null) {
        res.status(200).json(doc);
      } else {
        res.status(404).json({ message: "No logs for specific assessment" });
      }
    } catch (error) {
      res.status(500).send("Error while fetching result data");
    }
  }
  async callPackagingThreeLambdas(data) {
    try {
      const lambda = new LambdaClient({
        region: config.AWS_REGION,
        credentials: {
          accessKeyId: config.AWS_ACCESS_KEY,
          secretAccessKey: config.AWS_SECRET_KEY,
        },
      });

      const invokeSingleLambda = async (functionName, payload) => {
        const command = new InvokeCommand({
          FunctionName: functionName, // use function name or ARN
          Payload: Buffer.from(JSON.stringify(payload)),
        });

        const response = await lambda.send(command);

        let parsedPayload = null;
        if (response.Payload) {
          const resultString = Buffer.from(response.Payload).toString();
          parsedPayload = resultString ? JSON.parse(resultString) : null;
        }

        return {
          statusCode: response.StatusCode,
          data: parsedPayload,
        };
      };

      const [lambda1, lambda2, lambda3] = await Promise.all([
        invokeSingleLambda(config.LAMBDA_Packaging_Production_1, data),
        invokeSingleLambda(config.LAMBDA_Distribution_2, data),
        invokeSingleLambda(config.LAMBDA_Packaging_EOL_3, data),
      ]);
      await Promise.all([
        // this.save_packaging_data(lambda1.data, data),
        // this.save_packaging_data(lambda2.data, data),
        // this.save_packaging_data(lambda3.data, data),
        this.save_packaging_data(
          lambda1.data,
          data
        ),
        this.save_packaging_data(
          lambda2.data,
          data
        ),
        this.save_packaging_data(
          lambda3.data,
          data
        ),
      ]);

      return "Success";
    } catch (error) {
      console.error("Error calling Lambda functions:", error);
      return {
        success: false,
        message: "Failed to call Lambda functions",
        error: error.message,
      };
    }
  }
  async upsertPackagingDataToDB(
    finalData: UpsertInput,
    data: UpsertMeta,
  ): Promise<string> {
    const MAX_RETRIES = 3;
    const RETRY_DELAY_MS = 200;
    const assessment_type = data.assessmentType;
    const productId = data.productId;
    const assessmentId = data.assessmentId;
    const inputItem = {
      ...finalData.input[assessment_type]?.[0],
      assessmentId: assessmentId,
      updatedAt: new Date(),
    };

    const outputItem = {
      ...finalData.output[assessment_type]?.[0],
      assessmentId: assessmentId,
      updatedAt: new Date(),
    };

    const deepMerge = (target: any, source: any): any => {
      for (const key of Object.keys(source)) {
        const value = source[key];
        if (
          value &&
          typeof value === "object" &&
          !Array.isArray(value) &&
          typeof target[key] === "object"
        ) {
          target[key] = deepMerge(target[key] ?? {}, value);
        } else {
          target[key] = value; // primitives & arrays overwrite
        }
      }
      return target;
    };

    const mergeOrInsert = (arr: any, newItem: any): any => {
      // Ensure we are working with an array
      const data = Array.isArray(arr) ? [...arr] : [];

      if (assessment_type === "baseline") {
        // Always deep-merge into index 0
        if (assessment_type !== "baseline") {
          const idx = data.findIndex(
            (x: any) => x.assessmentId === newItem.assessmentId,
          );
          if (idx !== -1) {
            data[idx] = { ...data[idx], ...newItem };
          } else {
            data.push(newItem);
          }
          return data;
        } else {
          const existing0 = data[0] ?? {};
          data[0] = deepMerge({ ...existing0 }, newItem);
          data.length = 1; // keep only one baseline item
          return data;
        }
      }

      // Non-baseline: shallow merge by assessmentId
      const idx = data.findIndex(
        (x: any) => x.assessmentId === newItem.assessmentId,
      );
      if (idx !== -1) {
        data[idx] = { ...data[idx], ...newItem };
      } else {
        data.push(newItem);
      }

      return data;
    };

    const key = getMutexKey(productId, data.assessmentId);
    const mutex = getOrCreateMutex(key);

    return await mutex.runExclusive(async () => {
      let attempt = 0;

      while (attempt < MAX_RETRIES) {
        try {
          await this.model.updateOne(
            { productId: productId },
            {
              $setOnInsert: {
                productId: productId,
                formula_input_output: {
                  input:
                    data["assessmentType"] === "baseline"
                      ? { assessment_type: {} }
                      : { [assessment_type]: [] },
                  output:
                    data["assessmentType"] === "baseline"
                      ? { assessment_type: {} }
                      : { [assessment_type]: [] },
                },
              },
            },
            { upsert: true },
          );

          const doc = await this.model.findOne({ productId: productId }).lean();

          const inputArr =
            doc?.formula_input_output?.input?.[assessment_type] || [];
          const outputArr =
            doc?.formula_input_output?.output?.[assessment_type] || [];

          const updatedInput = mergeOrInsert(inputArr, inputItem);
          const updatedOutput = mergeOrInsert(outputArr, outputItem);

          await this.model.findOneAndUpdate(
            { productId: productId },
            {
              $set: {
                [`formula_input_output.input.${assessment_type}`]: updatedInput,
                [`formula_input_output.output.${assessment_type}`]: updatedOutput,
                updatedAt: new Date(),
              },
            },
            { upsert: true },
          );

          console.log(`Upsert success for ${productId} - ${assessmentId}`);
          return "Success";
        } catch (error) {
          attempt++;
          console.warn(`Upsert retry ${attempt}/${MAX_RETRIES}`, error.message);
          await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * attempt));
        }
      }

      throw new Error(`Upsert failed after ${MAX_RETRIES} retries`);
    });
  }
  async save_packaging_data(result, data) {
    try {
      let finalData = {
        input: { experimental: [{}], baseline: [{}], final: [{}] },
        output: { experimental: [{}], baseline: [{}], final: [{}] },
      };

      const packagingOutputData = this.spiceToTruMapping(result.data.output)
      const packagingInputData = this.spiceToTruMapping(result.data.input)
  
      // Process the results
      finalData.output[result.data.input.assessmentType.toLowerCase()][0][
        result.type
      ] = packagingOutputData;
      finalData.input[result.data.input.assessmentType.toLowerCase()][0][
        result.type
      ] = packagingInputData

      // Save the final data structure to the database, with cache management
      await this.upsertPackagingDataToDB(finalData, data);

      return "Success";
    } catch (error) {
      console.log(`Error in Calculation`, error);
      return "Failed";
    }
  }
}

export const initializeCalculationController = async () => {
  await initializeCalculationModel();
  await initializeCalculationErrorLogModel();
  const CalculationsModels = CalculationsModel();
  const CalculationErrorModel = CalculationErrorLogModel();
  return new CalculationController(CalculationsModels, CalculationErrorModel);
};

export default initializeCalculationController;
