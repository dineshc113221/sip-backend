import mongoose from 'mongoose';
import { initializeUserAppVersionModel } from '../userappversion.model';
import userAppVersionSchema from '../userappversion.schema';
import { connections } from '../../../lib/db.connection.js';

jest.mock('../../../lib/db.connection.js', () => {
  const mockModelFn = jest.fn();
  const mockConnectionObj = {
    model: mockModelFn,
    on: jest.fn(),
    once: jest.fn(),
  };

  return {
    __esModule: true,
    connections: {
      mainDb: Promise.resolve(mockConnectionObj)
    },
    closeConnections: jest.fn().mockResolvedValue(undefined)
  };
});

describe('UserAppVersion Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize the model using the database connection', async () => {
      await initializeUserAppVersionModel();

      const db = await connections.mainDb;
      
      expect(db.model).toHaveBeenCalledWith(
        'user_app_version',
        expect.any(mongoose.Schema)
      );
    });
  });

  describe('Schema Validation', () => {
    const TestModel = mongoose.model('test_user_app_version_schema_check', userAppVersionSchema);

    it('should validate correctly when all required fields are present', () => {
      const doc = new TestModel({
        mail: 'test@example.com',
        userPrincipalName: 'test_upn',
        sipVersionAcknowledged: 1
      });
      
      const error = doc.validateSync();
      expect(error).toBeUndefined();
    });

    it('should throw validation error when required fields are missing', () => {
      const doc = new TestModel({});
      const error = doc.validateSync();
      
      expect(error).toBeDefined();
      if (error) {
        expect(error.errors['mail']).toBeDefined();
        expect(error.errors['userPrincipalName']).toBeDefined();
        expect(error.errors['sipVersionAcknowledged']).toBeDefined();
      }
    });
  });
});