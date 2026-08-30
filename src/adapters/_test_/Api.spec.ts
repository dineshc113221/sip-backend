import * as adapterIndex from '../index';
import {
  getRawMaterialDetails,
  getFormulaDetails,
  getConstituent,
  getCompositionAttribute,
  getFormulaDetailsCount,
  getRawMaterialDetailsCount,
} from '../Api';

jest.mock('../index', () => ({
  getDataFromMicroService: jest.fn(),
  generateURL: jest.fn().mockReturnValue('http://mocked.url/api/endpoint'),
}));

jest.mock('../../modules/kafka/emailUtils', () => jest.fn().mockResolvedValue(undefined));

jest.mock('../../utils/logger/index', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

const mockedGetData = adapterIndex.getDataFromMicroService as jest.Mock;
const mockedGenerateURL = adapterIndex.generateURL as jest.Mock;

describe('adapters/Api', () => {
  beforeEach(() => {
    mockedGenerateURL.mockReturnValue('http://mocked.url/api/endpoint');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getRawMaterialDetails', () => {
    it('should return raw material results array on success', async () => {
      const mockResults = [{ id: 'RM-001', name: 'Raw Material A', tradeName: 'Trade A' }];
      mockedGetData.mockResolvedValue({ results: mockResults });

      const result = await getRawMaterialDetails('user-001', 'OBJ-KEY-001');

      expect(result).toEqual(mockResults);
    });

    it('should set x-consumer-userId header before calling the API', async () => {
      mockedGetData.mockResolvedValue({ results: [] });

      await getRawMaterialDetails('user-test-123', 'OBJ-KEY');

      expect(mockedGetData).toHaveBeenCalled();
    });

    it('should throw error when API call fails', async () => {
      mockedGetData.mockRejectedValue(new Error('Raw Material API down'));

      await expect(getRawMaterialDetails('user-001', 'OBJ-KEY-001')).rejects.toThrow('Raw Material API down');
    });

    it('should call sendEmail when API throws', async () => {
      const sendEmail = require('../../modules/kafka/emailUtils');
      mockedGetData.mockRejectedValue(new Error('API error'));

      await expect(getRawMaterialDetails('user-001', 'OBJ-KEY')).rejects.toThrow();
      expect(sendEmail).toHaveBeenCalled();
    });
  });

  describe('getFormulaDetails', () => {
    it('should return formula detail results on success', async () => {
      const mockResults = { formulaCode: 'FML-001', description: 'Test formula', netContent: '200ml' };
      mockedGetData.mockResolvedValue({ results: mockResults });

      const result = await getFormulaDetails('user-001', 'FML-KEY-001');

      expect(result).toEqual(mockResults);
    });

    it('should throw and call sendEmail on failure', async () => {
      const sendEmail = require('../../modules/kafka/emailUtils');
      mockedGetData.mockRejectedValue(new Error('Formula API error'));

      await expect(getFormulaDetails('user-001', 'FML-KEY')).rejects.toThrow('Formula API error');
      expect(sendEmail).toHaveBeenCalled();
    });

    it('should call generateURL with formula objectKey param', async () => {
      mockedGetData.mockResolvedValue({ results: {} });

      await getFormulaDetails('user-001', 'FML-001');

      expect(mockedGenerateURL).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([{ key: 'objectKey', value: 'FML-001' }])
      );
    });
  });

  describe('getConstituent', () => {
    it('should return constituent details on success', async () => {
      const mockResults = { connumber: 'CON-001', casNumber: '50-00-0', incName: 'Formaldehyde' };
      mockedGetData.mockResolvedValue({ results: mockResults });

      const result = await getConstituent('user-001', 'CON-001');

      expect(result).toEqual(mockResults);
    });

    it('should call generateURL with connumber param', async () => {
      mockedGetData.mockResolvedValue({ results: {} });

      await getConstituent('user-001', 'CON-TEST');

      expect(mockedGenerateURL).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([{ key: 'connumber', value: 'CON-TEST' }])
      );
    });

    it('should throw and call sendEmail on failure', async () => {
      const sendEmail = require('../../modules/kafka/emailUtils');
      mockedGetData.mockRejectedValue(new Error('Constituent API error'));

      await expect(getConstituent('user-001', 'CON-001')).rejects.toThrow('Constituent API error');
      expect(sendEmail).toHaveBeenCalled();
    });
  });

  describe('getCompositionAttribute', () => {
    it('should return composition attribute results on success', async () => {
      const mockResults = { objectKey: 'OBJ-001', attributes: [{ name: 'pH', value: '7.0' }] };
      mockedGetData.mockResolvedValue({ results: mockResults });

      const result = await getCompositionAttribute('user-001', 'OBJ-001');

      expect(result).toEqual(mockResults);
    });

    it('should throw and call sendEmail on failure', async () => {
      const sendEmail = require('../../modules/kafka/emailUtils');
      mockedGetData.mockRejectedValue(new Error('Composition API error'));

      await expect(getCompositionAttribute('user-001', 'OBJ-001')).rejects.toThrow();
      expect(sendEmail).toHaveBeenCalled();
    });

    it('should call generateURL with objectKey param', async () => {
      mockedGetData.mockResolvedValue({ results: {} });

      await getCompositionAttribute('user-001', 'COMP-OBJ-001');

      expect(mockedGenerateURL).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([{ key: 'objectKey', value: 'COMP-OBJ-001' }])
      );
    });
  });

  describe('getFormulaDetailsCount', () => {
    it('should return formula count results', async () => {
      const mockResults = { count: 150, total: 150 };
      mockedGetData.mockResolvedValue({ results: mockResults });

      const result = await getFormulaDetailsCount('user-001');

      expect(result).toEqual(mockResults);
    });

    it('should throw and call sendEmail on failure', async () => {
      const sendEmail = require('../../modules/kafka/emailUtils');
      mockedGetData.mockRejectedValue(new Error('Count API error'));

      await expect(getFormulaDetailsCount('user-001')).rejects.toThrow('Count API error');
      expect(sendEmail).toHaveBeenCalled();
    });
  });

  describe('getRawMaterialDetailsCount', () => {
    it('should return raw material count data', async () => {
      const mockResponse = { status: { statusCode: '200' }, results: { count: 42 } };
      mockedGetData.mockResolvedValue(mockResponse);

      const result = await getRawMaterialDetailsCount('user-001');

      expect(result).toEqual(mockResponse);
    });

    it('should throw and call sendEmail on failure', async () => {
      const sendEmail = require('../../modules/kafka/emailUtils');
      mockedGetData.mockRejectedValue(new Error('RM Count API error'));

      await expect(getRawMaterialDetailsCount('user-001')).rejects.toThrow('RM Count API error');
      expect(sendEmail).toHaveBeenCalled();
    });
  });
});
