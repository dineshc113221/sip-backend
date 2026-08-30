import { mockRequest, mockResponse } from "../../../utils/MockInterceptor.js";
import { RawMaterialSearchController } from "../rm_search.controller.js";

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
describe("RawMaterialSearchController", () => {
  let controller: RawMaterialSearchController;
  const mockCollection = {
    find: jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      toArray: jest.fn(),
    }),
    findOne: jest.fn(),
  };
  const mockFrmlRawCollection = {
    find: jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      toArray: jest.fn(),
    }),
    findOne: jest.fn(),
  };
  const req = mockRequest();
  const res = mockResponse();

  beforeEach(() => {
    controller = new RawMaterialSearchController(mockCollection,mockFrmlRawCollection);
  });

  it("should return a list of raw material codes based on initialValue query", async () => {
    const mockData = [
      {
        compositions: [
          {
            rawMaterialId: "RAW90019005",
            tradeName: "Purified Water",
          },
        ],
      },
    ];

    req.query = { initialValue: "RAW", page: "1", limit: "10" };
    mockCollection.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      toArray: jest.fn().mockResolvedValue(mockData),
    });

    await controller.getRMSeachCodes(req, res);

  }, 300000);

  it("should return a list of raw material codes based on initialValue query", async () => {
    req.query = { initialValue: "RAW", page: "1", limit: "10" };
    mockCollection.find.mockReturnValue({});

    await controller.getRMSeachCodes(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  }, 300000);

  it("should return raw material details for a valid rmCode", async () => {
    const mockRawMaterial = {
      details: {
        rawMaterialID: "RAW90019005",
        tradeName: "Purified Water",
      },
    };

    req.params = { rmCode: "RAW90019005" };
    mockCollection.findOne.mockResolvedValue(mockRawMaterial);

    await controller.getRMSearchDetails(req, res);
    const regex = new RegExp("RAW90019005", "i"); // 'i' for case-insensitive search

    expect(mockCollection.findOne).toHaveBeenCalledWith(
  {
    $or: [{ "details.rawMaterialID": { $regex: regex } }],
  },
  expect.any(Object) // ← handles { sort: { _id: -1 } }
);

    expect(res.json).toHaveBeenCalledWith({
      rawMaterial: "RAW90019005",
      tradeName: "Purified Water",
    });
  });

  it("should return 404 if raw material details are not found", async () => {
    req.params = { rmCode: "RAW90019005" };
    mockCollection.findOne.mockResolvedValue(null);

    await controller.getRMSearchDetails(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Raw Materials details not found",
    });
  });

  it("should return false when getFormulaRawMaterial does not find the formulaId", async () => {
    const mockFormulaId = "FML1850624A-001";
    mockFrmlRawCollection.findOne.mockResolvedValue(null);

    const result = await controller.getFormulaRawMaterial(mockFormulaId);

    expect(result).toBe(false);
    expect(mockFrmlRawCollection.findOne).toHaveBeenCalledWith(
  { "details.objectKey": mockFormulaId },
  expect.any(Object)
);

  });

  it("should return raw material details when getFormulaRawMaterial finds the formulaId", async () => {
    const mockRawMaterialDetails = {
      details: { objectKey: "FML1850624A-001" },
      compositions: [
        { rawMaterialId: "RAW90019005", tradeName: "Purified Water" },
      ],
    };

    const mockFormulaId = "FML1850624A-001";
    mockFrmlRawCollection.findOne.mockResolvedValue(mockRawMaterialDetails);

    const result = await controller.getFormulaRawMaterial(mockFormulaId);

    expect(result).toEqual(mockRawMaterialDetails);
    expect(mockFrmlRawCollection.findOne).toHaveBeenCalledWith(
  { "details.objectKey": mockFormulaId },
  expect.any(Object)
);

  });
});
