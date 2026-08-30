import { mockRequest, mockResponse } from "../../../utils/MockInterceptor.js";
import { ProductMock } from "../../../mocks/Product.mock.js";
import ProductModel, { initializeProductModel } from "../product.model.js";
import initializeProductController from "../product.controller.js";
jest.mock('../../../utils/logger', () => {
  return {
    __esModule: true,
    default: {
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
      http: jest.fn(),
      transaction: jest.fn(),
    },
  };
});
jest.mock('../../../utils/logger/logger-config', () => ({
  LOG_DIR: '/dummy/logs',
  combine: jest.fn(),
  timestamp: jest.fn(),
  printf: jest.fn(),
  json: jest.fn(),
  label: jest.fn(),
}));
jest.mock('sequelize', () => {
  const mockSequelize = {
    authenticate: jest.fn().mockResolvedValue(undefined),
    define: jest.fn(() => ({
      upsert:jest.fn(),
    })),
    sync: jest.fn(),
    close: jest.fn(),
  };
  const actualSequelize=jest.requireActual('sequelize')
  return { Sequelize: jest.fn(() => mockSequelize), DataTypes:actualSequelize.DataTypes};
});
jest.mock('../../../lib/db.connection', () => ({
  connections: jest.fn().mockResolvedValue({
    connection: { readyState: 1 },
    disconnect:jest.fn()
  })
}));
jest.mock('pg',() => {
  const mClient = {
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
    connectionParameters: {
      user: '',
      database: '',
      port: '',
      host: '',
    },
  };
  return { Client: jest.fn(() => mClient) };
});
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn().mockResolvedValue({
      messageId: 'mocked-message-id',
    }),
  })),
}));

jest.mock("p-limit", () => {
  return 12;
});
jest.mock("../product.model");
jest.mock("../../formula/formula.model");
jest.mock("../../raw_material_search/rm_search.model");
const mockedProductModel = ProductModel as jest.Mock;
const mockedinitializeProductModel = initializeProductModel as jest.Mock;

jest.mock("../../admin_version/admin.model.js", () => ({
   __esModule: true,               
  default: jest.fn(() => ({})),  
  initializeadminModel: jest.fn().mockResolvedValue(undefined),
}));
 
jest.mock("../../calculation_api/calculation.model.js", () => ({
   __esModule: true,
  default: jest.fn(() => ({})),
  initializeCalculationModel: jest.fn().mockResolvedValue(undefined),
}));

describe("initializeProductController", () => {
  const res = mockResponse();
  const req = mockRequest();
  const next = jest.fn();
  res.locals = {
    user: {
      unique_name: "ITEST123",
      name: "ITEST123",
    },
  };
  req.query = {
    skip: 1,
    sortOrder: -1,
    type: "experiment",
  };
  req.params = {
    id: "66f3b5d7d17ef901390cc805",
    assessmentType: "experimental",
    searchString: "test",
  };
  req.body = {
    shortBrandCode: "JJB",
    formula_number: "TAB2299983A-002",
    type: "baseline",
    name: "Poonam",
    role: "Member",
    mail: "PKadam04@kenvue.com",
    assessmentType: "baseline",
    productId: "66f2930877a89aa14b990958",
    ...ProductMock[0].assessments.baseline,
  };
  req.header["x-consumer-userId"] = "ITEST236";

  it("Should route to pagination for failure message", async () => {
    mockedProductModel.mockReturnValue({});
    mockedinitializeProductModel.mockReturnValue({});
    const productController = await initializeProductController();
    await productController.pagination(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it("Should route to myProductPagination for failure message", async () => {
    mockedProductModel.mockReturnValue({});
    mockedinitializeProductModel.mockReturnValue({});
    const productController = await initializeProductController();
    await productController.myProductPagination(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it("Should route to create for failure message", async () => {
    mockedProductModel.mockReturnValue({});
    mockedinitializeProductModel.mockReturnValue({});
    const productController = await initializeProductController();
    await productController.create(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it("Should route to findById for failure message", async () => {
    mockedProductModel.mockReturnValue({});
    mockedinitializeProductModel.mockReturnValue({});
    const productController = await initializeProductController();
    await productController.findById(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it("Should route to findByIdAndUpdate for failure message", async () => {
    mockedProductModel.mockReturnValue({});
    mockedinitializeProductModel.mockReturnValue({});
    const productController = await initializeProductController();
    await productController.findByIdAndUpdate(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it("Should route to findByIdAndDelete for failure message", async () => {
    mockedProductModel.mockReturnValue({});
    mockedinitializeProductModel.mockReturnValue({});
    const productController = await initializeProductController();
    await productController.findByIdAndDelete(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it("Should handle createAssessment failure", async () => {
    mockedProductModel.mockReturnValue({
      findByIdAndUpdate: jest.fn().mockRejectedValue(new Error("DB Error"))
    });
    const productController = await initializeProductController();
    await productController.createAssessment(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it("Should route to createAssessment for failure message", async () => {
    mockedProductModel.mockReturnValue({
      aggregate: jest.fn().mockReturnThis(),
      findOne: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnValue(ProductMock[0]),
      find: jest.fn().mockReturnValue(ProductMock),
      create: jest.fn().mockReturnValue(ProductMock),
      findByIdAndUpdate: jest.fn().mockReturnValue(ProductMock),
      findOneAndUpdate: jest.fn().mockReturnValue(ProductMock),
      exec: jest
        .fn()
        .mockResolvedValue([{ skip: "test" }])
        .mockReturnValue([]),
    });
    mockedinitializeProductModel.mockReturnValue({
      aggregate: jest.fn().mockReturnThis(),
      findOne: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnValue(ProductMock[0]),
      find: jest.fn().mockReturnValue(ProductMock),
      create: jest.fn().mockReturnValue(ProductMock),
      findByIdAndUpdate: jest.fn().mockReturnValue(ProductMock),
      findOneAndUpdate: jest.fn().mockReturnValue(ProductMock),
      exec: jest
        .fn()
        .mockResolvedValue([{ skip: "test" }])
        .mockReturnValue([]),
    });
    const productController = await initializeProductController();
    await productController.createAssessment(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
  }, 30000);

  it("Should route to updateAssessmentById for failure message", async () => {
    mockedProductModel.mockReturnValue({});
    mockedinitializeProductModel.mockReturnValue({});
    const productController = await initializeProductController();
    await productController.updateAssessmentById(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it("Should route to updateAssessmentById for failure message", async () => {
    mockedProductModel.mockReturnValue({
      aggregate: jest.fn().mockReturnThis(),
      findOne: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnValue(ProductMock[0]),
      find: jest.fn().mockReturnValue(ProductMock),
      create: jest.fn().mockReturnValue(ProductMock),
      findByIdAndUpdate: jest.fn().mockReturnValue(ProductMock),
      findOneAndUpdate: jest.fn().mockReturnValue(ProductMock),
      exec: jest
        .fn()
        .mockResolvedValue([{ skip: "test" }])
        .mockReturnValue([]),
    });
    mockedinitializeProductModel.mockReturnValue({
      aggregate: jest.fn().mockReturnThis(),
      findOne: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnValue(ProductMock[0]),
      find: jest.fn().mockReturnValue(ProductMock),
      create: jest.fn().mockReturnValue(ProductMock),
      findByIdAndUpdate: jest.fn().mockReturnValue(ProductMock),
      findOneAndUpdate: jest.fn().mockReturnValue(ProductMock),
      exec: jest
        .fn()
        .mockResolvedValue([{ skip: "test" }])
        .mockReturnValue([]),
    });
    const productController = await initializeProductController();
    await productController.updateAssessmentById(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("Should route to updateAssessmentById for failure message", async () => {
    mockedProductModel.mockReturnValue({
      aggregate: jest.fn().mockReturnThis(),
      findOne: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnValue(ProductMock[0]),
      find: jest.fn().mockReturnValue(ProductMock),
      create: jest.fn().mockReturnValue(ProductMock),
      findByIdAndUpdate: jest.fn().mockReturnValue(ProductMock),
      findOneAndUpdate: jest.fn().mockReturnValue(ProductMock),
      exec: jest
        .fn()
        .mockResolvedValue([{ skip: "test" }])
        .mockReturnValue(ProductMock),
    });
    mockedinitializeProductModel.mockReturnValue({
      aggregate: jest.fn().mockReturnThis(),
      findOne: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnValue(ProductMock[0]),
      find: jest.fn().mockReturnValue(ProductMock),
      create: jest.fn().mockReturnValue(ProductMock),
      findByIdAndUpdate: jest.fn().mockReturnValue(ProductMock),
      findOneAndUpdate: jest.fn().mockReturnValue(ProductMock),
      exec: jest
        .fn()
        .mockResolvedValue([{ skip: "test" }])
        .mockReturnValue(ProductMock),
    });
    req.body = {
      ...req.body,
      assessmentId: "test",
    };
    const productController = await initializeProductController();
    await productController.updateAssessmentById(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("Should route to deleteAssessmentById for failure message", async () => {
    mockedProductModel.mockReturnValue({});
    mockedinitializeProductModel.mockReturnValue({});
    const productController = await initializeProductController();
    await productController.deleteAssessmentById(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it("Should route to deleteAssessmentById for failure message", async () => {
    mockedProductModel.mockReturnValue({
      aggregate: jest.fn().mockReturnThis(),
      findOne: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnValue(ProductMock[0]),
      find: jest.fn().mockReturnValue(ProductMock),
      create: jest.fn().mockReturnValue(ProductMock),
      findByIdAndUpdate: jest.fn().mockReturnValue(ProductMock),
      findOneAndUpdate: jest.fn().mockReturnValue(ProductMock),
      exec: jest
        .fn()
        .mockResolvedValue([{ skip: "test" }])
        .mockReturnValue([]),
    });
    mockedinitializeProductModel.mockReturnValue({
      aggregate: jest.fn().mockReturnThis(),
      findOne: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnValue(ProductMock[0]),
      find: jest.fn().mockReturnValue(ProductMock),
      create: jest.fn().mockReturnValue(ProductMock),
      findByIdAndUpdate: jest.fn().mockReturnValue(ProductMock),
      findOneAndUpdate: jest.fn().mockReturnValue(ProductMock),
      exec: jest
        .fn()
        .mockResolvedValue([{ skip: "test" }])
        .mockReturnValue([]),
    });
    const productController = await initializeProductController();
    await productController.deleteAssessmentById(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("Should route to deleteAssessmentById for failure message", async () => {
    mockedProductModel.mockReturnValue({
      aggregate: jest.fn().mockReturnThis(),
      findOne: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnValue(ProductMock[0]),
      find: jest.fn().mockReturnValue(ProductMock),
      create: jest.fn().mockReturnValue(ProductMock),
      findByIdAndUpdate: jest.fn().mockReturnValue(ProductMock),
      findOneAndUpdate: jest.fn().mockReturnValue(ProductMock),
      exec: jest
        .fn()
        .mockResolvedValue([{ skip: "test" }])
        .mockReturnValue(ProductMock),
    });
    mockedinitializeProductModel.mockReturnValue({
      aggregate: jest.fn().mockReturnThis(),
      findOne: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnValue(ProductMock[0]),
      find: jest.fn().mockReturnValue(ProductMock),
      create: jest.fn().mockReturnValue(ProductMock),
      findByIdAndUpdate: jest.fn().mockReturnValue(ProductMock),
      findOneAndUpdate: jest.fn().mockReturnValue(ProductMock),
      exec: jest
        .fn()
        .mockResolvedValue([{ skip: "test" }])
        .mockReturnValue(ProductMock),
    });
    req.body = {
      ...req.body,
      assessmentId: "test",
    };
    const productController = await initializeProductController();
    await productController.deleteAssessmentById(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("Should route to addTeamMember for failure message", async () => {
    mockedProductModel.mockReturnValue({});
    mockedinitializeProductModel.mockReturnValue({});
    const productController = await initializeProductController();
    await productController.addTeamMember(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Incorrect Product Id",
    });
  });

  it("Should route to updateMemberById for failure message", async () => {
    mockedProductModel.mockReturnValue({});
    mockedinitializeProductModel.mockReturnValue({});
    const productController = await initializeProductController();
    await productController.updateMemberById(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Incorrect Product Id",
    });
  });

  it("Should route to deleteMemberById for failure message", async () => {
    mockedProductModel.mockReturnValue({});
    mockedinitializeProductModel.mockReturnValue({});
    const productController = await initializeProductController();
    await productController.deleteMemberById(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Incorrect Product Id",
    });
  });

  it("Should route to addEditPackagingDetails for failure message", async () => {
    mockedProductModel.mockReturnValue({});
    mockedinitializeProductModel.mockReturnValue({});
    const productController = await initializeProductController();
    await productController.addEditPackagingDetails(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Incorrect Product Id",
    });
  });

  it("Should route to experimentalAssessmentDetails for failure message", async () => {
    mockedProductModel.mockReturnValue({});
    mockedinitializeProductModel.mockReturnValue({});
    const productController = await initializeProductController();
    await productController.experimentalAssessmentDetails(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Incorrect Product Id",
    });
  });

  it("Should route to addUpdateFormulationDetails for failure message", async () => {
    mockedProductModel.mockReturnValue({});
    mockedinitializeProductModel.mockReturnValue({});
    const productController = await initializeProductController();
    await productController.addUpdateFormulationDetails(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Incorrect Product Id",
    });
  });
});
