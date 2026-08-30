import { mockRequest, mockResponse } from "../../../utils/MockInterceptor.js";
import masterDataRouter from "../master-data.routes.js";
import MasterDataModel, { initializeMasterDataModel } from "../master-data.model.js";
import express from "express";

const mockedMasterDataModel = MasterDataModel as jest.Mock;
const mockedinitializeMasterDataModel = initializeMasterDataModel as jest.Mock;

jest.mock("../master-data.model");
jest.mock('../../../lib/db.connection', () => ({
  connections: jest.fn().mockResolvedValue({
    connection: { readyState: 1 },
    disconnect:jest.fn()
  })
}));
describe('masterDataRouter', () => {
  const res = mockResponse();
    const req = mockRequest();
    const next = jest.fn()

    req.header['x-consumer-userId'] = 'ITEST236';

  it('Should route to pagination for success message', async () => {

    mockedMasterDataModel.mockReturnValue({
      find: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
    })
    mockedinitializeMasterDataModel.mockReturnValue({
      find: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
    })
    const mRouter = {
      get: (path, callback) => {
        if (path === '/') {
          callback(req, res, next);
        }
      },
      then: jest.fn()
    }as never;
    jest.spyOn(express, 'Router').mockImplementationOnce(() => mRouter);

    masterDataRouter();
  });

});
