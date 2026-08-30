import { mockRequest, mockResponse } from "../../../utils/MockInterceptor.js";
import initializeProductSegmentSearchController from "../product_segments.controller.js";
import ProductSegmentSearchModel, { initializeProductSegmentSearchModel } from "../product_segments.model.js";

const mockedProductSegmentSearchModel = ProductSegmentSearchModel as jest.Mock;
const mockedinitializeProductSegmentSearchModel = initializeProductSegmentSearchModel as jest.Mock;

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
describe("Product Segment Search Controller", () => {


  it("Should return 404 if no product segment search details found", async () => {

    mockedProductSegmentSearchModel.mockReturnValue({
      findOne: jest.fn().mockResolvedValue(null),
    });
    mockedinitializeProductSegmentSearchModel.mockReturnValue({
      findOne: jest.fn().mockResolvedValue(null),
    });

    const res = mockResponse();
    
    const req = mockRequest();
    req.body = {
      productSegment: "",
      productSubSegment: ""
    };
    req.header['x-consumer-userId'] = 'ITEST236';

    const ProductSegmentSearchController = await initializeProductSegmentSearchController();
    await ProductSegmentSearchController.getProductSegmentSearchDetails(req, res);

    expect(res.status).toHaveBeenCalledWith(404); // Not found

  });

});
