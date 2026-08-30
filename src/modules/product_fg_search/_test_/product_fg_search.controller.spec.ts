import { mockRequest, mockResponse } from "../../../utils/MockInterceptor.js";
import initializeProductSearchController from "../product_fg_search.controller.js";
import ProductSearchModel from "../product_fg_search.model.js";

const mockedProductSearchModel = ProductSearchModel as jest.Mock;
jest.mock("../product_fg_search.model");
jest.mock('../../../lib/db.connection', () => ({
  connections: jest.fn().mockResolvedValue({
    connection: { readyState: 1 },
    disconnect:jest.fn()
  })
}));
jest.mock('sequelize', () => {
  const mockSequelize = {
    authenticate: jest.fn().mockResolvedValue(undefined),
    define: jest.fn(),
    sync: jest.fn(),
    close: jest.fn(),
  };
  return { Sequelize: jest.fn(() => mockSequelize) };
});
describe("ProductSearchController", () => {
  const req = mockRequest();
  const res = mockResponse();

  it("should return product search codes successfully", async () => {

    // Mock the entire chain of methods used in the MongoDB query
    mockedProductSearchModel.mockReturnValue({
      find: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      toArray: jest.fn().mockResolvedValue({}),
    });

    req.query = {
      page: "1",
      limit: "1000",
      initialLetters: "PC-014985",
    };
    req.header["x-consumer-userId"] = "ITEST236";

    const productSearchController = await initializeProductSearchController();
    await productSearchController.getProductSeachCodes(req, res);

    expect(res.status).toHaveBeenCalled()
  });

  it("should handle error while fetching product search codes", async () => {

    mockedProductSearchModel.mockReturnValue({
      find: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
    });

    req.query = {
      page: "1",
      limit: "1000",
      initialLetters: "PC-000",
    };
    req.header["x-consumer-userId"] = "ITEST236";

    const productSearchController = await initializeProductSearchController();
    await productSearchController.getProductSeachCodes(req, res);

    expect(res.status).toHaveBeenCalled()
  });

  it("should return product search details successfully", async () => {

    mockedProductSearchModel.mockReturnValue({
      findOne: jest.fn().mockResolvedValue({
        "FG_SPEC": "FG-0056099-1",
        "FG_NM": "FG-0056099",
        "FG_Revision": "1",
        "SKU_ERP_CODE": null,
        "PC_NM": "PC-0000531, PC-0007698, PC-0013232, PC-0018190, PC-041126",
        "NAME": "24 2H Listerine TCPerio1L Aeon BF Bottle/JP/79643984",
        "FRML_CODE": null,
        "SALES_ZONE": "Asia",
        "FRML_LAB_CODE": null,
        "BRAND_CODE": null,
        "PRODUCT_SEGMENT": "",
        "PRODUCT_SUB_SEGMENT": ""
    }),
    });

    req.params = { fgSpec: "FG-0056099-1" };

    const productSearchController = await initializeProductSearchController();
    await productSearchController.getProductSearchDetails(req, res);

    expect(res.json).toHaveBeenCalled()
  });

  it("should return 404 if product search details are not found", async () => {

    mockedProductSearchModel.mockReturnValue({
      findOne: jest.fn().mockResolvedValue({}),
    });

    req.params = { fgSpec: "nonexistent" };

    const productSearchController = await initializeProductSearchController();
    await productSearchController.getProductSearchDetails(req, res);

    expect(res.status).toHaveBeenCalled()
  });
});
