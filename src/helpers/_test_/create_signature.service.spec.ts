import { createSignedRequest } from '../create_signature.service';

jest.mock('crypto-js', () => {
  const mockHashValue = {
    toString: jest.fn().mockReturnValue('abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'),
  };
  return {
    SHA256: jest.fn().mockReturnValue(mockHashValue),
    HmacSHA256: jest.fn().mockReturnValue(mockHashValue),
    enc: { Hex: 'hex' },
  };
});

jest.mock('../../data/config', () => ({
  config: {
    AWS_ACCESS_KEY: 'AKIA-TEST-ACCESS-KEY-12345',
    AWS_SECRET_KEY: 'test-secret-key-value-for-signing',
  },
}));

describe('create_signature.service - createSignedRequest', () => {
  const testUrl = 'https://lambda.us-east-1.amazonaws.com';
  const testPayload = { key: 'value', data: 'test-data' };
  const testService = 'lambda';
  const testFunctionName = 'my-lambda-function';
  const testMethod = 'POST';
  const testRegion = 'us-east-1';

  it('should return an object with endpoint, headers, and body properties', () => {
    const result = createSignedRequest(testUrl, testPayload, testService, testFunctionName, testMethod, testRegion);

    expect(result).toHaveProperty('endpoint');
    expect(result).toHaveProperty('headers');
    expect(result).toHaveProperty('body');
  });

  it('should set endpoint to the provided URL', () => {
    const result = createSignedRequest(testUrl, testPayload, testService, testFunctionName, testMethod, testRegion);

    expect(result.endpoint).toBe(testUrl);
  });

  it('should set Content-Type header to application/json', () => {
    const result = createSignedRequest(testUrl, testPayload, testService, testFunctionName, testMethod, testRegion);

    expect(result.headers['Content-Type']).toBe('application/json');
  });

  it('should include X-Amz-Date header', () => {
    const result = createSignedRequest(testUrl, testPayload, testService, testFunctionName, testMethod, testRegion);

    expect(result.headers).toHaveProperty('X-Amz-Date');
    expect(typeof result.headers['X-Amz-Date']).toBe('string');
  });

  it('should include Authorization header', () => {
    const result = createSignedRequest(testUrl, testPayload, testService, testFunctionName, testMethod, testRegion);

    expect(result.headers).toHaveProperty('Authorization');
  });

  it('should include AWS4-HMAC-SHA256 algorithm in Authorization header', () => {
    const result = createSignedRequest(testUrl, testPayload, testService, testFunctionName, testMethod, testRegion);

    expect(result.headers.Authorization).toContain('AWS4-HMAC-SHA256');
  });

  it('should include access key in Authorization Credential field', () => {
    const result = createSignedRequest(testUrl, testPayload, testService, testFunctionName, testMethod, testRegion);

    expect(result.headers.Authorization).toContain('Credential=AKIA-TEST-ACCESS-KEY-12345/');
  });

  it('should include region in Authorization header', () => {
    const result = createSignedRequest(testUrl, testPayload, testService, testFunctionName, testMethod, testRegion);

    expect(result.headers.Authorization).toContain('us-east-1');
  });

  it('should include service name in Authorization header', () => {
    const result = createSignedRequest(testUrl, testPayload, testService, testFunctionName, testMethod, testRegion);

    expect(result.headers.Authorization).toContain('lambda');
  });

  it('should include SignedHeaders in Authorization header', () => {
    const result = createSignedRequest(testUrl, testPayload, testService, testFunctionName, testMethod, testRegion);

    expect(result.headers.Authorization).toContain('SignedHeaders=host;x-amz-date');
  });

  it('should serialize payload as JSON string in body', () => {
    const result = createSignedRequest(testUrl, testPayload, testService, testFunctionName, testMethod, testRegion);

    expect(result.body).toBe(JSON.stringify(testPayload));
  });

  it('should serialize empty object payload correctly', () => {
    const result = createSignedRequest(testUrl, {}, testService, testFunctionName, testMethod, testRegion);

    expect(result.body).toBe('{}');
  });

  it('should handle undefined functionName without throwing', () => {
    const result = createSignedRequest(testUrl, testPayload, testService, undefined, testMethod, testRegion);

    expect(result).toHaveProperty('endpoint');
    expect(result).toHaveProperty('headers');
    expect(result).toHaveProperty('body');
  });

  it('should work with GET method type', () => {
    const result = createSignedRequest(testUrl, testPayload, testService, testFunctionName, 'GET', testRegion);

    expect(result).toHaveProperty('endpoint');
    expect(result.headers.Authorization).toContain('AWS4-HMAC-SHA256');
  });

  it('should use different regions correctly', () => {
    const resultEu = createSignedRequest(testUrl, testPayload, testService, testFunctionName, testMethod, 'eu-west-1');

    expect(resultEu.headers.Authorization).toContain('eu-west-1');
  });
});
