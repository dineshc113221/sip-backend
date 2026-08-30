import ComponentSearchRouter from "../component_search.routes.js";
import ProductSearchModel, { initializeComponentSearchModel } from "../component_search.model.js";
import { mockRequest, mockResponse } from "../../../utils/MockInterceptor.js";
import ComponentSearchMock from "../../../mocks/ComponentSeach.mock.json";
import express from "express";

const mockedProductSearchModel = ProductSearchModel as jest.Mock;
const mockedinitializeComponentSearchModel = initializeComponentSearchModel as jest.Mock;

jest.mock("../component_search.model");
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

describe('ComponentSearchRouter', () => {


  it('Should route to getComponentSeachCodes', async () => {
    mockedProductSearchModel.mockReturnValue({
      find: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      toArray: jest.fn().mockResolvedValue([{ "PACKAGING_LVL.COMPONENT.CHILD_NM": "test" }]).mockReturnValue(ComponentSearchMock),
    })
    mockedinitializeComponentSearchModel.mockReturnValue({
      find: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      toArray: jest.fn().mockResolvedValue([{ "PACKAGING_LVL.COMPONENT.CHILD_NM": "test" }]).mockReturnValue(ComponentSearchMock),
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
        if (path === '/findComponent') {
          callback(req, res);
        }
      },
      then: jest.fn()
    } as never;
    jest.spyOn(express, 'Router').mockImplementationOnce(() => mRouter);


    ComponentSearchRouter();
  });

  it('Should route to getComponentSeachDetails', async () => {
    mockedProductSearchModel.mockReturnValue({
      findOne: jest.fn().mockResolvedValue([{ "PACKAGING_LVL.COMPONENT.CHILD_NM": "test" }]).mockReturnValue(ComponentSearchMock),
      find: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      toArray: jest.fn().mockResolvedValue([{ "PACKAGING_LVL.COMPONENT.CHILD_NM": "test" }]).mockReturnValue(ComponentSearchMock),
    })
    mockedinitializeComponentSearchModel.mockReturnValue({
      findOne: jest.fn().mockResolvedValue([{ "PACKAGING_LVL.COMPONENT.CHILD_NM": "test" }]).mockReturnValue(ComponentSearchMock),
      find: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      toArray: jest.fn().mockResolvedValue([{ "PACKAGING_LVL.COMPONENT.CHILD_NM": "test" }]).mockReturnValue(ComponentSearchMock),
    })
    const res = mockResponse();
    const req = mockRequest();
    req.params = {
      PCCode: "test"
    }
    req.query = {
      page: "1",
      limit: "1000",
      initialLetters: "PC-000"
    };
    req.header['x-consumer-userId'] = 'ITEST236';
    const mRouter = {
      get: (path, callback) => {
        if (path === '/findComponent/:PCCode') {
          callback(req, res);
        }
      },
      then: jest.fn()
    } as never;
    jest.spyOn(express, 'Router').mockImplementationOnce(() => mRouter);

    ComponentSearchRouter();
  });
});
