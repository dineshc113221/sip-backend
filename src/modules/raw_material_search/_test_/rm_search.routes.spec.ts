import RawMaterialRouter from "../rm_search.routes.js";
import RawMaterialsModel, { initializeRawMaterialModel } from "../rm_search.model.js";
import FrmlRawMaterialsModel, { initializeFrmlRawMaterialModel } from "../frm_rm_search.model.js";

import { mockRequest, mockResponse } from "../../../utils/MockInterceptor.js";
import RawMaterialSearch from "../../../mocks/RawMaterialSearch.mock.json";
import express from "express";

const mockedProductSearchModel = RawMaterialsModel as jest.Mock;
const mockedinitializeComponentSearchModel = initializeRawMaterialModel as jest.Mock;
FrmlRawMaterialsModel as jest.Mock;
initializeFrmlRawMaterialModel as jest.Mock;
jest.mock("../rm_search.model");
jest.mock("../frm_rm_search.model");

jest.mock('sequelize', () => {
  const mockSequelize = {
    authenticate: jest.fn().mockResolvedValue(undefined),
    define: jest.fn(),
    sync: jest.fn(),
    close: jest.fn(),
  };
  return { Sequelize: jest.fn(() => mockSequelize) };
});
jest.mock('../../../lib/db.connection', () => ({
  connections: jest.fn().mockResolvedValue({
    connection: { readyState: 1 },
    disconnect:jest.fn()
  })
}));
describe('RawMaterialRouter', () => {

    it('Should route to getRMSeachCodes', async () => {
        mockedProductSearchModel.mockReturnValue({
            find: jest.fn().mockReturnThis(),
            sort: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            toArray: jest.fn().mockResolvedValue(
                [{ details:{
                    rawMaterialId: "test",
                    tradeName: "tradeTest"
                } }]).mockReturnValue(RawMaterialSearch),
        })
        mockedinitializeComponentSearchModel.mockReturnValue({
            find: jest.fn().mockReturnThis(),
            sort: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            toArray: jest.fn().mockResolvedValue([{ details:{
                    rawMaterialId: "test",
                    tradeName: "tradeTest"
                } }]).mockReturnValue(RawMaterialSearch),
        })
        const res = mockResponse();
        const req = mockRequest();
        req.query = {
          page: "1",
          limit: "1000",
          initialLetters: "PC-000"
        };
        req.header['x-consumer-userId'] = 'ITEST236';
        const mRouter = {
          get: (path, callback) => {
            if (path === '/findRawMaterial') {
              callback(req, res);
            }
          },
          then: jest.fn()
        } as never;
        jest.spyOn(express, 'Router').mockImplementationOnce(() => mRouter);
    
    
        RawMaterialRouter();
    });
    it('Should route to getRMSearchDetails', async() => {
        mockedProductSearchModel.mockReturnValue({
            findOne: jest.fn().mockResolvedValue([{ details:{
                    rawMaterialId: "test",
                    tradeName: "tradeTest"
                } }]).mockReturnValue(RawMaterialSearch),
            find: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            toArray: jest.fn().mockResolvedValue([{ details:{
                    rawMaterialId: "test",
                    tradeName: "tradeTest"
                } }]).mockReturnValue(RawMaterialSearch),
        })
        mockedinitializeComponentSearchModel.mockReturnValue({
            findOne: jest.fn().mockResolvedValue([{ details:{
                    rawMaterialId: "test",
                    tradeName: "tradeTest"
                } }]).mockReturnValue(RawMaterialSearch),
            find: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            toArray: jest.fn().mockResolvedValue([{ details:{
                    rawMaterialId: "test",
                    tradeName: "tradeTest"
                } }]).mockReturnValue(RawMaterialSearch),
        })
        const res = mockResponse();
        const req = mockRequest();
        req.params = {
            rmCode: "test"
        }
        req.query = {
            page: "1",
            limit: "1000",
            initialLetters: "PC-000"
          };
          req.header['x-consumer-userId'] = 'ITEST236';
    const mRouter = {
      get: (path, callback) => {
        if (path === '/findRawMaterial/:rmCode') {
          callback(req, res);
        }
      },
      then: jest.fn()
    } as never;
    jest.spyOn(express, 'Router').mockImplementationOnce(() => mRouter);

    RawMaterialRouter();
    });
});

