import { NextFunction } from 'express';
import { initializeUserAppVersionController } from '../userappversion.controller';
import { mockRequest, mockResponse } from '../../../utils/MockInterceptor';

const mockExec = jest.fn();
const mockChainable = { exec: mockExec };

const mockModelInstance = {
  aggregate: jest.fn().mockReturnValue(mockChainable),
  findOneAndUpdate: jest.fn().mockReturnValue(mockChainable),
};

jest.mock('../userappversion.model.js', () => ({
  __esModule: true,
  initializeUserAppVersionModel: jest.fn(),
  default: jest.fn(() => mockModelInstance), 
}));

describe('UserAppVersion Controller', () => {
  let controller: any;
  let req: any;
  let res: any;
  let next: NextFunction;

  beforeAll(async () => {
    controller = await initializeUserAppVersionController();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    req = mockRequest();
    res = mockResponse();
    next = jest.fn();
  });

  describe('findById', () => {
    it('should return 200 and the document when found', async () => {
      req.params = { id: 'test@example.com' }; 
      const mockDoc = [{ mail: 'test@example.com', version: 1 }];
      mockExec.mockResolvedValueOnce(mockDoc);

      await controller.findById(req, res, next);

      expect(mockModelInstance.aggregate).toHaveBeenCalledWith([
        { $match: { mail: 'test@example.com' } }
      ]);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockDoc);
    });

    it('should call next with error if database operation fails', async () => {
      req.params = { id: 'test@example.com' };
      const error = new Error('Database error');
      mockExec.mockRejectedValueOnce(error);

      await controller.findById(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('findByIdAndUpdate', () => {
    it('should upsert document and return 204', async () => {
      req.params = { id: 'test@example.com' };
      req.body = { sipVersionAcknowledged: 1.5 }; 
      
      const expectedQuery = { mail: 'test@example.com' };
      const expectedPipeline = [{
        $set: { mail: 'test@example.com', sipVersionAcknowledged: 1.5 }
      }];
      const expectedOptions = { new: true, upsert: true, setDefaultOnInsert: true };

      const mockUpdateDoc = { mail: 'test@example.com', sipVersionAcknowledged: 1.5 };
      mockExec.mockResolvedValueOnce(mockUpdateDoc);

      await controller.findByIdAndUpdate(req, res, next);

      expect(mockModelInstance.findOneAndUpdate).toHaveBeenCalledWith(
        expectedQuery,
        expectedPipeline,
        expectedOptions
      );
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.json).toHaveBeenCalledWith(mockUpdateDoc);
    });

    it('should call next with error if update fails', async () => {
      req.params = { id: 'test@example.com' };
      req.body = {};
      const error = new Error('Update failed');
      mockExec.mockRejectedValueOnce(error);

      await controller.findByIdAndUpdate(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});