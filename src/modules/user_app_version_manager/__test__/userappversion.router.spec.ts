import { Router } from 'express';
import userAppVersionRouter from '../userappversion.routes';
import { initializeUserAppVersionController } from '../userappversion.controller.js';

jest.mock('../userappversion.controller.js', () => ({
  __esModule: true,
  initializeUserAppVersionController: jest.fn(),
}));

const mockGet = jest.fn();
const mockPost = jest.fn();
const mockRouter = {
  get: mockGet,
  post: mockPost,
};

jest.mock('express', () => ({
  Router: jest.fn(() => mockRouter),
}));

describe('UserAppVersion Router', () => {
  const mockFindById = jest.fn();
  const mockFindByIdAndUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (initializeUserAppVersionController as jest.Mock).mockResolvedValue({
      findById: mockFindById,
      findByIdAndUpdate: mockFindByIdAndUpdate,
    });
  });

  it('should register GET and POST routes on initialization', async () => {
    await userAppVersionRouter();

    expect(Router).toHaveBeenCalled();
    expect(mockGet).toHaveBeenCalledWith('/:id', expect.any(Function));
    expect(mockPost).toHaveBeenCalledWith('/:id', expect.any(Function));
  });

  it('should bind the GET route to controller.findById', async () => {
    await userAppVersionRouter();
    
    const routeCallback = mockGet.mock.calls[0][1];

    const req = {} as any;
    const res = {} as any;
    const next = jest.fn();

    await routeCallback(req, res, next);

    expect(mockFindById).toHaveBeenCalledWith(req, res, next);
  });

  it('should bind the POST route to controller.findByIdAndUpdate', async () => {
    await userAppVersionRouter();

    const routeCallback = mockPost.mock.calls[0][1];

    const req = {} as any;
    const res = {} as any;
    const next = jest.fn();

    await routeCallback(req, res, next);

    expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(req, res, next);
  });
});