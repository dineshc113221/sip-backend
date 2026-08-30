import { projectMapping } from "../../helpers/mapInputRecord.js";
import { updateOrCreateToPostgres } from "../../helpers/postgresAudit.service.js";

export const formatAndSaveAuditData = async (objectKey, operation, operationType, auditData, userName) => {
    const formatedData = projectMapping(auditData);

    await updateOrCreateToPostgres({
        auditKey: objectKey,
        records: {
            createdBy: userName,
            createdTimestamp: new Date(),
            objectKey: objectKey,
            operation,
            operationType,
            ...formatedData
        }
    });
}