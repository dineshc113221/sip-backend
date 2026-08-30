import { Types } from "mongoose";
import { updateOrCreateToPostgres } from "../../helpers/postgresAudit.service.js";
import Controller from "../../lib/controller.js";
import ProductModel from "../product/product.model.js";
import { assessmentBaseLineMapping } from "../../helpers/mapInputRecord.js";

class auditController extends Controller {
    constructor(model) {
        super(model);
    }

    getAssessmentDetails = async (guid, assessmentType, assessmentId) => {
        const query = {
            _id: new Types.ObjectId(guid),
            [`assessments.${assessmentType}._id`]: new Types.ObjectId(assessmentId),
            isDeleted: false,
        };

        const pipelines = [{ $match: query }];
        return this.model.aggregate(pipelines).exec();
    }

    async formatAndSaveAuditDataForAssessment(
    guid,
    assessmentId,
    assessmentType,
    operation,
    operationType,
    userName,
    preFetchedData?: any 
) {
    let formatedData: any = {}
    let newassessmentId = '';

    if (operationType === "Delete") {
        formatedData = assessmentBaseLineMapping(preFetchedData || {});
        newassessmentId = formatedData?.assessmentId || assessmentId; // NEW fallback — never write an undefined auditKey
    } else {
        const mongoData = await this.getAssessmentDetails(guid, assessmentType, assessmentId);
        if (assessmentType === "baseline") {
            formatedData = assessmentBaseLineMapping(mongoData[0]?.assessments?.baseline);
            newassessmentId = formatedData?.assessmentId
        } else if (assessmentType === "final") {
            formatedData = assessmentBaseLineMapping(mongoData[0]?.assessments?.final);
            newassessmentId = formatedData?.assessmentId
        } else {
            const filteredData = mongoData[0]?.assessments?.experimental.filter(ele => ele._id.toString() === assessmentId)
            formatedData = assessmentBaseLineMapping(filteredData[0]);
            newassessmentId = formatedData?.assessmentId
        }
    }

    await updateOrCreateToPostgres({
        auditKey: newassessmentId,
        records: {
            createdTimestamp: new Date(),
            objectKey: newassessmentId,
            operation,
            operationType,
            ...formatedData,
            createdBy: userName
        }
    });
}
}

export const initializeAuditController = async () => {
    const ProductModels = ProductModel();
    return new auditController(ProductModels);
};

export default initializeAuditController;
