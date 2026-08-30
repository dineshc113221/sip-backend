/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Request, Response } from "express";
import adminModel, { initializeadminModel } from "./admin.model.js";
import CalculationsModel, {
  initializeCalculationModel,
} from "../calculation_api/calculation.model.js";
import ProductModel, {
  initializeProductModel,
} from "../product/product.model.js";
import CalculationsAuditModel, {
  initializeCalculationAuditModel,
} from "./calculation_audit.model.js";
import CalculationsUpversionModel, {
  initializeCalculationUpversionModel,
} from "./calculation_upversion.model.js";
import calculation_scenario from "../calculation_api/calculation_scenario.js";
import { initializeProductController } from "../product/product.controller.js";
import { calculateForAllProducts } from "../product/new_calculation_Script.js";

import { addMethodChangeEventForAllAuditKeys } from "../../helpers/postgresAudit.service.js";

class adminController {
  private model;
  calculationsAuditModels;
  calculationModels;
  calculationsUpversionModels;
  ProductModels;
  constructor(model, calculationModel, CalculationAuditModel, CalculationUpversionModel, ProductModel) {
    this.model = model;
    this.calculationsAuditModels = CalculationAuditModel;
    this.calculationsUpversionModels = CalculationUpversionModel;
    this.calculationModels = calculationModel;
    this.ProductModels = ProductModel;
  }
  normalizeVersion(version) {
    if (version === undefined || version === null)
      throw new Error("Version is required");

    let v = String(version)
      .trim()
      .replace(/^v/i, "") // optional leading v/V
      .replace(/\.+$/, ""); // remove trailing dots e.g. "1." -> "1"

    const parts = v.split(".").map(Number);
    if (parts.length === 0 || parts.some((n) => Number.isNaN(n))) {
      throw new Error(`Invalid version format: ${version}`);
    }

    // remove trailing zeros: 1.0.0 -> 1, 1.1.0 -> 1.1
    while (parts.length > 1 && parts[parts.length - 1] === 0) {
      parts.pop();
    }

    return parts.join(".");
  }

  allTrue(conditions) {
    return conditions.every((c) => c === true);
  }
  classifyVersion(version) {
    if (!version) {
      throw new Error("Version is required");
    }
    // normalize: remove optional v/V
    const normalized = String(version).trim().replace(/^v/i, "");
    const parts = normalized.split(".").map(Number);

    if (parts.some((n) => Number.isNaN(n))) {
      throw new Error(`Invalid version format: ${version}`);
    }

    const isMajor = parts.length === 1 || parts.slice(1).every((n) => n === 0);

    return {
      original: version,
      normalized,
      type: isMajor ? "major" : "minor",
    };
  }

  createAdminVersion = async (req: Request, res: Response) => {
    try {
      const result = this.classifyVersion(req.body.version_number);
      let beforeCount = 0;
      let afterCount = 0;
      const versionNormalized = this.normalizeVersion(req.body.version_number);
      const payload = {
        version_number: versionNormalized,
        description: req.body.description,
        date: req.body.date,
        what_change: req.body.what_change,
        type: result.type,
      };

      const doc = await this.model.create(payload);
      if (!doc || !doc._id) {
        return res.status(500).json({
          success: false,
          message: "Document was not saved",
        });
      }
      if (result.type === "major") {
        await addMethodChangeEventForAllAuditKeys({
          version: payload.version_number,
        });

        const sourceCollection = this.calculationModels.collection;
        const targetCollection = this.calculationsAuditModels.collection;
        beforeCount = await targetCollection.countDocuments();
        await sourceCollection
          .aggregate([
            { $match: {} },

            // Keep original source _id
            { $addFields: { sourceId: "$_id" } },

            // Force a NEW _id for target so it always inserts (insert-only behavior)
            {
              $set: {
                _id: {
                  $concat: [
                    { $toString: "$_id" },
                    "__",
                    req.body.version_number,
                  ],
                }, // _id becomes string
                version: req.body.version_number,
              },
            },

            {
              $merge: {
                into: targetCollection.name,
                on: "_id", // match on new _id
                whenMatched: "fail", // if collision happens, throw error
                whenNotMatched: "insert", // always insert new docs
              },
            },
          ])
          .toArray();
        afterCount = await targetCollection.countDocuments();
        if (afterCount < beforeCount) {
          throw new Error("Merge did not complete correctly");
        }
        //trigger calculation
       
        try {
          await calculateForAllProducts(req, res, this.ProductModels);
        } catch (calcErr) {
      
          console.error(
            "[createAdminVersion] calculateForAllProducts failed:",
            calcErr,
          );
        }

        // ---------- Upversion snapshot ----------
      
        try {
          await this.runUpversionAndPrecompute(versionNormalized, "createAdminVersion");
        } catch (upErr) {
          
          console.error(
            "[createAdminVersion] upversion copy / precompute failed:",
            upErr,
          );
        }
      }
      
      if (res.headersSent) {
        return;
      }
      return res.status(201).json({
        success: true,
        message: "Admin version saved successfully",
        beforeCount,
        afterCount,
        addedOrUpdated: afterCount - beforeCount,
        data: doc,
      });
    } catch (err) {
      console.error("[createAdminVersion] outer error:", err);

      if (res.headersSent) {
        return;
      }

      if (err?.code === 11000) {
        const duplicateField =
          Object.keys(err.keyPattern || err.keyValue || {})[0] ||
          "version_number";

        return res.status(409).json({
          success: false,
          message: `${duplicateField} already exists. Please use a unique version number.`,
          error: {
            type: "DUPLICATE_KEY",
            field: duplicateField,
            value: err.keyValue?.[duplicateField],
          },
        });
      }

      if (err?.name === "ValidationError") {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          error: Object.values(err.errors).map((e: any) => e.message),
        });
      }

      return res.status(500).json({
        success: false,
        message: "Something went wrong while saving admin version",
        error: err?.message || err,
      });
    }
  };
  getAdminVersions = async (req: Request, res: Response) => {
    try {
      // /admin-version?page=1&limit=10
      // /admin-version?page=2&limit=20
      // /admin-version?page=1&limit=10&search=v1
      const page = Math.max(
        parseInt(String(req.query.page ?? "1"), 100) || 1,
        1,
      );
      const limitRaw = parseInt(String(req.query.limit ?? "100"), 100) || 100;
      const limit = Math.min(Math.max(limitRaw, 1), 1000); // cap at 1000
      const skip = (page - 1) * limit;

      const filter: any = { isDeleted: false };
      const search = String(req.query.search ?? "").trim();
      if (search) {
        filter.$or = [
          { version_number: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ];
      }

      const [docs, total] = await Promise.all([
        this.model
          .find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        this.model.countDocuments(filter),
      ]);

      // handle docs (empty array is still success)
      return res.status(200).json({
        success: true,
        message: docs.length
          ? "Fetched admin versions"
          : "No admin versions found",
        data: docs,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasNextPage: skip + docs.length < total,
          hasPrevPage: page > 1,
        },
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch admin versions",
        error: err?.message || err,
      });
    }
  };
  async calculationResult(req: Request, res: Response): Promise<void> {
    try {
      const assessmentsType = req.params.assessmentType;
      const assessmentId = req.params.assessmentId;
      const productId = req.params.productId;
      const versionNumber = req.params.version;
      const query = {
        isDelete: "false",
        productId: productId,
        [`formula_input_output.output.${assessmentsType}.assessmentId`]: assessmentId,
        [`formula_input_output.output.${assessmentsType}.version`]: versionNumber,
      };
      let calculatedResult = {};
      let calculationMessage;
      let doc = await this.calculationsAuditModels.findOne(query);
      if (doc !== null) {
        doc = doc.toJSON();
        const productController = await initializeProductController();
        const calculationDataFlags = await productController.calculationScenariosData(
          assessmentId,
          assessmentsType,
        );
        if (assessmentsType === "baseline") {
          doc["formula_input_output"]["input"]["baseline"].forEach((item) => {
            if (
              item.assessmentId === assessmentId &&
              item.version === versionNumber
            ) {
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
            ].map((result: { assessmentId: string; version: string }) => {
              return result.assessmentId === assessmentId &&
                result.version === versionNumber
                ? { [`${assessmentsType}`]: result }
                : {};
            });
            const myProductPackaging = doc["formula_input_output"]["input"][
              assessmentsType
            ].map(
              (result: {
                assessmentId: string;
                version: string;
                packproduction;
              }) => {
                return result.assessmentId === assessmentId &&
                  result.version === versionNumber
                  ? result["sustainablepackaging-pcr"]
                  : {};
              },
            );

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
 
private buildSectionDiffExpr(section: string) {
  const newArrPath = `$formula_input_output.output.${section}`;
  const oldArrPath = `$auditDoc.formula_input_output.output.${section}`;

  const scoreKeys = [
    "pef",
    "carbon",
    "green_chem",
    "pack_circularity",
  ];

  const diffObj: Record<string, any> = {};

  for (const k of scoreKeys) {
    diffObj[k] = {
      old_score: { $ifNull: [`$$oldItem.${k}_score`, null] },
      new_score: { $ifNull: [`$$newItem.${k}_score`, null] },
      old_description: { $ifNull: [`$$oldItem.${k}_description`, null] },
      new_description: { $ifNull: [`$$newItem.${k}_description`, null] },
    };
  }

  return {
    $arrayToObject: {
      $map: {
        input: {
          $filter: {
            input: { $ifNull: [newArrPath, []] },
            as: "newItem",
            cond: {
              $or: [
                { $ne: ["$$newItem.pef_score", null] },
                { $ne: ["$$newItem.carbon_score", null] },
                { $ne: ["$$newItem.green_chem_score", null] },
                { $ne: ["$$newItem.pack_circularity_score", null] },
              ],
            },
          },
        },
        as: "newItem",
        in: {
          k: { $ifNull: ["$$newItem.assessmentId", "__unknown__"] },
          v: {
            $let: {
              vars: {
                oldItem: {
                  $first: {
                    $filter: {
                      input: { $ifNull: [oldArrPath, []] },
                      as: "o",
                      cond: {
                        $eq: [
                          "$$o.assessmentId",
                          "$$newItem.assessmentId",
                        ],
                      },
                    },
                  },
                },
              },
              in: diffObj,
            },
          },
        },
      },
    },
  };
}

  private async findPreviousMajorVersion(
    versionNormalized: string,
  ): Promise<string | null> {
    const previousMajorByType = await this.model
      .find({
        isDeleted: false,
        type: "major",
        version_number: { $ne: versionNormalized },
      })
      .sort({ createdAt: -1 })
      .limit(1)
      .lean();
    if (previousMajorByType?.[0]?.version_number) {
      return previousMajorByType[0].version_number;
    }
    const recent = await this.model
      .find({
        isDeleted: false,
        version_number: { $ne: versionNormalized },
      })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    for (const v of recent) {
      try {
        if (this.classifyVersion(v.version_number).type === "major") {
          return v.version_number;
        }
      } catch {
        // ignore malformed versions
      }
    }
    return null;
  }

  private async runUpversionAndPrecompute(
    versionNormalized: string,
    logTag: string = "rebuildUpversion",
  ): Promise<{
    previousVersion: string | null;
    mergeReturned: number;
    docsWithVersion: number;
    precomputed: boolean;
  }> {
    const upversionSourceCollection = this.calculationModels.collection;
    const upversionTargetCollection = this.calculationsUpversionModels.collection;

    const previousVersionNumber = await this.findPreviousMajorVersion(
      versionNormalized,
    );

    console.log(
      `[${logTag}] upversion copy starting. newVersion=${versionNormalized} previousVersion=${previousVersionNumber}`,
    );

    const mergeResult = await upversionSourceCollection
      .aggregate([
        { $match: {} },
        { $addFields: { sourceId: "$_id" } },
        {
          $set: {
            _id: {
              $concat: [{ $toString: "$_id" }, "__", versionNormalized],
            },
            version: versionNormalized,
            previous_version: previousVersionNumber,
          },
        },
        {
          $merge: {
            into: upversionTargetCollection.name,
            on: "_id",
            whenMatched: "replace",
            whenNotMatched: "insert",
          },
        },
      ])
      .toArray();

    const upversionCount = await upversionTargetCollection.countDocuments({
      version: versionNormalized,
    });
    console.log(
      `[${logTag}] upversion copy done. mergeReturned=${mergeResult.length} docsWithVersion=${upversionCount}`,
    );

    let precomputed = false;
    if (previousVersionNumber) {
      await this.precomputeImpactOnAssessments(
        upversionTargetCollection,
        this.calculationsAuditModels.collection,
        versionNormalized
      );
      console.log(
        `[${logTag}] precomputeImpactOnAssessments done for ${versionNormalized}`,
      );
      precomputed = true;
    }

    return {
      previousVersion: previousVersionNumber,
      mergeReturned: mergeResult.length,
      docsWithVersion: upversionCount,
      precomputed,
    };
  }

  rebuildUpversion = async (req: Request, res: Response) => {
    try {
      const rawVersion = req.body?.version_number;
      if (!rawVersion) {
        return res.status(400).json({
          success: false,
          message: "version_number is required in body",
        });
      }

      const classified = this.classifyVersion(rawVersion);
      if (classified.type !== "major") {
        return res.status(400).json({
          success: false,
          message: `Only major versions can be rebuilt. ${rawVersion} is a minor.`,
        });
      }

      const versionNormalized = this.normalizeVersion(rawVersion);

      // Confirm the admin_versions doc exists.
      const adminDoc = await this.model
        .findOne({
          isDeleted: false,
          version_number: versionNormalized,
          type: "major",
        })
        .lean();
      if (!adminDoc) {
        return res.status(404).json({
          success: false,
          message: `Major admin version ${versionNormalized} not found`,
        });
      }

      const precomputeOnly = req.body?.precomputeOnly === true;

      if (precomputeOnly) {
        const previousVersionNumber = await this.findPreviousMajorVersion(
          versionNormalized,
        );
        if (!previousVersionNumber) {
          return res.status(400).json({
            success: false,
            message:
              "No previous major version found. Nothing to diff against.",
          });
        }
        console.log(
          `[rebuildUpversion] precomputeOnly=true. newVersion=${versionNormalized} previousVersion=${previousVersionNumber}`,
        );
        await this.precomputeImpactOnAssessments(
          this.calculationsUpversionModels.collection,
          this.calculationsAuditModels.collection,
          versionNormalized
        );
        return res.status(200).json({
          success: true,
          message: `Precompute refreshed for version ${versionNormalized}`,
          version: versionNormalized,
          previousVersion: previousVersionNumber,
          precomputed: true,
        });
      }

      const result = await this.runUpversionAndPrecompute(
        versionNormalized,
        "rebuildUpversion",
      );

      return res.status(200).json({
        success: true,
        message: `Upversion rebuilt for version ${versionNormalized}`,
        version: versionNormalized,
        ...result,
      });
    } catch (err) {
      console.error("[rebuildUpversion] error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to rebuild upversion",
        error: err?.message || err,
      });
    }
  };

 
  private async precomputeImpactOnAssessments(
    upversionCollection: any,
    auditCollection: any,
    newVersion: string,
  ) {
    await upversionCollection
      .aggregate([
        { $match: { version: newVersion } },

   
        {
          $lookup: {
            from: auditCollection.name,
            let: { pid: "$productId" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$productId", "$$pid"] },
                      // audit.version may be stored raw or normalized; accept either
                      { $in: ["$version", [newVersion, String(newVersion)]] },
                    ],
                  },
                },
              },
              { $project: { "formula_input_output.output": 1 } },
            ],
            as: "auditDoc",
          },
        },
        { $addFields: { auditDoc: { $arrayElemAt: ["$auditDoc", 0] } } },

       
        {
          $addFields: {
            impact_on_assessments: {
              experimental: this.buildSectionDiffExpr("experimental"),
              final: this.buildSectionDiffExpr("final"),
            },
          },
        },

        { $project: { auditDoc: 0 } },

        {
          $merge: {
            into: upversionCollection.name,
            on: "_id",
            whenMatched: "merge",
            whenNotMatched: "discard",
          },
        },
      ])
      .toArray();
  }

  getAdminVersionsTab = async (req: Request, res: Response) => {
    try {
      const assessmentsType = req.params.assessmentType;
      const assessmentId = req.params.assessmentId;
      const productId = req.params.productId;

     
      if (!assessmentsType || !assessmentId || !productId) {
        return res.status(400).json({
          success: false,
          message:
            "assessmentType, assessmentId and productId are all required",
        });
      }

      const impactPath = `impact_on_assessments.${assessmentsType}.${assessmentId}`;

      
      const projection: Record<string, 1> = {
        version: 1,
        previous_version: 1,
        productId: 1,
        updatedAt: 1,
        [impactPath]: 1,
      };

      const upversionDocs = await this.calculationsUpversionModels
        .find({ isDelete: "false", productId }, projection)
        .lean();

    
const hits = upversionDocs || [];

      if (hits.length === 0) {
        return res.status(200).json({ success: true, data: [] });
      }

      const rawVersionsForMeta = Array.from(
        new Set(
          hits
            .map((d: any) => d.version)
            .filter((v: any) => v !== null && v !== undefined && v !== ""),
        ),
      );
      const versionsForMetaQuery = Array.from(
        new Set([
          ...rawVersionsForMeta,
          ...rawVersionsForMeta.map((v: any) => String(v)),
        ]),
      );

      const versionDocs = versionsForMetaQuery.length
        ? await this.model
            .find({ version_number: { $in: versionsForMetaQuery } })
            .lean()
        : [];
      const versionDocMap: Record<string, any> = {};
      for (const vd of versionDocs || []) {
        if (
          vd &&
          vd.version_number !== undefined &&
          vd.version_number !== null
        ) {
          versionDocMap[String(vd.version_number)] = vd;
        }
      }

      // Map: prevVersion → nextVersion (the version that captured prevVersion's snapshot)
      const prevToNextVersionMap: Record<string, string> = {};
      for (const hit of hits) {
        if (hit.previous_version != null && hit.previous_version !== "") {
          prevToNextVersionMap[String(hit.previous_version)] = String(hit.version);
        }
      }

      // Check which "next-version" audit snapshots (captured before recalculation)
      // actually have scores for this assessment — only those allow snapshot display.
      const snapshotVersionsToCheck = Array.from(
        new Set(hits.map((d: any) => String(d.version)).filter(Boolean))
      );

      const auditSnapshotDocs = snapshotVersionsToCheck.length
        ? await this.calculationsAuditModels
            .find(
              {
                isDelete: "false",
                productId,
                version: { $in: snapshotVersionsToCheck },
                [`formula_input_output.output.${assessmentsType}`]: {
                  $elemMatch: {
                    assessmentId,
                    $or: [
                      { pef_score: { $exists: true, $ne: null } },
                      { carbon_score: { $exists: true, $ne: null } },
                      { green_chem_score: { $exists: true, $ne: null } },
                      { pack_circularity_score: { $exists: true, $ne: null } },
                    ],
                  },
                },
              },
              { version: 1 }
            )
            .lean()
        : [];

      // Set of "next-version" values whose pre-recalculation audit snapshot has scores
      const auditSnapshotVersionsWithScores = new Set<string>(
        (auditSnapshotDocs || []).map((d: any) => String(d.version))
      );

const data = hits
  .map((d: any) => {
    const impact =
      d?.impact_on_assessments?.[assessmentsType]?.[assessmentId] ??
      null;

    const versionDoc = versionDocMap[String(d.version)];
    if (!versionDoc) return null;

    // Impact is valid only when both old and new version have scores
    const hasImpact =
      impact != null &&
      Object.values(impact).some(
        (metric: any) =>
          metric?.old_score != null &&
          metric?.new_score != null
      );

    // Snapshot for this version is available only if the next major version's
    // audit snapshot (pre-recalculation) has scores for this assessment
    const nextVersionAfterThis = prevToNextVersionMap[String(d.version)];
    const hasSnapshot = nextVersionAfterThis
      ? auditSnapshotVersionsWithScores.has(nextVersionAfterThis)
      : false;

    return {
      ...versionDoc,
      impact_on_assessments: impact,
      hasImpact,
      hasSnapshot,
    };
  })
  .filter(Boolean);

      const allVersionsInUpversion = new Set(
        hits.map((d: any) => String(d.version)),
      );
      const earliestCandidates = Array.from(
        new Set(
          hits
            .map((d: any) => d.previous_version)
            .filter((v: any) => v !== null && v !== undefined && v !== "")
            .map((v: any) => String(v))
            .filter((v: string) => !allVersionsInUpversion.has(v)),
        ),
      );

      if (earliestCandidates.length > 0) {
        const earliestVersion = earliestCandidates[0]; // any of them; usually one
        const earliestVersionAsNumber = Number(earliestVersion);
        const earliestQueryValues: any[] = [earliestVersion];
        if (!Number.isNaN(earliestVersionAsNumber)) {
          earliestQueryValues.push(earliestVersionAsNumber);
        }
        const earliestDoc = await this.model
          .findOne({ version_number: { $in: earliestQueryValues } })
          .lean();
        if (
          earliestDoc &&
          !data.some(
            (d: any) =>
              String(d.version_number) === String(earliestDoc.version_number),
          )
        ) {
          // hasSnapshot: the audit snapshot for the earliest version was captured
          // when the next major version was created (before recalculation)
          const earliestNextVersion = prevToNextVersionMap[String(earliestVersion)];
          data.push({
            ...earliestDoc,
            impact_on_assessments: null,
            hasImpact: false,
            hasSnapshot: earliestNextVersion
              ? auditSnapshotVersionsWithScores.has(earliestNextVersion)
              : false,
          });
        }
      }

      data.sort((a: any, b: any) =>
        String(b.version_number).localeCompare(
          String(a.version_number),
          undefined,
          { numeric: true },
        ),
      );

      return res.status(200).json({ success: true, data });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch admin versions",
        error: err?.message || String(err),
      });
    }
  };
}

export const initializeadminHistoryController = async () => {
  await initializeadminModel();
  await initializeCalculationModel();
  await initializeCalculationAuditModel();
  await initializeCalculationUpversionModel();
  await initializeProductModel();
  const adminModels = adminModel();
  const CalculationsModels = CalculationsModel();
  const CalculationsAuditModels = CalculationsAuditModel();
  const CalculationsUpversionModels = CalculationsUpversionModel();
  const ProductModels = ProductModel();
  return new adminController(
    adminModels,
    CalculationsModels,
    CalculationsAuditModels,
    CalculationsUpversionModels,
    ProductModels,
  );
};

export default initializeadminHistoryController;
