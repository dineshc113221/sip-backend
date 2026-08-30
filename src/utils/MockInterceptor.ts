export const mockRequest = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const req: any = {};

  req.body = jest.fn().mockReturnValue(req);
  req.params = jest.fn().mockReturnValue(req);
  req.header = jest.fn().mockReturnValue(req);
  req.query = jest.fn().mockReturnValue(req);
  req.locals = jest.fn().mockReturnValue(req);
  return req;
};

export const mockResponse = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res: any = {};
  res.send = jest.fn().mockReturnValue(res);
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);

  return res;
};
