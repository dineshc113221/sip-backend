import { verifyToken } from '../auth.service';
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');

jest.mock('../../lib/db.connection', () => ({
  connections: {
    mainDb: Promise.resolve({
      model: jest.fn().mockReturnValue({}),
    }),
  },
}));

describe('auth.service - verifyToken', () => {
  let req: any;
  let res: any;
  let next: jest.Mock;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      locals: {},
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 when no authorization header is provided', async () => {
    req.headers.authorization = undefined;

    await verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next() and attach decoded user to res.locals when token is valid', async () => {
    const mockDecoded = { userId: 'user-123', name: 'Test User', email: 'test@test.com' };
    req.headers.authorization = 'Bearer valid.jwt.token';
    (jwt.decode as jest.Mock).mockReturnValue(mockDecoded);

    await verifyToken(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.locals.user).toEqual(mockDecoded);
    expect(res.status).not.toHaveBeenCalledWith(401);
  });

  it('should return 401 when jwt.decode returns null (invalid or expired token)', async () => {
    req.headers.authorization = 'Bearer invalid.token.here';
    (jwt.decode as jest.Mock).mockReturnValue(null);

    await verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 when jwt.decode returns false', async () => {
    req.headers.authorization = 'Bearer bad.token';
    (jwt.decode as jest.Mock).mockReturnValue(false);

    await verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 and not throw when jwt.decode throws an exception', async () => {
    req.headers.authorization = 'Bearer errored.token';
    (jwt.decode as jest.Mock).mockImplementation(() => {
      throw new Error('Malformed token');
    });

    await verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should handle token without Bearer prefix', async () => {
    req.headers.authorization = 'rawtoken123';
    (jwt.decode as jest.Mock).mockReturnValue({ sub: 'user-456' });

    await verifyToken(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should strip "Bearer " from token before decoding', async () => {
    req.headers.authorization = 'Bearer my.jwt.token';
    (jwt.decode as jest.Mock).mockReturnValue({ sub: 'user-789' });

    await verifyToken(req, res, next);

    expect(jwt.decode).toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it('should return 401 when authorization header is an empty string', async () => {
    req.headers.authorization = '';
    (jwt.decode as jest.Mock).mockReturnValue(null);

    await verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });
});
