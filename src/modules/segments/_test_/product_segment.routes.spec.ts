import ProductSegementsSearchRouter from "../product_segments.routes.js";
import ProductSegmentSearchModel, { initializeProductSegmentSearchModel } from "../product_segments.model.js";
import { mockRequest, mockResponse } from "../../../utils/MockInterceptor.js";
import ProductSegment from "../../../mocks/ProductSegment.mock.json";
import express from "express";

const mockedProductSegmentSearchModel = ProductSegmentSearchModel as jest.Mock;
const mockedInitializeProductSegmentSearchModel = initializeProductSegmentSearchModel as jest.Mock;

jest.mock("../product_segments.model");
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
describe('ProductSegementsSearchRouter', () => {
  
  it('Should route to getProductSegmentSearchDetails', async () => {
   
    mockedProductSegmentSearchModel.mockReturnValue({
      findOne: jest.fn().mockResolvedValue(ProductSegment[0])
    });

    mockedInitializeProductSegmentSearchModel.mockResolvedValue({
      findOne: jest.fn().mockResolvedValue(ProductSegment[0])
    });

    const res = mockResponse();
    const req = mockRequest();
    
    req.body = {
      productSegment: "1.1 Hair - Wash",
      productSubSegment: "1.1.1 Solid (bars, powder, flakes) NO DRY SHAMPOO"
    };
    
    req.header['x-consumer-userId'] = 'ITEST236';

    const mRouter = {
      post: (path: string, callback: (req, res) => void) => {
        if (path === '/getUseDoseValue') {
          callback(req, res);
        }
      },
      then: jest.fn()
    } as never;
    
    jest.spyOn(express, 'Router').mockImplementationOnce(() => mRouter);

     ProductSegementsSearchRouter();
  });




});
