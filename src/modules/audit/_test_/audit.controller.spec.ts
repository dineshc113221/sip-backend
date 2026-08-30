import { initializeAuditController } from '../audit.controller';
import * as postgresAuditService from '../../../helpers/postgresAudit.service';
import * as mapInputRecord from '../../../helpers/mapInputRecord';

jest.mock('../../product/product.model', () => ({
  __esModule: true,
  default: jest.fn(() => mockProductModel),
  initializeProductModel: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../../helpers/postgresAudit.service', () => ({
  updateOrCreateToPostgres: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../../helpers/mapInputRecord', () => ({
  assessmentBaseLineMapping: jest.fn(),
}));

jest.mock('../../../lib/db.connection', () => ({
  connections: {
    mainDb: Promise.resolve({ model: jest.fn().mockReturnValue({}) }),
  },
}));

jest.mock('../../../utils/logger/index', () => ({
  default: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

const mockAggregate = jest.fn();
const mockProductModel = {
  aggregate: mockAggregate,
};

const mockedUpdateOrCreate = postgresAuditService.updateOrCreateToPostgres as jest.Mock;
const mockedAssessmentBaseLineMapping = mapInputRecord.assessmentBaseLineMapping as jest.Mock;

describe('auditController', () => {
  let controller: any;

  beforeAll(async () => {
    controller = await initializeAuditController();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('formatAndSaveAuditDataForAssessment', () => {
    const mockGuid = '66f3b5d7d17ef901390cc801';
    const mockAssessmentId = '66f3b5d7d17ef901390cc802';

    it('should save empty formatted data for DELETE operation', async () => {
      const emptyMapped = { assessmentId: mockAssessmentId };
      mockedAssessmentBaseLineMapping.mockReturnValue(emptyMapped);

      await controller.formatAndSaveAuditDataForAssessment(
        mockGuid,
        mockAssessmentId,
        'baseline',
        'Delete',
        'Delete',
        'user-001'
      );

      expect(mockedAssessmentBaseLineMapping).toHaveBeenCalledWith({});
      expect(mockedUpdateOrCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          auditKey: mockAssessmentId,
          records: expect.objectContaining({
            operation: 'Delete',
            operationType: 'Delete',
            createdBy: 'user-001',
          }),
        })
      );
    });

    it('should fetch and map baseline assessment data for baseline type', async () => {
      const mockMongoData = [
        {
          assessments: {
            baseline: {
              assessmentId: mockAssessmentId,
              name: 'Baseline Assessment',
              formulation: { rawMaterials: [] },
              packaging_level: [],
            },
          },
        },
      ];

      const mappedData = { assessmentId: mockAssessmentId, name: 'Baseline Assessment' };

      mockAggregate.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockMongoData) });
      mockedAssessmentBaseLineMapping.mockReturnValue(mappedData);

      await controller.formatAndSaveAuditDataForAssessment(
        mockGuid,
        mockAssessmentId,
        'baseline',
        'UPDATE',
        'edit',
        'user-002'
      );

      expect(mockedAssessmentBaseLineMapping).toHaveBeenCalledWith(
        mockMongoData[0].assessments.baseline
      );
      expect(mockedUpdateOrCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          auditKey: mockAssessmentId,
          records: expect.objectContaining({
            operation: 'UPDATE',
            operationType: 'edit',
            createdBy: 'user-002',
          }),
        })
      );
    });

    it('should fetch and map final assessment data for final type', async () => {
      const finalAssessmentId = '66f3b5d7d17ef901390cc803';
      const mockMongoData = [
        {
          assessments: {
            final: {
              assessmentId: finalAssessmentId,
              name: 'Final Assessment',
              formulation: { rawMaterials: [] },
              packaging_level: [],
            },
          },
        },
      ];

      const mappedData = { assessmentId: finalAssessmentId };
      mockAggregate.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockMongoData) });
      mockedAssessmentBaseLineMapping.mockReturnValue(mappedData);

      await controller.formatAndSaveAuditDataForAssessment(
        mockGuid,
        finalAssessmentId,
        'final',
        'UPDATE',
        'edit',
        'user-003'
      );

      expect(mockedAssessmentBaseLineMapping).toHaveBeenCalledWith(
        mockMongoData[0].assessments.final
      );
      expect(mockedUpdateOrCreate).toHaveBeenCalledWith(
        expect.objectContaining({ auditKey: finalAssessmentId })
      );
    });

    it('should filter experimental assessments by id and map the correct one', async () => {
      const expId1 = '66f3b5d7d17ef901390cc810';
      const expId2 = '66f3b5d7d17ef901390cc811';

      const mockMongoData = [
        {
          assessments: {
            experimental: [
              { _id: { toString: () => expId1 }, assessmentId: expId1, name: 'EXP 1' },
              { _id: { toString: () => expId2 }, assessmentId: expId2, name: 'EXP 2' },
            ],
          },
        },
      ];

      const mappedData = { assessmentId: expId2 };
      mockAggregate.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockMongoData) });
      mockedAssessmentBaseLineMapping.mockReturnValue(mappedData);

      await controller.formatAndSaveAuditDataForAssessment(
        mockGuid,
        expId2,
        'experimental',
        'UPDATE',
        'edit',
        'user-004'
      );

      expect(mockedAssessmentBaseLineMapping).toHaveBeenCalledWith(
        expect.objectContaining({ assessmentId: expId2 })
      );
    });

    it('should include createdTimestamp in the saved record', async () => {
      const emptyMapped = { assessmentId: mockAssessmentId };
      mockedAssessmentBaseLineMapping.mockReturnValue(emptyMapped);

      await controller.formatAndSaveAuditDataForAssessment(
        mockGuid,
        mockAssessmentId,
        'baseline',
        'Delete',
        'Delete',
        'user-005'
      );

      const calledWith = mockedUpdateOrCreate.mock.calls[0][0];
      expect(calledWith.records.createdTimestamp).toBeInstanceOf(Date);
    });

    it('should set objectKey equal to the assessmentId in the record', async () => {
      mockedAssessmentBaseLineMapping.mockReturnValue({ assessmentId: mockAssessmentId });

      await controller.formatAndSaveAuditDataForAssessment(
        mockGuid,
        mockAssessmentId,
        'baseline',
        'Delete',
        'Delete',
        'user-006'
      );

      const calledWith = mockedUpdateOrCreate.mock.calls[0][0];
      expect(calledWith.records.objectKey).toBe(mockAssessmentId);
    });
  });

  describe('getAssessmentDetails', () => {
    it('should call aggregate with correct query for baseline', async () => {
      const guid = '66f3b5d7d17ef901390cc801';
      const assessmentId = '66f3b5d7d17ef901390cc802';

      mockAggregate.mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });

      await controller.getAssessmentDetails(guid, 'baseline', assessmentId);

      expect(mockAggregate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            $match: expect.objectContaining({
              isDeleted: false,
            }),
          }),
        ])
      );
    });
  });
});
