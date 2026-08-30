import initializeadminHistoryController from '../admin.controller';

// Mock all database model dependencies
jest.mock('../admin.model', () => ({
  __esModule: true,
  default: jest.fn(() => mockAdminModel),
  initializeadminModel: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../calculation_api/calculation.model', () => ({
  __esModule: true,
  default: jest.fn(() => mockCalcModel),
  initializeCalculationModel: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../calculation_audit.model', () => ({
  __esModule: true,
  default: jest.fn(() => mockCalcAuditModel),
  initializeCalculationAuditModel: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../calculation_upversion.model', () => ({
  __esModule: true,
  default: jest.fn(() => mockCalcUpversionModel),
  initializeCalculationUpversionModel: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../product/product.model', () => ({
  __esModule: true,
  default: jest.fn(() => ({})),
  initializeProductModel: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../product/product.controller', () => ({
  initializeProductController: jest.fn().mockResolvedValue({
    calculationScenariosData: jest.fn().mockResolvedValue({}),
  }),
}));

jest.mock('../../product/new_calculation_Script', () => ({
  calculateForAllProducts: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../../helpers/postgresAudit.service', () => ({
  addMethodChangeEventForAllAuditKeys: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../../utils/logger/index', () => ({
  default: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

jest.mock('../../../lib/db.connection', () => ({
  connections: {
    mainDb: Promise.resolve({ model: jest.fn().mockReturnValue({}) }),
  },
}));

jest.mock('../../calculation_api/calculation_scenario', () => ({}));

// Shared mock models
const mockCollection = {
  aggregate: jest.fn().mockReturnValue({ toArray: jest.fn().mockResolvedValue([]) }),
  countDocuments: jest.fn().mockResolvedValue(0),
  name: 'test_collection',
};

const mockAdminModel = {
  create: jest.fn(),
  find: jest.fn().mockReturnValue({ sort: jest.fn().mockReturnThis(), skip: jest.fn().mockReturnThis(), limit: jest.fn().mockReturnThis(), lean: jest.fn().mockResolvedValue([]) }),
  findOne: jest.fn().mockResolvedValue(null),
  countDocuments: jest.fn().mockResolvedValue(0),
  collection: mockCollection,
};

const mockCalcModel = {
  findOne: jest.fn().mockResolvedValue(null),
  collection: mockCollection,
};

const mockCalcAuditModel = {
  findOne: jest.fn().mockResolvedValue(null),
  collection: mockCollection,
};

const mockCalcUpversionModel = {
  findOne: jest.fn().mockResolvedValue(null),
  collection: { ...mockCollection, name: 'upversion_collection' },
};

describe('adminController', () => {
  let controller: any;
  let req: any;
  let res: any;

  beforeAll(async () => {
    controller = await initializeadminHistoryController();
  });

  beforeEach(() => {
    req = {
      body: {},
      query: {},
      params: {},
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      headersSent: false,
      locals: { user: { unique_name: 'test-user', name: 'Test User' } },
    };
    jest.clearAllMocks();
  });

  describe('normalizeVersion', () => {
    it('should normalize "1.0.0" to "1"', () => {
      expect(controller.normalizeVersion('1.0.0')).toBe('1');
    });

    it('should normalize "1.1.0" to "1.1"', () => {
      expect(controller.normalizeVersion('1.1.0')).toBe('1.1');
    });

    it('should normalize "1.2.3" to "1.2.3"', () => {
      expect(controller.normalizeVersion('1.2.3')).toBe('1.2.3');
    });

    it('should strip leading "v" from version string', () => {
      expect(controller.normalizeVersion('v2.0.0')).toBe('2');
    });

    it('should strip leading "V" from version string', () => {
      expect(controller.normalizeVersion('V3.1.0')).toBe('3.1');
    });

    it('should strip trailing dots from version string', () => {
      expect(controller.normalizeVersion('2.')).toBe('2');
    });

    it('should handle single integer version "5"', () => {
      expect(controller.normalizeVersion('5')).toBe('5');
    });

    it('should throw when version is null', () => {
      expect(() => controller.normalizeVersion(null)).toThrow('Version is required');
    });

    it('should throw when version is undefined', () => {
      expect(() => controller.normalizeVersion(undefined)).toThrow('Version is required');
    });

    it('should throw for invalid version format', () => {
      expect(() => controller.normalizeVersion('not-a-version')).toThrow('Invalid version format');
    });
  });

  describe('classifyVersion', () => {
    it('should classify "1" as a major version', () => {
      const result = controller.classifyVersion('1');
      expect(result.type).toBe('major');
    });

    it('should classify "2.0.0" as a major version', () => {
      const result = controller.classifyVersion('2.0.0');
      expect(result.type).toBe('major');
    });

    it('should classify "1.0" as a major version', () => {
      const result = controller.classifyVersion('1.0');
      expect(result.type).toBe('major');
    });

    it('should classify "1.1" as a minor version', () => {
      const result = controller.classifyVersion('1.1');
      expect(result.type).toBe('minor');
    });

    it('should classify "1.0.1" as a minor version', () => {
      const result = controller.classifyVersion('1.0.1');
      expect(result.type).toBe('minor');
    });

    it('should classify "3.2.5" as a minor version', () => {
      const result = controller.classifyVersion('3.2.5');
      expect(result.type).toBe('minor');
    });

    it('should return normalized version string', () => {
      const result = controller.classifyVersion('v2.0');
      expect(result.normalized).toBe('2.0');
    });

    it('should return the original version string', () => {
      const result = controller.classifyVersion('v3.1');
      expect(result.original).toBe('v3.1');
    });

    it('should throw when version is null or undefined', () => {
      expect(() => controller.classifyVersion(null)).toThrow('Version is required');
      expect(() => controller.classifyVersion(undefined)).toThrow('Version is required');
    });

    it('should throw for invalid version format', () => {
      expect(() => controller.classifyVersion('abc.def')).toThrow('Invalid version format');
    });
  });

  describe('allTrue', () => {
    it('should return true when all conditions are true', () => {
      expect(controller.allTrue([true, true, true])).toBe(true);
    });

    it('should return false when any condition is false', () => {
      expect(controller.allTrue([true, false, true])).toBe(false);
    });

    it('should return true for empty array', () => {
      expect(controller.allTrue([])).toBe(true);
    });

    it('should return false for array with single false', () => {
      expect(controller.allTrue([false])).toBe(false);
    });
  });

  describe('createAdminVersion', () => {
    it('should return 409 when version already exists (duplicate key error)', async () => {
      const dupError: any = new Error('Duplicate key');
      dupError.code = 11000;
      dupError.keyPattern = { version_number: 1 };
      dupError.keyValue = { version_number: '2.0' };

      mockAdminModel.create.mockRejectedValue(dupError);

      req.body = { version_number: '2.0', description: 'Test' };

      await controller.createAdminVersion(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({ type: 'DUPLICATE_KEY' }),
        })
      );
    });

    it('should return 500 when an unexpected error occurs', async () => {
      mockAdminModel.create.mockRejectedValue(new Error('Unexpected DB error'));

      req.body = { version_number: '3.0', description: 'Test' };

      await controller.createAdminVersion(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Something went wrong while saving admin version',
        })
      );
    });

    it('should return 400 for Mongoose validation errors', async () => {
      const validationError: any = new Error('Validation failed');
      validationError.name = 'ValidationError';
      validationError.errors = { description: { message: 'Description is required.' } };

      mockAdminModel.create.mockRejectedValue(validationError);

      req.body = { version_number: '3.0', description: '' };

      await controller.createAdminVersion(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getAdminVersions', () => {
    it('should return 200 with paginated versions', async () => {
      const mockDocs = [{ version_number: '1.0', description: 'First version', type: 'major' }];
      mockAdminModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockDocs),
      });
      mockAdminModel.countDocuments.mockResolvedValue(1);

      req.query = { page: '1', limit: '10' };

      await controller.getAdminVersions(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockDocs,
          pagination: expect.objectContaining({
            total: 1,
            page: 1,
          }),
        })
      );
    });

    it('should return empty data with "No admin versions found" message', async () => {
      mockAdminModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([]),
      });
      mockAdminModel.countDocuments.mockResolvedValue(0);

      req.query = { page: '1', limit: '10' };

      await controller.getAdminVersions(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'No admin versions found',
        })
      );
    });

    it('should apply search filter when search param is provided', async () => {
      const mockFind = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([]),
      };
      mockAdminModel.find.mockReturnValue(mockFind);
      mockAdminModel.countDocuments.mockResolvedValue(0);

      req.query = { page: '1', limit: '10', search: 'v2' };

      await controller.getAdminVersions(req, res);

      expect(mockAdminModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          $or: expect.arrayContaining([
            { version_number: { $regex: 'v2', $options: 'i' } },
          ]),
        })
      );
    });

    it('should return 500 when an error occurs', async () => {
      mockAdminModel.find.mockImplementation(() => {
        throw new Error('DB query failed');
      });

      req.query = { page: '1', limit: '10' };

      await controller.getAdminVersions(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
      );
    });

    it('should cap page number at minimum 1', async () => {
      const mockFind = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([]),
      };
      mockAdminModel.find.mockReturnValue(mockFind);
      mockAdminModel.countDocuments.mockResolvedValue(0);

      req.query = { page: '-5', limit: '10' };

      await controller.getAdminVersions(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const callArg = (res.json as jest.Mock).mock.calls[0][0];
      expect(callArg.pagination.page).toBe(1);
    });
  });
});
