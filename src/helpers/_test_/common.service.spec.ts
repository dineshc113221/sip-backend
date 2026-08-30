import {mockRequest,  mockResponse } from "../../utils/MockInterceptor";
import { dateDiffInDays, escapeRegExp, isValidId, validateInputs, validateHeaders, capitalizeFirstLetter, formatLabel } from "../common.service";

jest.mock('../../lib/db.connection', () => ({
  connections: jest.fn().mockResolvedValue({
    connection: { readyState: 1 },
    disconnect:jest.fn()
  })
}));

describe('Attributes versioning Controller', () => {

  it('Should be able to test validateInputs', async () => {
    const res = mockResponse();
    const req = mockRequest();
    const next = jest.fn();
    req.query = {
      page: "1",
      limit: "1000",
      initialLetters: "PC-000"
    };
    req.header['x-consumer-userId'] = 'ITEST236';
    const baseElement = validateInputs(req, res, next ,"body", {})
    expect(baseElement).not.toBeNull();
  });

  it('Should be able to test validateInputs', async () => {
    const res = mockResponse();
    const req = mockRequest();
    const next = jest.fn();
    req.query = {
      page: "1",
      limit: "1000",
      initialLetters: "PC-000"
    };
    req.header['x-consumer-userId'] = 'ITEST236';
    const baseElement = validateInputs(req, res, next ,"query", {})
    expect(baseElement).not.toBeNull();
  });

  it('Should be able to test escapeRegExp', async () => {
    const baseElement = escapeRegExp("query")
    expect(baseElement).not.toBeNull();
  });

  it('Should be able to test isValidId', async () => {
    const baseElement = isValidId("query")
    expect(baseElement).not.toBeNull();
  });

  it('Should be able to test dateDiffInDays', async () => {
    const baseElement = dateDiffInDays(new Date(), new Date())
    expect(baseElement).not.toBeNull();
  });

  it('Should return 0 days difference for the same date', () => {
    const date = new Date('2024-01-15');
    expect(dateDiffInDays(date, date)).toBe(0);
  });

  it('Should return 7 days difference for a week apart', () => {
    const first = new Date('2024-01-01');
    const second = new Date('2024-01-08');
    expect(dateDiffInDays(first, second)).toBe(7);
  });

  it('Should return negative value when second date is before first date', () => {
    const first = new Date('2024-01-10');
    const second = new Date('2024-01-01');
    expect(dateDiffInDays(first, second)).toBe(-9);
  });

  it('Should escape all special regex characters', () => {
    const result = escapeRegExp('hello.world(test)*+?');
    expect(result).toContain('\\.');
    expect(result).toContain('\\(');
    expect(result).toContain('\\*');
    expect(result).toContain('\\+');
    expect(result).toContain('\\?');
  });

  it('Should return true for a valid MongoDB ObjectId', () => {
    const validId = '507f1f77bcf86cd799439011';
    expect(isValidId(validId)).toBe(true);
  });

  it('Should return false for an invalid MongoDB ObjectId', () => {
    expect(isValidId('not-a-valid-id')).toBe(false);
    expect(isValidId('')).toBe(false);
    expect(isValidId('123')).toBe(false);
  });

  describe('validateHeaders', () => {
    it('Should throw when x-consumer-system header is missing', async () => {
      const req = mockRequest();
      req.headers = {
        'x-consumer-correlationid': 'corr-123',
        'x-consumer-timestamp': '2024-01-01T00:00:00Z',
        'content-type': 'application/json',
      };

      await expect(validateHeaders(req)).rejects.toThrow('x-consumer-system is required');
    });

    it('Should throw when x-consumer-correlationId header is missing', async () => {
      const req = mockRequest();
      req.headers = {
        'x-consumer-system': 'test-system',
        'x-consumer-timestamp': '2024-01-01T00:00:00Z',
        'content-type': 'application/json',
      };

      await expect(validateHeaders(req)).rejects.toThrow('x-consumer-correlationId is required');
    });

    it('Should throw when x-consumer-timestamp header is missing', async () => {
      const req = mockRequest();
      req.headers = {
        'x-consumer-system': 'test-system',
        'x-consumer-correlationid': 'corr-123',
        'content-type': 'application/json',
      };

      await expect(validateHeaders(req)).rejects.toThrow('x-consumer-timestamp is required');
    });

    it('Should throw when content-type header is missing', async () => {
      const req = mockRequest();
      req.headers = {
        'x-consumer-system': 'test-system',
        'x-consumer-correlationid': 'corr-123',
        'x-consumer-timestamp': '2024-01-01T00:00:00Z',
      };

      await expect(validateHeaders(req)).rejects.toThrow('content-type is required');
    });

    it('Should resolve without error when all required headers are present', async () => {
      const req = mockRequest();
      req.headers = {
        'x-consumer-system': 'test-system',
        'x-consumer-correlationid': 'corr-123',
        'x-consumer-timestamp': '2024-01-01T00:00:00Z',
        'content-type': 'application/json',
      };

      await expect(validateHeaders(req)).resolves.toBeUndefined();
    });
  });

  describe('capitalizeFirstLetter', () => {
    it('Should capitalize the first letter of a lowercase string', () => {
      expect(capitalizeFirstLetter('hello')).toBe('Hello');
    });

    it('Should keep rest of string unchanged', () => {
      expect(capitalizeFirstLetter('hello world')).toBe('Hello world');
    });

    it('Should handle single character string', () => {
      expect(capitalizeFirstLetter('a')).toBe('A');
    });

    it('Should handle already capitalized string', () => {
      expect(capitalizeFirstLetter('Hello')).toBe('Hello');
    });

    it('Should handle empty string', () => {
      expect(capitalizeFirstLetter('')).toBe('');
    });
  });

  describe('formatLabel', () => {
    it('Should capitalize first letter via formatLabel', () => {
      expect(formatLabel('rawMaterial')).toBe('RawMaterial');
    });

    it('Should return the same result as capitalizeFirstLetter', () => {
      expect(formatLabel('test string')).toBe(capitalizeFirstLetter('test string'));
    });
  });
});
