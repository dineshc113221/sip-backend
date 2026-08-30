import { AuditModel } from '../models/Sequelize-audit.js';
import logger from '../utils/logger/index.js';

export const insertToPostgres = (obj: any) => {
  logger.info('postgresAudit.service > Request recieved for insertToPostgres', `${obj}`);
  return AuditModel.create({ ...obj });
};
export const getAllDistinctAuditKeys = async () => {
  const rows = await AuditModel.findAll({
    attributes: ['auditKey'],
    group: ['auditKey'],
    raw: true,
  });

  return rows.map((r: any) => r.auditKey);
};

export const addMethodChangeEventForAllAuditKeys = async ({
  version
}: {
    version: string;
}) => {
  const auditKeys = await getAllDistinctAuditKeys();
  const filteredAuditKeys = auditKeys.filter((key) =>
    /(BSL|FIN|EXP)$/.test(key)
  );

  if (!filteredAuditKeys.length) return;

  const now = new Date();

  const auditRows =
    filteredAuditKeys.map((auditKey) => ({
    auditKey,
    records: {
      objectKey: auditKey,
      operation: 'Version upgrade',
      operationType: 'Method change event',
      version,
      createdTimestamp: now,
    },
  }));
  await AuditModel.bulkCreate(auditRows);
};

export const updateOrCreateToPostgres = (auditData: any) => {
  logger.info('postgresAudit.service > Request recieved for updateOrCreateToPostgres', `${auditData}`);
  return AuditModel.upsert({ ...auditData }, {
    where: {
      'records.objectKey': auditData?.auditKey,
      auditKey: auditData?.auditKey,
      'records.createdBy': auditData?.records?.createdBy ?? '',
      'records.createdTimestamp': auditData?.records?.createdTimestamp ?? '',
    },
  });
};
export const getLatestBaselineSnapshot = async (baselineAssessmentId: string) => {
  return AuditModel.findOne({
    where: {
      auditKey: baselineAssessmentId,
      'records.isCalculationSnapshot': true,
    },
    order: [['createdAt', 'DESC']],
  });
};

export const getReportsForAuditReportFromPostgres = (businessId: string | number) => {
  logger.info('postgresAudit.service > Request recieved for getReportsForAuditReportFromPostgres', `businessId: ${businessId}`);
  const query = AuditModel.findAll({
    where: {
      auditKey: businessId,
    }
  });
  return query;
};
export const saveCalculationSnapshot = async ({
  assessmentId,
  formattedData,
  operation,
  operationType,
  userName,
}: {
  assessmentId: string;
  formattedData: any;
  operation: string;
  operationType: string;
  userName: string;
}) => {
  await updateOrCreateToPostgres({
    auditKey: assessmentId,
    records: {
      createdTimestamp: new Date(),
      objectKey: assessmentId,
      operation,
      operationType,
      isCalculationSnapshot: true,
      ...formattedData,
      createdBy: userName,
    },
  });
};

/**
 * Copy latest baseline snapshot into EXP / FINAL
 */
export const copyBaselineSnapshotToAssessment = async ({
  baselineAssessmentId,
  targetAssessmentId,
  userName,
  operation,
}: {
  baselineAssessmentId: string;
  targetAssessmentId: string;
  userName: string;
  operation?: string;
}) => {
  const baselineSnapshot = await getLatestBaselineSnapshot(
    baselineAssessmentId
  );

  if (!baselineSnapshot) return;

  const {
    operation: _ignoredOperation,
    operationType: _ignoredOperationType,
    ...filteredRecords
  } = baselineSnapshot.records;

  await updateOrCreateToPostgres({
    auditKey: targetAssessmentId,
    records: {
      createdTimestamp: new Date(),
      objectKey: targetAssessmentId,
      operation,
      operationType: "Baseline change event",
      ...filteredRecords,
      createdBy: userName,
    },
  });
};


export const propagateBaselineStateToAssessment = async ({
  baselineData,
  targetAssessmentId,
  userName,
  operation,
}: {
  baselineData: any;
  targetAssessmentId: string;
  userName: string;
  operation: string;
}) => {
  await updateOrCreateToPostgres({
    auditKey: targetAssessmentId,
    records: {
      createdTimestamp: new Date(),
      objectKey: targetAssessmentId,

      operation,
      operationType: "Baseline change event",

      ...baselineData,

      createdBy: userName,
    },
  });
};