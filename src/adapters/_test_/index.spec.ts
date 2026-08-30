import axios from 'axios';
import { getDataFromMicroService, generateURL } from '../index';

jest.mock('axios');

jest.mock('../../modules/kafka/emailUtils', () => jest.fn().mockResolvedValue(undefined));

jest.mock('../../utils/logger/index', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('adapters/index', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getDataFromMicroService', () => {
    it('should return response data on a successful GET request', async () => {
      const mockData = { status: { statusCode: '200', message: 'OK' }, results: [{ id: 1, name: 'test' }] };
      (axios.request as jest.Mock).mockResolvedValue({ data: mockData });

      const result = await getDataFromMicroService('http://api.test.com/data', 'get', { 'x-consumer-userId': 'user1' });

      expect(axios.request).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'get', url: 'http://api.test.com/data' })
      );
      expect(result).toEqual(mockData);
    });

    it('should NOT include data property in request for GET method', async () => {
      (axios.request as jest.Mock).mockResolvedValue({ data: { results: [] } });

      await getDataFromMicroService('http://api.test.com/data', 'get', {}, { body: 'payload' });

      const calledArgs = (axios.request as jest.Mock).mock.calls[0][0];
      expect(calledArgs).not.toHaveProperty('data');
    });

    it('should include data body for POST requests', async () => {
      const requestBody = { name: 'test', value: 42 };
      (axios.request as jest.Mock).mockResolvedValue({ data: { results: [] } });

      await getDataFromMicroService('http://api.test.com/data', 'post', {}, requestBody);

      expect(axios.request).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'post', data: requestBody })
      );
    });

    it('should include data body for PUT requests', async () => {
      const requestBody = { update: 'value' };
      (axios.request as jest.Mock).mockResolvedValue({ data: { results: [] } });

      await getDataFromMicroService('http://api.test.com/data', 'put', {}, requestBody);

      expect(axios.request).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'put', data: requestBody })
      );
    });

    it('should include data body for DELETE requests', async () => {
      const requestBody = { id: '123' };
      (axios.request as jest.Mock).mockResolvedValue({ data: { results: [] } });

      await getDataFromMicroService('http://api.test.com/data', 'delete', {}, requestBody);

      expect(axios.request).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'delete', data: requestBody })
      );
    });

    it('should return error response with statusCode 500 when axios throws', async () => {
      const networkError = { message: 'Network Error', response: { data: 'server error details' } };
      (axios.request as jest.Mock).mockRejectedValue(networkError);

      const result = await getDataFromMicroService('http://api.test.com/data', 'get', {});

      expect(result.status.statusCode).toBe('500');
      expect(result.status.message).toBe('Network Error');
      expect(result.results).toEqual([]);
    });

    it('should return empty results array on error', async () => {
      (axios.request as jest.Mock).mockRejectedValue(new Error('Timeout'));

      const result = await getDataFromMicroService('http://api.test.com/data', 'get', {});

      expect(result.results).toEqual([]);
    });

    it('should send email notification when an error occurs', async () => {
      const sendEmail = require('../../modules/kafka/emailUtils');
      (axios.request as jest.Mock).mockRejectedValue({ message: 'API Down', response: { data: 'error' } });

      await getDataFromMicroService('http://api.test.com/data', 'get', {});

      expect(sendEmail).toHaveBeenCalledWith(
        expect.stringContaining('GetDataFromMicroService REST URL')
      );
    });

    it('should pass custom headers to axios request', async () => {
      const customHeaders = { Authorization: 'Bearer token123', 'x-consumer-userId': 'user-456' };
      (axios.request as jest.Mock).mockResolvedValue({ data: { results: [] } });

      await getDataFromMicroService('http://api.test.com/data', 'get', customHeaders);

      expect(axios.request).toHaveBeenCalledWith(
        expect.objectContaining({ headers: customHeaders })
      );
    });
  });

  describe('generateURL', () => {
    it('should return the path unchanged with no query params', () => {
      expect(generateURL('/api/endpoint')).toBe('/api/endpoint');
    });

    it('should return empty string for null path', () => {
      expect(generateURL(null)).toBe('');
    });

    it('should return empty string for undefined path', () => {
      expect(generateURL(undefined)).toBe('');
    });

    it('should append a single query param with ? separator', () => {
      const result = generateURL('/api/search', [{ key: 'q', value: 'test' }]);

      expect(result).toBe('/api/search?q=test');
    });

    it('should encode special characters in param key and value', () => {
      const result = generateURL('/api/search', [{ key: 'filter', value: 'hello world' }]);

      expect(result).toContain('filter=hello%20world');
    });

    it('should encode & and = in query param values', () => {
      const result = generateURL('/api/data', [{ key: 'q', value: 'foo=bar&baz' }]);

      expect(result).toContain('q=foo%3Dbar%26baz');
    });

    it('should join multiple query params with & separator', () => {
      const result = generateURL('/api/data', [
        { key: 'page', value: '2' },
        { key: 'limit', value: '50' },
        { key: 'sort', value: 'name' },
      ]);

      expect(result).toBe('/api/data?page=2&limit=50&sort=name');
    });

    it('should return just the path for an empty query params array', () => {
      expect(generateURL('/api/data', [])).toBe('/api/data');
    });

    it('should handle path with existing path segments', () => {
      const result = generateURL('/api/v1/users/profile', [{ key: 'id', value: '123' }]);

      expect(result).toBe('/api/v1/users/profile?id=123');
    });
  });
});
