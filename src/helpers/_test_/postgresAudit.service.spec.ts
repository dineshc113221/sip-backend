import {
  insertToPostgres,
  updateOrCreateToPostgres,
  getLatestBaselineSnapshot,
  getReportsForAuditReportFromPostgres,
  saveCalculationSnapshot,
  copyBaselineSnapshotToAssessment,
  addMethodChangeEventForAllAuditKeys,
  getAllDistinctAuditKeys,
} from '../postgresAudit.service';

jest.mock('../../models/Sequelize-audit', () => ({
  AuditModel: {
    create: jest.fn(),
    upsert: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    bulkCreate: jest.fn(),
  },
}));

jest.mock('../../utils/logger/index', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

import { AuditModel } from '../../models/Sequelize-audit';

describe('postgresAudit.service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('insertToPostgres', () => {
    it('should call AuditModel.create with the given object', async () => {
      const obj = { auditKey: 'KEY-001', records: { operation: 'CREATE', objectKey: 'OBJ-001' } };
      (AuditModel.create as jest.Mock).mockResolvedValue(obj);

      const result = await insertToPostgres(obj);

      expect(AuditModel.create).toHaveBeenCalledWith({ ...obj });
      expect(result).toEqual(obj);
    });

    it('should propagate errors thrown by AuditModel.create', async () => {
      (AuditModel.create as jest.Mock).mockRejectedValue(new Error('DB insert failed'));

      await expect(insertToPostgres({})).rejects.toThrow('DB insert failed');
    });
  });

  describe('getAllDistinctAuditKeys', () => {
    it('should return an array of distinct audit key strings', async () => {
      (AuditModel.findAll as jest.Mock).mockResolvedValue([
        { auditKey: 'KEY-001' },
        { auditKey: 'KEY-002' },
        { auditKey: 'KEY-003' },
      ]);

      const keys = await getAllDistinctAuditKeys();

      expect(AuditModel.findAll).toHaveBeenCalledWith({
        attributes: ['auditKey'],
        group: ['auditKey'],
        raw: true,
      });
      expect(keys).toEqual(['KEY-001', 'KEY-002', 'KEY-003']);
    });

    it('should return an empty array when no audit keys exist', async () => {
      (AuditModel.findAll as jest.Mock).mockResolvedValue([]);

      const keys = await getAllDistinctAuditKeys();

      expect(keys).toEqual([]);
    });
  });

  describe('updateOrCreateToPostgres', () => {
    it('should call AuditModel.upsert with the audit data', async () => {
      const auditData = {
        auditKey: 'ASSESS-001-BSL',
        records: {
          createdBy: 'user1',
          createdTimestamp: new Date(),
          objectKey: 'ASSESS-001-BSL',
        },
      };
      (AuditModel.upsert as jest.Mock).mockResolvedValue([auditData, true]);

      await updateOrCreateToPostgres(auditData);

      expect(AuditModel.upsert).toHaveBeenCalledWith(
        { ...auditData },
        expect.objectContaining({ where: expect.any(Object) })
      );
    });

    it('should include auditKey in the where clause', async () => {
      const auditData = {
        auditKey: 'ASSESS-BSL-TEST',
        records: { createdBy: 'admin', createdTimestamp: '2024-01-01' },
      };
      (AuditModel.upsert as jest.Mock).mockResolvedValue([{}, false]);

      await updateOrCreateToPostgres(auditData);

      const [, options] = (AuditModel.upsert as jest.Mock).mock.calls[0];
      expect(options.where.auditKey).toBe('ASSESS-BSL-TEST');
    });
  });

  describe('getLatestBaselineSnapshot', () => {
    it('should query with correct auditKey and isCalculationSnapshot filter', async () => {
      const mockRecord = { auditKey: 'BSL-001', records: { isCalculationSnapshot: true, score: 90 } };
      (AuditModel.findOne as jest.Mock).mockResolvedValue(mockRecord);

      const result = await getLatestBaselineSnapshot('BSL-001');

      expect(AuditModel.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { auditKey: 'BSL-001', 'records.isCalculationSnapshot': true },
          order: [['createdAt', 'DESC']],
        })
      );
      expect(result).toEqual(mockRecord);
    });

    it('should return null when no snapshot is found', async () => {
      (AuditModel.findOne as jest.Mock).mockResolvedValue(null);

      const result = await getLatestBaselineSnapshot('BSL-NOTFOUND');

      expect(result).toBeNull();
    });
  });

  describe('getReportsForAuditReportFromPostgres', () => {
    it('should call findAll with the given string businessId', async () => {
      const mockRows = [{ auditKey: 'biz-001', records: { operation: 'CREATE' } }];
      (AuditModel.findAll as jest.Mock).mockResolvedValue(mockRows);

      const result = await getReportsForAuditReportFromPostgres('biz-001');

      expect(AuditModel.findAll).toHaveBeenCalledWith({ where: { auditKey: 'biz-001' } });
      expect(result).toEqual(mockRows);
    });

    it('should work with a numeric businessId', async () => {
      (AuditModel.findAll as jest.Mock).mockResolvedValue([]);

      await getReportsForAuditReportFromPostgres(42);

      expect(AuditModel.findAll).toHaveBeenCalledWith({ where: { auditKey: 42 } });
    });

    it('should return empty array when no records found', async () => {
      (AuditModel.findAll as jest.Mock).mockResolvedValue([]);

      const result = await getReportsForAuditReportFromPostgres('biz-no-records');

      expect(result).toEqual([]);
    });
  });

  describe('saveCalculationSnapshot', () => {
    it('should call updateOrCreateToPostgres with correct snapshot structure', async () => {
      (AuditModel.upsert as jest.Mock).mockResolvedValue([{}, true]);

      await saveCalculationSnapshot({
        assessmentId: 'ASSESS-BSL-001',
        formattedData: { score: 85, pef: 0.5 },
        operation: 'Calculate',
        operationType: 'Baseline Snapshot',
        userName: 'admin-user',
      });

      const calledWith = (AuditModel.upsert as jest.Mock).mock.calls[0][0];
      expect(calledWith.auditKey).toBe('ASSESS-BSL-001');
      expect(calledWith.records.objectKey).toBe('ASSESS-BSL-001');
      expect(calledWith.records.operation).toBe('Calculate');
      expect(calledWith.records.operationType).toBe('Baseline Snapshot');
      expect(calledWith.records.isCalculationSnapshot).toBe(true);
      expect(calledWith.records.createdBy).toBe('admin-user');
      expect(calledWith.records.score).toBe(85);
    });

    it('should include a createdTimestamp in the snapshot record', async () => {
      (AuditModel.upsert as jest.Mock).mockResolvedValue([{}, true]);

      await saveCalculationSnapshot({
        assessmentId: 'ASSESS-FIN-001',
        formattedData: {},
        operation: 'Calculate',
        operationType: 'Final',
        userName: 'user2',
      });

      const calledWith = (AuditModel.upsert as jest.Mock).mock.calls[0][0];
      expect(calledWith.records.createdTimestamp).toBeInstanceOf(Date);
    });
  });

  describe('copyBaselineSnapshotToAssessment', () => {
    it('should return early without calling upsert when no baseline snapshot found', async () => {
      (AuditModel.findOne as jest.Mock).mockResolvedValue(null);

      await copyBaselineSnapshotToAssessment({
        baselineAssessmentId: 'BSL-001',
        targetAssessmentId: 'FIN-001',
        userName: 'user1',
      });

      expect(AuditModel.upsert).not.toHaveBeenCalled();
    });

    it('should copy snapshot data from baseline to target assessment', async () => {
      const baselineRecord = {
        records: {
          operation: 'OldOperation',
          operationType: 'OldOperationType',
          isCalculationSnapshot: true,
          score: 90,
          pef: 0.3,
          objectKey: 'BSL-001',
          createdBy: 'baseline-user',
        },
      };
      (AuditModel.findOne as jest.Mock).mockResolvedValue(baselineRecord);
      (AuditModel.upsert as jest.Mock).mockResolvedValue([{}, true]);

      await copyBaselineSnapshotToAssessment({
        baselineAssessmentId: 'BSL-001',
        targetAssessmentId: 'FIN-001',
        userName: 'target-user',
        operation: 'Baseline Change',
      });

      const calledWith = (AuditModel.upsert as jest.Mock).mock.calls[0][0];
      expect(calledWith.auditKey).toBe('FIN-001');
      expect(calledWith.records.operationType).toBe('Baseline change event');
      expect(calledWith.records.operation).toBe('Baseline Change');
      expect(calledWith.records.createdBy).toBe('target-user');
    });

    it('should exclude operation and operationType from baseline records when copying', async () => {
      const baselineRecord = {
        records: {
          operation: 'ShouldBeExcluded',
          operationType: 'ShouldBeExcluded',
          score: 75,
          pef: 0.4,
        },
      };
      (AuditModel.findOne as jest.Mock).mockResolvedValue(baselineRecord);
      (AuditModel.upsert as jest.Mock).mockResolvedValue([{}, true]);

      await copyBaselineSnapshotToAssessment({
        baselineAssessmentId: 'BSL-002',
        targetAssessmentId: 'EXP-002',
        userName: 'user2',
      });

      const calledWith = (AuditModel.upsert as jest.Mock).mock.calls[0][0];
      expect(calledWith.records.score).toBe(75);
      expect(calledWith.records.operationType).toBe('Baseline change event');
    });

    it('should set a new createdTimestamp on the copied record', async () => {
      (AuditModel.findOne as jest.Mock).mockResolvedValue({
        records: { score: 80, operation: 'op', operationType: 'type' },
      });
      (AuditModel.upsert as jest.Mock).mockResolvedValue([{}, true]);

      await copyBaselineSnapshotToAssessment({
        baselineAssessmentId: 'BSL-003',
        targetAssessmentId: 'EXP-003',
        userName: 'user3',
      });

      const calledWith = (AuditModel.upsert as jest.Mock).mock.calls[0][0];
      expect(calledWith.records.createdTimestamp).toBeInstanceOf(Date);
    });
  });

  describe('addMethodChangeEventForAllAuditKeys', () => {
    it('should not call bulkCreate when no BSL/FIN/EXP audit keys exist', async () => {
      (AuditModel.findAll as jest.Mock).mockResolvedValue([
        { auditKey: 'PRODUCT-001' },
        { auditKey: 'RANDOM-KEY' },
        { auditKey: 'SOMETHING-ELSE' },
      ]);

      await addMethodChangeEventForAllAuditKeys({ version: '2.0' });

      expect(AuditModel.bulkCreate).not.toHaveBeenCalled();
    });

    it('should call bulkCreate with version upgrade events for BSL keys', async () => {
      (AuditModel.findAll as jest.Mock).mockResolvedValue([
        { auditKey: 'ASSESS-001-BSL' },
        { auditKey: 'NON-MATCHING' },
      ]);
      (AuditModel.bulkCreate as jest.Mock).mockResolvedValue([]);

      await addMethodChangeEventForAllAuditKeys({ version: '3.0' });

      const callArg = (AuditModel.bulkCreate as jest.Mock).mock.calls[0][0];
      expect(callArg).toHaveLength(1);
      expect(callArg[0].auditKey).toBe('ASSESS-001-BSL');
      expect(callArg[0].records.version).toBe('3.0');
      expect(callArg[0].records.operation).toBe('Version upgrade');
      expect(callArg[0].records.operationType).toBe('Method change event');
    });

    it('should process BSL, FIN, and EXP keys together', async () => {
      (AuditModel.findAll as jest.Mock).mockResolvedValue([
        { auditKey: 'ASSESS-001-BSL' },
        { auditKey: 'ASSESS-002-FIN' },
        { auditKey: 'ASSESS-003-EXP' },
        { auditKey: 'OTHER-PRODUCT' },
      ]);
      (AuditModel.bulkCreate as jest.Mock).mockResolvedValue([]);

      await addMethodChangeEventForAllAuditKeys({ version: '4.0' });

      const callArg = (AuditModel.bulkCreate as jest.Mock).mock.calls[0][0];
      expect(callArg).toHaveLength(3);
      const keys = callArg.map((r: any) => r.auditKey);
      expect(keys).toContain('ASSESS-001-BSL');
      expect(keys).toContain('ASSESS-002-FIN');
      expect(keys).toContain('ASSESS-003-EXP');
    });

    it('should return early without bulkCreate when findAll returns empty array', async () => {
      (AuditModel.findAll as jest.Mock).mockResolvedValue([]);

      await addMethodChangeEventForAllAuditKeys({ version: '1.0' });

      expect(AuditModel.bulkCreate).not.toHaveBeenCalled();
    });

    it('should include a createdTimestamp in each bulk create row', async () => {
      (AuditModel.findAll as jest.Mock).mockResolvedValue([{ auditKey: 'TEST-BSL' }]);
      (AuditModel.bulkCreate as jest.Mock).mockResolvedValue([]);

      await addMethodChangeEventForAllAuditKeys({ version: '5.0' });

      const callArg = (AuditModel.bulkCreate as jest.Mock).mock.calls[0][0];
      expect(callArg[0].records.createdTimestamp).toBeInstanceOf(Date);
    });
  });
});
