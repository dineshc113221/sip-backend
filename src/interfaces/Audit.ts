export interface AuditProductInterface {
    createdBy: string;
    createdTimestamp: string;
    editedBy: string;
    editedTimestamp: string;
    objectKey: string;
    operation: string;
    operationType: string;
    productSipId: string;
    productName: string;
    brandName: string;
    projectId: string;
    projectName: string;
    description: string;
    shortBrandCode: string;
    isDeleted: string;
    users: {
        name: string;
        role: string;
        mail: string;
    }[];
}